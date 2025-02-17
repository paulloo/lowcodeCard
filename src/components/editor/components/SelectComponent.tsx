import { useState, useEffect } from 'react';
import type { EditorComponent } from '../../../types/editor';

interface Props {
  component: EditorComponent;
  onChange: (updates: Partial<EditorComponent>) => void;
  preview?: boolean;
}

export function SelectComponent({ component, onChange, preview = false }: Props) {
  const [localValue, setLocalValue] = useState<string | string[]>(
    component.defaultValue || (component.options?.multiple ? [] : '')
  );

  useEffect(() => {
    setLocalValue(component.defaultValue || (component.options?.multiple ? [] : ''));
  }, [component.defaultValue, component.options?.multiple]);

  if (preview) {
    const selectedOption = component.options?.options?.find(
      opt => opt.value === localValue
    );
    return (
      <div 
        className="select-component"
        style={component.style}
      >
        {selectedOption?.label || component.options?.placeholder || '请选择'}
      </div>
    );
  }

  return (
    <div className="select-component-editor">
      {component.options?.multiple ? (
        <div className="space-y-2">
          {component.options?.options?.map((option) => (
            <label key={option.value} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(localValue as string[]).includes(option.value.toString())}
                onChange={(e) => {
                  const newValue = e.target.checked
                    ? [...(localValue as string[]), option.value.toString()]
                    : (localValue as string[]).filter(v => v !== option.value.toString());
                  setLocalValue(newValue);
                  onChange({ defaultValue: newValue });
                }}
                className="rounded text-pink-500 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      ) : (
        <select
          value={localValue as string}
          onChange={(e) => {
            setLocalValue(e.target.value);
            onChange({ defaultValue: e.target.value });
          }}
          disabled={component.options?.disabled}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 
            focus:border-pink-500 disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="">{component.options?.placeholder || '请选择'}</option>
          {component.options?.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
} 