import { useState, useEffect, useRef, useCallback } from 'react';
import type { Template, TemplateValues, TemplateField } from '../types/template';
import { TemplateParser } from '../services/template/TemplateParser';
import CodeEditor from './CodeEditor';
import TemplateRenderer from './editor/preview/TemplateRenderer';
import type { CodeEditorRef } from './CodeEditor';
import { ImageService } from '../services/image/ImageService';
import TemplateFieldEditor from './TemplateFieldEditor';
import FieldsHelpDialog from './FieldsHelpDialog';
import TemplatePreviewController from './TemplatePreviewController';
import { TemplateManager } from '../services/template/TemplateManager';
import TemplateVisualEditor from './editor/TemplateVisualEditor';
import CodeEditPanel from './CodeEditPanel';
import TemplatePreview from './editor/preview/TemplatePreview';

// 添加预览值生成函数
const generatePreviewValues = (fields: TemplateField[]) => {
  return fields.reduce((acc, field) => {
    let defaultValue;
    switch (field.type) {
      case 'text':
        defaultValue = field.defaultValue || `示例${field.label}`;
        break;
      case 'image':
        defaultValue = field.defaultValue || '/preview/placeholder.jpg';
        break;
      case 'color':
        defaultValue = field.defaultValue || '#ff69b4';
        break;
      case 'select':
        defaultValue = field.defaultValue || field.options?.items?.[0]?.value || '';
        break;
      default:
        defaultValue = field.defaultValue;
    }
    return {
      ...acc,
      [field.id]: defaultValue
    };
  }, {});
};

interface Props {
  template: Template | null;
  onSave: (template: Template) => void;
  onCancel: () => void;
}

