import React, { useState, useCallback } from 'react';
import type { Template } from '../../types/template';
import TemplatePreview from '../editor/preview/TemplatePreview';

interface Props {
  templates: Template[];
  selectedId?: string;
  onSelect: (template: Template) => void;
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
}

export default function TemplateList({ 
  templates, 
  selectedId,
  onSelect, 
  onEdit, 
  onDelete 
}: Props) {
  // 添加预览状态
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // 处理选择模板
  const handleSelect = useCallback((template: Template) => {
    onSelect(template);
    setPreviewTemplate(null); // 关闭预览弹窗
  }, [onSelect]);

  return (
    <div className="relative">
      {/* 模板列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <div
            key={template.id}
            className={`
              group relative bg-white rounded-xl shadow-sm overflow-hidden
              transition-all duration-200 hover:shadow-lg
              ${selectedId === template.id ? 'ring-2 ring-pink-500' : 'hover:ring-1 hover:ring-gray-200'}
            `}
          >
            {/* 预览区域 */}
            <div 
              className="aspect-[4/3] p-4 bg-gray-50 cursor-pointer overflow-hidden"
              onClick={() => setPreviewTemplate(template)}
            >
              <div className="w-full h-full relative">
                <TemplatePreview
                  template={template}
                  values={template.fields.reduce((acc, field) => ({
                    ...acc,
                    [field.id]: field.defaultValue
                  }), {})}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 
                  transition-colors duration-200" />
              </div>
            </div>

            {/* 信息区域 */}
            <div className="p-4 border-t border-gray-100">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-pink-500
                    transition-colors duration-200">
                    {template.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {template.content || '暂无描述'}
                  </p>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(template)}
                    className="flex-1 px-3 py-2 bg-pink-500 text-white rounded-lg
                      hover:bg-pink-600 transition-colors text-sm font-medium"
                  >
                    使用模板
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(template);
                    }}
                    className="px-3 py-2 text-gray-700 bg-gray-100 rounded-lg
                      hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(template);
                    }}
                    className="px-3 py-2 text-red-600 bg-red-50 rounded-lg
                      hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 模板预览弹窗 */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-medium text-gray-900">
                  {previewTemplate.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {previewTemplate.content || '暂无描述'}
                </p>
              </div>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setPreviewTemplate(null)}
              >
                <span className="sr-only">关闭</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden mb-6">
                <TemplatePreview
                  template={convertToEditorTemplate(previewTemplate)}
                  values={previewTemplate.fields.reduce((acc, field) => ({
                    ...acc,
                    [field.id]: field.defaultValue
                  }), {})}
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setPreviewTemplate(null)}
                >
                  取消
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg
                    hover:bg-pink-600 focus:outline-none focus:ring-2 
                    focus:ring-pink-500 focus:ring-offset-2"
                  onClick={() => handleSelect(previewTemplate)}
                >
                  使用此模板
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 添加类型转换函数
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