import { useState, useEffect } from 'react';
import type { EditorComponent } from '../../../types/editor';

interface Props {
  component: EditorComponent;
  onChange: (updates: Partial<EditorComponent>) => void;
  preview?: boolean;
}

export function SliderComponent({ component, onChange, preview = false }: Props) {
  const [localValue, setLocalValue] = useState<number>(
    Number(component.defaultValue) || component.options?.min || 0
  );

  useEffect(() => {
    setLocalValue(Number(component.defaultValue) || component.options?.min || 0);
  }, [component.defaultValue, component.options?.min]);

  if (preview) {
    return (
      <div 
        className="slider-component"
        style={component.style}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            {localValue}
            {component.options?.unit}
          </span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-pink-500"
              style={{ 
                width: `${((localValue - (component.options?.min || 0)) / 
                  ((component.options?.max || 100) - (component.options?.min || 0))) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="slider-component-editor">
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={component.options?.min || 0}
          max={component.options?.max || 100}
          step={component.options?.step || 1}
          value={localValue}
          onChange={(e) => {
            const newValue = Number(e.target.value);
            setLocalValue(newValue);
            onChange({ defaultValue: newValue });
          }}
          disabled={component.options?.disabled}
          className="flex-1 h-2 bg-gray-200 rounded-full appearance-none 
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-pink-500
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:border-none
            [&::-webkit-slider-thumb]:shadow-md
            disabled:opacity-50"
        />
        <div className="flex items-center gap-1 min-w-[80px]">
          <input
            type="number"
            min={component.options?.min || 0}
            max={component.options?.max || 100}
            step={component.options?.step || 1}
            value={localValue}
            onChange={(e) => {
              const newValue = Number(e.target.value);
              setLocalValue(newValue);
              onChange({ defaultValue: newValue });
            }}
            disabled={component.options?.disabled}
            className="w-16 px-2 py-1 border rounded text-center"
          />
          {component.options?.unit && (
            <span className="text-sm text-gray-500">{component.options.unit}</span>
          )}
        </div>
      </div>
    </div>
  );
} 