export default function TemplateEditor({ template: initialTemplate, onSave, onCancel }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template>(() => {
    if (initialTemplate) {
      return { ...initialTemplate };
    }
    // 创建新模板的默认值
    return {
      id: `template_${Date.now()}`,
      name: '新建模板',
      type: 'custom',
      description: '',
      fields: [],
      variables: {
        images: {
          self: '',
          partner: '',
          background: ''
        },
        message: '',
        styles: {
          colors: ['#FF69B4', '#FFB6C1'],
          effects: []
        }
      },
      html: `
        <div class="template-container">
          <div class="photos">
            {{#if images.self}}
              <img src="{{images.self}}" alt="自己" />
            {{/if}}
            {{#if images.partner}}
              <img src="{{images.partner}}" alt="对方" />
            {{/if}}
          </div>
          <div class="message">{{message}}</div>
        </div>
      `,
      css: `
        .template-container {
          width: 100%;
          height: 100%;
          padding: 20px;
          background: linear-gradient(135deg, {{styles.colors.[0]}}, {{styles.colors.[1]}});
        }
        .photos {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        .photos img {
          width: 150px;
          height: 150px;
          object-fit: cover;
          border-radius: 10px;
        }
        .message {
          color: white;
          text-align: center;
          font-size: 18px;
        }
      `,
      version: '1.0.0',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  });

  const [previewVariables, setPreviewVariables] = useState<Record<string, any>>(() => 
    generatePreviewVariables(editingTemplate.fields || [])
  );

  const [activeTab, setActiveTab] = useState<'fields' | 'code' | 'preview'>('fields');
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'css' | 'script'>('html');
  const [showVariables, setShowVariables] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [showFieldsHelp, setShowFieldsHelp] = useState(false);

  // 为每个编辑器创建独立的 ref
  const htmlEditorRef = useRef<CodeEditorRef>(null);
  const cssEditorRef = useRef<CodeEditorRef>(null);
  const scriptEditorRef = useRef<CodeEditorRef>(null);

  // 记住最后一个活跃的编辑器
  const [lastActiveEditor, setLastActiveEditor] = useState<'html' | 'css' | 'script'>('html');

  const [editMode, setEditMode] = useState<'visual' | 'code'>('visual');
  const [codeValue, setCodeValue] = useState('');

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 加载模板数据
  useEffect(() => {
    const loadTemplate = async () => {
      if (!initialTemplate) {
        setLoading(false);
        return;
      }

      try {
        const templateManager = TemplateManager.getInstance();
        const loadedTemplate = await templateManager.getTemplate(initialTemplate.id);
        
        if (loadedTemplate) {
          setEditingTemplate(loadedTemplate);
        } else {
          setError('模板不存在');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载模板失败');
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [initialTemplate]);

  // 处理编辑器获得焦点
  const handleEditorFocus = (tab: 'html' | 'css' | 'script') => {
    setLastActiveEditor(tab);
  };

  const insertToEditor = (text: string) => {
    // 使用最后活跃的编辑器
    const currentEditor = {
      html: htmlEditorRef,
      css: cssEditorRef,
      script: scriptEditorRef
    }[lastActiveEditor]?.current?.getEditor();

    if (currentEditor) {
      const position = currentEditor.getPosition();
      if (position) {
        currentEditor.executeEdits('', [{
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          },
          text
        }]);
        // 保持编辑器焦点
        setTimeout(() => {
          currentEditor.focus();
          // 移动光标到插入的文本后面
          currentEditor.setPosition({
            lineNumber: position.lineNumber,
            column: position.column + text.length
          });
        }, 0);
      }
    }
  };

  // 处理模板更改
  const handleTemplateChange = useCallback((changes: Partial<Template>) => {
    setEditingTemplate(prev => {
      const updated = {
        ...prev,
        ...changes,
        updatedAt: Date.now()
      };
      // 检测是否有实际变化
      const hasChanges = JSON.stringify(initialTemplate) !== JSON.stringify(updated);
      setHasUnsavedChanges(hasChanges);
      return updated;
    });
  }, [initialTemplate]);

  // 处理可视化编辑器的更改
  const handleVisualChange = useCallback((updates: Partial<Template>) => {
    console.log('Visual editor updates:', updates);
    handleTemplateChange(updates);
  }, [handleTemplateChange]);

  // 处理取消编辑
  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      if (window.confirm('有未保存的更改，确定要放弃吗？')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  }, [hasUnsavedChanges, onCancel]);

  // 处理保存
  const handleSave = useCallback(async () => {
    if (!editingTemplate) return;
    
    try {
      // 1. 基础验证
      if (!editingTemplate.name.trim()) {
        alert('请输入模板名称');
        return;
      }

      if (editingTemplate.fields.length === 0) {
        alert('请至少添加一个字段');
        return;
      }

      // 2. 字段验证
      const fieldErrors = editingTemplate.fields.reduce((errors, field, index) => {
        // 2.1 基础字段验证
        if (!field.label?.trim()) {
          errors.push(`第 ${index + 1} 个字段缺少标签名称`);
        }
        if (!field.id?.trim()) {
          errors.push(`第 ${index + 1} 个字段缺少唯一标识`);
        }

        // 2.2 选择框特殊验证
        if (field.type === 'select') {
          // 检查选项配置是否存在
          if (!field.options?.items) {
            errors.push(`字段"${field.label || field.id || `第 ${index + 1} 个字段`}"未配置选项列表`);
            return errors;
          }

          const items = field.options.items;
          
          // 检查选项列表是否为数组
          if (!Array.isArray(items)) {
            errors.push(`字段"${field.label || field.id}"的选项列表格式无效`);
            return errors;
          }

          // 检查是否有选项
          if (items.length === 0) {
            errors.push(`字段"${field.label || field.id}"的选项列表为空，请至少添加一个选项`);
            return errors;
          }

          // 检查每个选项的有效性
          items.forEach((item, itemIndex) => {
            if (!item || typeof item !== 'object') {
              errors.push(`字段"${field.label || field.id}"的第 ${itemIndex + 1} 个选项无效`);
              return;
            }

            if (!item.label?.toString().trim()) {
              errors.push(`字段"${field.label || field.id}"的第 ${itemIndex + 1} 个选项缺少显示文本`);
            }

            if (!item.value?.toString().trim()) {
              errors.push(`字段"${field.label || field.id}"的第 ${itemIndex + 1} 个选项缺少选项值`);
            }
          });
        }

        return errors;
      }, [] as string[]);

      // 如果有错误，显示所有错误信息
      if (fieldErrors.length > 0) {
        alert(
          '表单验证失败：\n\n' + 
          fieldErrors.map(err => `• ${err}`).join('\n') +
          '\n\n请修复以上问题后重试。'
        );
        return;
      }

      // 3. 保存模板
      console.log('验证通过，准备保存模板:', editingTemplate);
      await onSave(editingTemplate);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('保存模板失败:', error);
      alert('保存失败，请重试');
    }
  }, [editingTemplate, onSave]);

  const handleAddField = () => {
    const newField: TemplateField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: '新字段',
      defaultValue: '',
      required: false,
    };

    setEditingTemplate(prev => ({
      ...prev,
      fields: [...(prev.fields || []), newField]
    }));
  };

  const handleFieldChange = (index: number, field: TemplateField) => {
    setEditingTemplate(prev => ({
      ...prev,
      fields: prev.fields?.map((f, i) => i === index ? field : f)
    }));
  };

  const handleFieldDelete = (index: number) => {
    setEditingTemplate(prev => ({
      ...prev,
      fields: prev.fields?.filter((_, i) => i !== index)
    }));
  };

  // 处理预览值变化
  const handlePreviewValueChange = (fieldId: string, value: any) => {
    setPreviewVariables(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  // 移除静态模板变量和CSS片段
  const getVariablesByType = () => {
    if (!editingTemplate.fields) return {};

    return editingTemplate.fields.reduce((acc, field) => {
      const category = getFieldCategory(field.type);
      if (!acc[category]) acc[category] = [];
      
      acc[category].push({
        label: field.label,
        value: `{{${field.id}}}`,
        description: field.description,
        documentation: `
类型: ${field.type}
${field.required ? '必填' : '可选'}
${field.description ? '\n' + field.description : ''}
${field.options ? '\n选项: ' + JSON.stringify(field.options, null, 2) : ''}
        `.trim()
      });

      // 为颜色字段添加CSS变量
      if (field.type === 'color') {
        if (!acc['样式']) acc['样式'] = [];
        acc['样式'].push({
          label: `${field.label} (CSS变量)`,
          value: `var(--${field.id})`,
          description: `CSS变量: ${field.label}`,
          documentation: field.description
        });
      }

      return acc;
    }, {} as Record<string, Array<{
      label: string;
      value: string;
      description?: string;
      documentation?: string;
    }>>);
  };

  // 获取字段类别
  const getFieldCategory = (type: string): string => {
    switch (type) {
      case 'text':
        return '文本';
      case 'image':
        return '图片';
      case 'color':
        return '颜色';
      case 'select':
        return '选择';
      case 'number':
        return '数字';
      case 'boolean':
        return '开关';
      default:
        return '其他';
    }
  };

  // 获取字段相关的代码片段
  const getFieldSnippets = () => {
    if (!editingTemplate.fields) return {};

    const snippets: Record<string, Array<{
      label: string;
      value: string;
      description?: string;
    }>> = {};

    // 根据字段类型生成相应的代码片段
    editingTemplate.fields.forEach(field => {
      const category = getFieldCategory(field.type);
      if (!snippets[category]) snippets[category] = [];

      switch (field.type) {
        case 'image':
          snippets[category].push({
            label: `${field.label}容器`,
            value: `
<div class="${field.id}-container">
  <img src="{{${field.id}}}" alt="${field.label}" />
</div>

.${field.id}-container {
  width: 200px;
  height: 200px;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.${field.id}-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}`.trim(),
            description: `带有基本样式的${field.label}容器`
          });
          break;

        case 'text':
          snippets[category].push({
            label: `${field.label}容器`,
            value: `
<div class="${field.id}-container">
  <p>{{${field.id}}}</p>
</div>

.${field.id}-container {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  font-size: 1.125rem;
  line-height: 1.75;
  text-align: center;
  color: #1f2937;
}`.trim(),
            description: `带有基本样式的${field.label}容器`
          });
          break;

        case 'color':
          snippets[category].push({
            label: `${field.label}渐变`,
            value: `background: linear-gradient(135deg, var(--${field.id}), var(--${field.id}-light));`,
            description: `使用${field.label}的渐变背景`
          });
          break;
      }
    });

    // 添加一些通用布局片段
    snippets['布局'] = [
      {
        label: 'Flex 居中布局',
        value: `
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
gap: 2rem;`.trim(),
        description: '垂直居中的弹性布局'
      },
      {
        label: 'Grid 布局',
        value: `
display: grid;
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
gap: 1rem;`.trim(),
        description: '响应式网格布局'
      }
    ];

    return snippets;
  };

  // 处理代码更新
  const handleCodeChange = useCallback((code: string) => {
    try {
      const parsed = JSON.parse(code);
      // 确保字段包含必要的属性
      const fields = parsed.fields?.map((field: any) => ({
        ...field,
        style: field.style || {},
        options: field.options || {}
      })) || [];

      setEditingTemplate(prev => ({
        ...prev,
        ...parsed,
        fields
      }));
      setCodeValue(code);
    } catch (error) {
      console.error('解析代码失败:', error);
    }
  }, []);

  // 添加代码格式化功能
  const formatCode = useCallback(() => {
    try {
      const parsed = JSON.parse(codeValue);
      setCodeValue(JSON.stringify(parsed, null, 2));
    } catch (error) {
      console.error('格式化代码失败:', error);
    }
  }, [codeValue]);

  // 添加实时预览
  useEffect(() => {
    if (editMode === 'code') {
      const timer = setTimeout(() => {
        try {
          const parsed = JSON.parse(codeValue);
          setEditingTemplate(prev => ({
            ...prev,
            ...parsed
          }));
        } catch (error) {
          // 忽略解析错误
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [codeValue, editMode]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent"></div>
            <span className="text-gray-700">加载中...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50
      flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh]
        flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-xl font-medium">
              {initialTemplate ? '编辑模板' : '新建模板'}
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">
                {editMode === 'visual' ? '可视化编辑模式' : '代码编辑模式'}
              </p>
              {hasUnsavedChanges && (
                <span className="text-sm text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">
                  有未保存的更改
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditMode(mode => mode === 'code' ? 'visual' : 'code')}
              className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-md
                transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50"
            >
              切换到{editMode === 'code' ? '可视化' : '代码'}编辑
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-md
                transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className={`px-4 py-1.5 rounded-md transition-colors
                focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50
                ${hasUnsavedChanges
                  ? 'bg-pink-500 text-white hover:bg-pink-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              保存
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {editMode === 'visual' ? (
            <TemplateVisualEditor
              template={editingTemplate}
              onChange={handleVisualChange}
              onSave={handleSave}
            />
          ) : (
            <div className="grid grid-cols-2 h-full">
              <CodeEditor
                value={codeValue}
                onChange={handleCodeChange}
                language="json"
              />
              <div className="border-l border-gray-200 p-4 overflow-auto">
                <h3 className="text-lg font-medium mb-4">实时预览</h3>
                <TemplatePreview
                  template={editingTemplate}
                  values={generatePreviewValues(editingTemplate.fields)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 帮助对话框 */}
      {showFieldsHelp && (
        <FieldsHelpDialog onClose={() => setShowFieldsHelp(false)} />
      )}
    </div>
  );
}

// 生成预览变量
function generatePreviewVariables(fields: TemplateField[]): Record<string, any> {
  return fields.reduce((acc, field) => {
    acc[field.id] = generatePreviewValue(field);
    return acc;
  }, {} as Record<string, any>);
}

// 根据字段类型生成预览值
function generatePreviewValue(field: TemplateField): any {
  switch (field.type) {
    case 'text':
      return field.defaultValue || `示例${field.label}`;
    case 'image':
      return field.defaultValue || '/preview/placeholder.jpg';
    case 'color':
      return field.defaultValue || '#ff69b4';
    case 'select':
      return field.defaultValue || field.options?.items?.[0]?.value || '';
    case 'number':
      return field.defaultValue || 0;
    case 'boolean':
      return field.defaultValue || false;
    default:
      return field.defaultValue;
  }
} 