import { useState, useEffect } from 'react';
import type { EditorComponent } from '../../../types/editor';

interface Props {
  component: EditorComponent;
  onChange: (updates: Partial<EditorComponent>) => void;
  preview?: boolean;
}

export function SwitchComponent({ component, onChange, preview = false }: Props) {
  const [localValue, setLocalValue] = useState<boolean>(
    Boolean(component.defaultValue)
  );

  useEffect(() => {
    setLocalValue(Boolean(component.defaultValue));
  }, [component.defaultValue]);

  if (preview) {
    return (
      <div 
        className="switch-component"
        style={component.style}
      >
        <div className="flex items-center gap-2">
          <div 
            className={`
              w-9 h-5 rounded-full transition-colors
              ${localValue ? 'bg-pink-500' : 'bg-gray-200'}
            `}
          >
            <div 
              className={`
                w-4 h-4 rounded-full bg-white shadow transform transition-transform
                ${localValue ? 'translate-x-4' : 'translate-x-0.5'}
              `}
            />
          </div>
          {(localValue ? component.options?.activeText : component.options?.inactiveText) && (
            <span className="text-sm text-gray-700">
              {localValue ? component.options?.activeText : component.options?.inactiveText}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="switch-component-editor">
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <div
          className={`
            relative w-11 h-6 rounded-full transition-colors
            ${localValue ? 'bg-pink-500' : 'bg-gray-200'}
            ${component.options?.disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={() => {
            if (component.options?.disabled) return;
            const newValue = !localValue;
            setLocalValue(newValue);
            onChange({ defaultValue: newValue });
          }}
        >
          <div 
            className={`
              absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow
              transform transition-transform duration-200
              ${localValue ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </div>
        {(localValue ? component.options?.activeText : component.options?.inactiveText) && (
          <span className="text-sm text-gray-700">
            {localValue ? component.options?.activeText : component.options?.inactiveText}
          </span>
        )}
      </label>
    </div>
  );
} 