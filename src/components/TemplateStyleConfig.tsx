import { useState } from 'react';
import type { Template } from '../services/template/TemplateManager';

interface Props {
  template: Template;
  onStyleChange: (styles: Template['variables']['styles']) => void;
}

export default function TemplateStyleConfig({ template, onStyleChange }: Props) {
  const [colors, setColors] = useState(template.variables.styles?.colors || []);

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...colors];
    newColors[index] = color;
    setColors(newColors);
    onStyleChange({
      ...template.variables.styles,
      colors: newColors
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">颜色配置</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color, index) => (
            <div key={index} className="relative group">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(index, e.target.value)}
                className="w-8 h-8 rounded-lg overflow-hidden cursor-pointer"
              />
              <div className="absolute inset-0 ring-2 ring-white rounded-lg pointer-events-none" />
              <div className="absolute inset-0 ring-2 ring-black/5 rounded-lg group-hover:ring-black/10 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* 可以添加更多样式配置选项 */}
    </div>
  );
} 