import { useState, useEffect } from 'react';
import type { EditorComponent } from '../../../types/editor';

interface Props {
  component: EditorComponent;
  onChange: (updates: Partial<EditorComponent>) => void;
  preview?: boolean;
}

export function ColorComponent({ component, onChange, preview = false }: Props) {
  const [localValue, setLocalValue] = useState(component.defaultValue || '#000000');

  useEffect(() => {
    setLocalValue(component.defaultValue || '#000000');
  }, [component.defaultValue]);

  if (preview) {
    return (
      <div 
        className="color-component"
        style={component.style}
      >
        <div 
          className="w-6 h-6 rounded-full border border-gray-200"
          style={{ backgroundColor: localValue }}
        />
      </div>
    );
  }

  return (
    <div className="color-component-editor">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={localValue}
          onChange={(e) => {
            setLocalValue(e.target.value);
            onChange({ defaultValue: e.target.value });
          }}
          className="w-10 h-10 rounded-lg cursor-pointer"
        />
        <input
          type="text"
          value={localValue}
          onChange={(e) => {
            setLocalValue(e.target.value);
            onChange({ defaultValue: e.target.value });
          }}
          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 
            focus:border-pink-500"
        />
      </div>

      {component.options?.presetColors && (
        <div className="mt-2 flex flex-wrap gap-1">
          {component.options.presetColors.map((color) => (
            <button
              key={color}
              onClick={() => {
                setLocalValue(color);
                onChange({ defaultValue: color });
              }}
              className="w-6 h-6 rounded-full border border-gray-200 hover:border-pink-500
                transition-colors"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
} 