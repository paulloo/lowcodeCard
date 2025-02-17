import React from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  presetColors?: string[];
  showAlpha?: boolean;
}

export default function ColorPicker({ 
  value, 
  onChange, 
  presetColors = [
    '#FF69B4', // pink
    '#FF1493', // deep pink
    '#FF0000', // red
    '#FFA500', // orange
    '#FFD700', // gold
    '#9370DB', // medium purple
    '#4169E1', // royal blue
    '#32CD32', // lime green
  ],
  showAlpha = false 
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-12 h-12 p-1 rounded-lg border border-gray-200 cursor-pointer
            hover:border-pink-500 transition-colors"
        />
        <input
          type="text"
          value={value.toUpperCase()}
          onChange={e => {
            const newValue = e.target.value;
            if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
              onChange(newValue);
            }
          }}
          className="w-24 px-2 py-1 text-sm rounded-md border-gray-300 
            focus:border-pink-500 focus:ring-pink-500"
          placeholder="#000000"
        />
      </div>

      {/* 预设颜色 */}
      {presetColors && presetColors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presetColors.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={`
                w-8 h-8 rounded-full border-2 transition-all
                hover:scale-110 hover:shadow-lg
                ${value === color ? 'border-pink-500 scale-110' : 'border-transparent'}
              `}
              style={{ backgroundColor: color }}
            >
              <span className="sr-only">选择颜色 {color}</span>
            </button>
          ))}
        </div>
      )}

      {/* 透明度控制 */}
      {showAlpha && (
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="100"
            value={parseInt(value.slice(-2), 16)}
            onChange={e => {
              const alpha = parseInt(e.target.value);
              const newValue = value.slice(0, 7) + alpha.toString(16).padStart(2, '0');
              onChange(newValue);
            }}
            className="flex-1"
          />
          <span className="text-sm text-gray-500">
            {Math.round((parseInt(value.slice(-2), 16) / 255) * 100)}%
          </span>
        </div>
      )}
    </div>
  );
} 