import { useState } from 'react';
import type { Template } from '../services/template/TemplateManager';
import TemplateEffectPreview from './TemplateEffectPreview';

interface Props {
  template: Template;
  selectedEffect: string;
  onEffectChange: (effect: string) => void;
}

const EFFECTS = [
  { id: 'none', name: '无效果' },
  { id: 'shine', name: '闪耀' },
  { id: 'float', name: '漂浮' },
  { id: 'pulse', name: '脉动' },
  { id: 'glitch', name: '故障' }
];

export default function TemplateEffectSelector({ template, selectedEffect, onEffectChange }: Props) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="space-y-4">
      {/* 效果选择器 */}
      <div className="flex flex-wrap gap-2">
        {EFFECTS.map(effect => (
          <button
            key={effect.id}
            onClick={() => {
              onEffectChange(effect.id);
              setShowPreview(true);
            }}
            className={`
              px-3 py-1.5 rounded-lg text-sm transition-all
              ${selectedEffect === effect.id
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {effect.name}
          </button>
        ))}
      </div>

      {/* 效果预览 */}
      {showPreview && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {EFFECTS.map(effect => (
            <TemplateEffectPreview
              key={effect.id}
              template={template}
              effect={effect.id}
              selected={selectedEffect === effect.id}
              onSelect={() => onEffectChange(effect.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 