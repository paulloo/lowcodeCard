import React, { useState, useCallback, useEffect } from 'react';
import type { EditorComponent } from '../../../../types/editor';
import type { SelectOption } from '../../../../types/template';

interface Props {
  component: EditorComponent | null;
  onChange: (updates: Partial<EditorComponent>) => void;
}

interface SelectOptionsEditorProps {
  value: SelectOption[];
  onChange: (options: SelectOption[]) => void;
}

function SelectOptionsEditor({ value = [], onChange }: SelectOptionsEditorProps) {
  const [options, setOptions] = useState<SelectOption[]>(value);

  // 使用 useEffect 同步外部值
  useEffect(() => {
    setOptions(value);
  }, [value]);

  // 添加新选项
  const handleAddOption = useCallback(() => {
    const newOption: SelectOption = {
      label: `选项 ${options.length + 1}`,
      value: `option-${options.length + 1}`
    };
    const newOptions = [...options, newOption];
    setOptions(newOptions);
    onChange(newOptions);
  }, [options, onChange]);

  // 处理选项更改
  const handleOptionChange = useCallback((index: number, field: keyof SelectOption, newValue: string) => {
    console.log('Updating option:', index, field, newValue);
    const newOptions = options.map((opt, i) => {
      if (i === index) {
        const updatedOption = { ...opt, [field]: newValue };
        console.log('Updated option:', updatedOption);
        return updatedOption;
      }
      return opt;
    });
    console.log('New options:', newOptions);
    setOptions(newOptions);
    onChange(newOptions);
  }, [options, onChange]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-900">选项列表</h4>
        <button
          type="button"
          onClick={handleAddOption}
          className="inline-flex items-center px-2.5 py-1.5 text-sm font-medium
            text-pink-600 bg-pink-50 rounded hover:bg-pink-100 transition-colors"
        >
          添加选项
        </button>
      </div>

      <div className="space-y-3">
        {options.map((option, index) => (
          <div
            key={index}
            className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-1 space-y-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">显示文本</label>
                <input
                  type="text"
                  value={option.label}
                  onChange={e => handleOptionChange(index, 'label', e.target.value)}
                  onBlur={() => onChange(options)} // 失去焦点时确保更新
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded
                    focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  placeholder="输入显示文本"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">选项值</label>
                <input
                  type="text"
                  value={option.value}
                  onChange={e => handleOptionChange(index, 'value', e.target.value)}
                  onBlur={() => onChange(options)} // 失去焦点时确保更新
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded
                    focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  placeholder="输入选项值"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const newOptions = options.filter((_, i) => i !== index);
                setOptions(newOptions);
                onChange(newOptions);
              }}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
            >
              <span className="sr-only">删除</span>
              ×
            </button>
          </div>
        ))}
      </div>

      {options.length === 0 && (
        <div className="text-center py-4 text-sm text-gray-500">
          暂无选项，点击上方按钮添加
        </div>
      )}
    </div>
  );
}

export default function PropertyPanel({ component, onChange }: Props) {
  if (!component) {
    return (
      <div className="p-4 text-center text-gray-500">
        请选择一个组件进行编辑
      </div>
    );
  }

  // 处理选项更改
  const handleOptionsChange = useCallback((options: SelectOption[]) => {
    console.log('Updating component options:', options);
    onChange({
      options: {
        ...component.options,
        items: options
      }
    });
  }, [component.options, onChange]);

  return (
    <div className="space-y-6 p-4">
      {/* 基础属性 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">标签</label>
          <input
            type="text"
            value={component.label}
            onChange={e => onChange({ label: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
              focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
          />
        </div>

        {/* 选择框特有配置 */}
        {component.type === 'select' && (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <SelectOptionsEditor
              value={component.options?.items || []}
              onChange={handleOptionsChange}
            />
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={component.options?.multiple || false}
                  onChange={e => onChange({
                    options: {
                      ...component.options,
                      multiple: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="ml-2 text-sm text-gray-700">允许多选</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={component.options?.searchable || false}
                  onChange={e => onChange({
                    options: {
                      ...component.options,
                      searchable: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="ml-2 text-sm text-gray-700">允许搜索</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 