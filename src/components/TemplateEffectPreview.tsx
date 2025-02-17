import { useState } from 'react';
import type { Template } from '../services/template/TemplateManager';
import TemplateRenderer from './editor/preview/TemplateRenderer';

interface Props {
  template: Template;
  effect: string;
  onSelect: () => void;
  selected?: boolean;
}

export default function TemplateEffectPreview({ template, effect, onSelect, selected }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  const previewVariables = {
    images: {
      self: '/preview/self.jpg',
      partner: '/preview/partner.jpg'
    },
    message: '预览效果',
    styles: {
      ...template.variables.styles,
      effects: [effect]
    }
  };

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative aspect-video rounded-lg overflow-hidden transition-all duration-200
        ${selected 
          ? 'ring-2 ring-pink-500 scale-[1.02]' 
          : 'hover:ring-1 hover:ring-pink-300 hover:scale-[1.01]'
        }
      `}
    >
      <div className="w-full h-full">
        <TemplateRenderer
          template={template}
          variables={previewVariables}
        />
      </div>
      
      <div 
        className={`
          absolute inset-0 bg-gradient-to-t from-black/60 to-transparent
          flex items-end p-3 transition-opacity duration-200
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <span className="text-white text-sm font-medium capitalize">
          {effect === 'none' ? '无效果' : effect}
        </span>
      </div>
    </button>
  );
} 