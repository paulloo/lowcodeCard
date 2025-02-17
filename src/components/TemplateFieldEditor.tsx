import { useState } from 'react';
import type { TemplateField, FieldType } from '../types/template';

interface Props {
  field: TemplateField;
  onChange: (field: TemplateField) => void;
  onDelete: () => void;
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: '文本' },
  { value: 'image', label: '图片' },
  { value: 'color', label: '颜色' },
  { value: 'select', label: '选择' },
  { value: 'number', label: '数字' },
  { value: 'boolean', label: '开关' },
  { value: 'group', label: '分组' }
];

export default function TemplateFieldEditor({ field, onChange, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (updates: Partial<TemplateField>) => {
    onChange({ ...field, ...updates });
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={field.type}
            onChange={e => handleChange({ type: e.target.value as FieldType })}
            className="px-3 py-2 border rounded-lg"
          >
            {FIELD_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={field.label}
            onChange={e => handleChange({ label: e.target.value })}
            placeholder="字段名称"
            className="px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d={expanded 
                  ? "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  : "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                }
              />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-500 hover:text-red-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                字段ID
              </label>
              <input
                type="text"
                value={field.id}
                onChange={e => handleChange({ id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                描述
              </label>
              <input
                type="text"
                value={field.description || ''}
                onChange={e => handleChange({ description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              默认值
            </label>
            {field.type === 'select' ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={field.options?.choices?.join(', ') || ''}
                  onChange={e => handleChange({
                    options: {
                      ...field.options,
                      choices: e.target.value.split(',').map(s => s.trim())
                    }
                  })}
                  placeholder="选项，用逗号分隔"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.options?.multiple || false}
                    onChange={e => handleChange({
                      options: {
                        ...field.options,
                        multiple: e.target.checked
                      }
                    })}
                    className="rounded text-pink-500"
                  />
                  <span className="text-sm text-gray-700">允许多选</span>
                </div>
              </div>
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                value={field.defaultValue || ''}
                onChange={e => handleChange({
                  defaultValue: field.type === 'number'
                    ? parseFloat(e.target.value)
                    : e.target.value
                })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            )}
          </div>

          {field.type === 'number' && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  最小值
                </label>
                <input
                  type="number"
                  value={field.options?.min || ''}
                  onChange={e => handleChange({
                    options: {
                      ...field.options,
                      min: parseFloat(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  最大值
                </label>
                <input
                  type="number"
                  value={field.options?.max || ''}
                  onChange={e => handleChange({
                    options: {
                      ...field.options,
                      max: parseFloat(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  步长
                </label>
                <input
                  type="number"
                  value={field.options?.step || ''}
                  onChange={e => handleChange({
                    options: {
                      ...field.options,
                      step: parseFloat(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={field.required || false}
              onChange={e => handleChange({ required: e.target.checked })}
              className="rounded text-pink-500"
            />
            <span className="text-sm text-gray-700">必填</span>
          </div>
        </div>
      )}
    </div>
  );
} 