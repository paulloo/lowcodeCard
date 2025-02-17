import { useState } from 'react';
import type { Template, TemplateField } from '../types/template';
import PreviewFieldControl from './PreviewFieldControl';

interface Props {
  template: Template;
  variables: Record<string, any>;
  onChange: (variables: Record<string, any>) => void;
}

export default function TemplatePreviewController({ template, variables, onChange }: Props) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  // 按组分类字段
  const groupedFields = template.fields.reduce((acc, field) => {
    const group = field.options?.group || '基本设置';
    if (!acc[group]) acc[group] = [];
    acc[group].push(field);
    return acc;
  }, {} as Record<string, TemplateField[]>);

  const handleValueChange = (fieldId: string, value: any) => {
    onChange({
      ...variables,
      [fieldId]: value
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium text-gray-800">预览控制</h3>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-6">
          {Object.entries(groupedFields).map(([group, fields]) => (
            <div key={group} className="space-y-4">
              <button
                onClick={() => setActiveGroup(activeGroup === group ? null : group)}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <span className="font-medium text-gray-700">{group}</span>
                <svg
                  className={`w-5 h-5 transform transition-transform ${
                    activeGroup === group ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {activeGroup === group && (
                <div className="space-y-4 pl-4">
                  {fields.map(field => (
                    <PreviewFieldControl
                      key={field.id}
                      field={field}
                      value={variables[field.id]}
                      onChange={value => handleValueChange(field.id, value)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 快速操作 */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <button
            onClick={() => onChange(generateDefaultValues(template.fields))}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            重置默认值
          </button>
          <button
            onClick={() => onChange(generateRandomValues(template.fields))}
            className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            随机预览
          </button>
        </div>
      </div>
    </div>
  );
}

// 生成默认值
function generateDefaultValues(fields: TemplateField[]): Record<string, any> {
  return fields.reduce((acc, field) => {
    acc[field.id] = field.defaultValue ?? getDefaultValueByType(field.type, field.options);
    return acc;
  }, {} as Record<string, any>);
}

// 生成随机值
function generateRandomValues(fields: TemplateField[]): Record<string, any> {
  return fields.reduce((acc, field) => {
    acc[field.id] = getRandomValueByType(field.type, field.options);
    return acc;
  }, {} as Record<string, any>);
}

// 根据字段类型获取默认值
function getDefaultValueByType(type: string, options?: any): any {
  switch (type) {
    case 'text':
      return '';
    case 'number':
      return options?.min ?? 0;
    case 'boolean':
      return false;
    case 'color':
      return '#000000';
    case 'select':
      return options?.choices?.[0] ?? '';
    case 'image':
      return '';
    default:
      return null;
  }
}

// 根据字段类型生成随机值
function getRandomValueByType(type: string, options?: any): any {
  switch (type) {
    case 'text':
      return `示例文本 ${Math.random().toString(36).slice(2, 8)}`;
    case 'number':
      const min = options?.min ?? 0;
      const max = options?.max ?? 100;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    case 'boolean':
      return Math.random() > 0.5;
    case 'color':
      return `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
    case 'select':
      const choices = options?.choices ?? [];
      return choices[Math.floor(Math.random() * choices.length)] ?? '';
    case 'image':
      // 返回一个随机的示例图片URL
      const demoImages = [
        '/preview/demo1.jpg',
        '/preview/demo2.jpg',
        '/preview/demo3.jpg'
      ];
      return demoImages[Math.floor(Math.random() * demoImages.length)];
    default:
      return null;
  }
} 