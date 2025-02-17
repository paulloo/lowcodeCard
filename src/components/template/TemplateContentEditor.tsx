import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Template } from '../../types/template';
import type { Template as EditorTemplate } from '../../types/editor';
import TemplateFormField from './TemplateFormField';
import TemplatePreview from '../editor/preview/TemplatePreview';

interface Props {
  template: Template;
  onSave: (values: Record<string, any>) => Promise<boolean>;
  onImageUpload?: (file: File) => Promise<string>;
}

function convertToEditorTemplate(template: Template): EditorTemplate {
  return {
    ...template,
    fields: template.fields.map(field => ({
      ...field,
      style: field.style || {
        margin: '',
        padding: '',
        width: '',
        textAlign: undefined
      }
    }))
  };
}

export default function TemplateContentEditor({ template, onSave, onImageUpload }: Props) {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const templateContainerRef = useRef<HTMLDivElement>(null);
  const [previewHeight, setPreviewHeight] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 表单值状态
  const [values, setValues] = useState<Record<string, any>>(() => 
    template.fields.reduce((acc, field) => ({
      ...acc,
      [field.id]: field.defaultValue
    }), {})
  );

  // 更新预览区域高度
  useEffect(() => {
    const updatePreviewHeight = () => {
      if (templateContainerRef.current) {
        const container = templateContainerRef.current;
        const content = container.firstElementChild;
        
        if (content) {
          // 获取实际内容高度
          const contentHeight = content.scrollHeight;
          // 获取容器宽度
          const containerWidth = container.offsetWidth;
          // 计算最小高度（4:3 比例）
          const minHeight = containerWidth * (3/4);
          // 使用内容高度和最小高度中的较大值
          setPreviewHeight(Math.max(contentHeight, minHeight));
        }
      }
    };

    // 初始更新
    updatePreviewHeight();

    // 创建 ResizeObserver 监听容器尺寸变化
    const resizeObserver = new ResizeObserver(updatePreviewHeight);
    if (templateContainerRef.current) {
      resizeObserver.observe(templateContainerRef.current);
    }

    // 创建 MutationObserver 监听内容变化
    const mutationObserver = new MutationObserver(updatePreviewHeight);
    if (templateContainerRef.current) {
      mutationObserver.observe(templateContainerRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true
      });
    }

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  // 处理字段值变化
  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  }, []);

  // 处理表单提交
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("开始提交表单...");

    try {
      setIsSubmitting(true);

      // 验证必填字段
      const missingFields = template.fields
        .filter(field => {
          if (!field.required) return false;
          const value = values[field.id];
          
          // 根据字段类型进行验证
          switch (field.type) {
            case 'text':
            case 'select':
              return !value?.toString().trim();
            case 'image':
              return !value;
            case 'color':
              return !value?.match(/^#[0-9A-Fa-f]{6}$/);
            default:
              return !value;
          }
        })
        .map(field => field.label);

      if (missingFields.length > 0) {
        alert(`请填写以下必填字段：\n${missingFields.join('\n')}`);
        setIsSubmitting(false);
        return;
      }

      // 处理图片上传
      const processedValues = { ...values };
      const imageFields = template.fields.filter(field => field.type === 'image');
      
      // 如果有图片字段且提供了上传处理函数
      if (imageFields.length > 0 && onImageUpload) {
        console.log("开始处理图片上传...");
        await Promise.all(
          imageFields.map(async field => {
            const file = values[field.id];
            if (file instanceof File) {
              try {
                console.log(`上传图片: ${field.label}`);
                const url = await onImageUpload(file);
                processedValues[field.id] = url;
                console.log(`图片上传成功: ${url}`);
              } catch (error) {
                console.error(`上传图片失败: ${field.label}`, error);
                throw new Error(`上传图片"${field.label}"失败`);
              }
            }
          })
        );
      }

      console.log("表单验证通过，准备保存:", processedValues);
      
      try {
        const success = await onSave(processedValues);
        console.log("保存操作完成，结果:", success);
        
        if (success) {
          console.log("保存成功");
        } else {
          console.log("保存被取消或失败");
          throw new Error("保存失败");
        }
      } catch (error) {
        console.error("保存过程中出错:", error);
        throw error;
      }
    } catch (error) {
      console.error('生成贺卡失败:', error);
      alert(error instanceof Error ? error.message : '生成贺卡失败，请重试');
    } finally {
      console.log("提交处理完成，重置提交状态");
      setIsSubmitting(false);
    }
  }, [template.fields, values, onSave, onImageUpload]);

  return (
    <div className="grid lg:grid-cols-2 gap-8 h-full bg-gray-50">
      {/* 左侧表单区域 */}
      <div className="lg:overflow-auto lg:h-[calc(100vh-4rem)] p-6">
        <div className="max-w-xl mx-auto">
          {/* 表单标题 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {template.name}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              自定义贺卡内容，预览区域会实时更新
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 字段分组 */}
            <div className="space-y-6">
              {template.fields.map((field, index) => (
                <div 
                  key={field.id}
                  className={`
                    bg-white rounded-lg shadow-sm p-6 space-y-4
                    transition-all duration-200 hover:shadow-md
                    ${field.required ? 'border-l-4 border-pink-500' : ''}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <label 
                        htmlFor={field.id}
                        className="block text-sm font-medium text-gray-900"
                      >
                        {field.label}
                        {field.required && (
                          <span className="ml-1 text-pink-500">*</span>
                        )}
                      </label>
                      {field.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {field.description}
                        </p>
                      )}
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full 
                      text-xs font-medium bg-gray-100 text-gray-800">
                      {index + 1}/{template.fields.length}
                    </span>
                  </div>

                  <div className="mt-2">
                    <TemplateFormField
                      field={field}
                      value={values[field.id]}
                      onChange={value => handleFieldChange(field.id, value)}
                      onImageUpload={async (file: File) => {
                        if (onImageUpload) {
                          try {
                            const url = await onImageUpload(file);
                            return url;
                          } catch (error) {
                            console.error('上传图片失败:', error);
                            alert('上传图片失败，请重试');
                            throw error;
                          }
                        }
                        return '';
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 提交按钮 */}
            <div className="sticky bottom-0 bg-gray-50 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {isSubmitting ? '正在生成...' : '确认内容无误后点击生成'}
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    inline-flex items-center px-6 py-3 rounded-lg text-white 
                    font-medium shadow-lg transform transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
                    ${isSubmitting 
                      ? 'bg-pink-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 hover:-translate-y-0.5'
                    }
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin mr-2 h-5 w-5 border-2 
                        border-white border-t-transparent rounded-full" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      生成贺卡
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* 右侧预览区域 */}
      <div className="hidden lg:block lg:h-[calc(100vh-4rem)] p-6">
        <div className="sticky top-6 space-y-6 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              实时预览
            </h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full 
              text-sm font-medium bg-green-100 text-green-800">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500" />
              实时更新中
            </span>
          </div>

          {/* 预览容器 */}
          <div 
            ref={previewContainerRef}
            className="bg-gray-50 rounded-lg overflow-hidden"
          >
            <div 
              ref={templateContainerRef}
              className="relative template-container"
              style={{ 
                minHeight: previewHeight,
                height: 'auto',
                transition: 'min-height 0.3s ease'
              }}
            >
              <TemplatePreview
                template={convertToEditorTemplate(template)}
                values={values}
              />
            </div>
          </div>

          {/* 预览提示 */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  预览说明
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>左侧修改内容会实时更新预览</li>
                    <li>可以随时调整文字和图片</li>
                    <li>确认效果满意后点击生成贺卡</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 