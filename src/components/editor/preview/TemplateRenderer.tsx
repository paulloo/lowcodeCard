import React from 'react';
import type { Template } from '../../../types/editor';
import { ComponentRenderer } from './ComponentRenderer';

interface Props {
  template: Template;
  values?: Record<string, any>;
}

const getBackgroundStyle = (template: Template) => {
  if (!template.styles?.colors || template.styles.colors.length < 2) {
    return 'linear-gradient(135deg, #fdf2f8, #ddd6fe)';
  }
  
  const [color1, color2] = template.styles.colors;
  return `linear-gradient(135deg, ${color1}, ${color2})`;
};

export default function TemplateRenderer({ template, values = {} }: Props) {
  const getFieldValue = (fieldId: string) => {
    return values[fieldId] ?? 
      template.fields.find(f => f.id === fieldId)?.defaultValue ?? 
      null;
  };

  return (
    <div className="relative w-full h-full">
      {/* 背景层 */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: getBackgroundStyle(template)
        }}
      />

      {/* 内容层 */}
      <div className="relative z-10 p-8 flex flex-col gap-6 min-h-full">
        {template.fields.map(field => (
          <div 
            key={field.id}
            className={`
              animate-fade-in
              ${field.style?.margin || 'my-4'}
              ${field.style?.padding || 'px-4'}
              ${field.style?.width || 'w-full'}
              ${field.style?.textAlign || 'text-center'}
            `}
          >
            <ComponentRenderer
              component={field}
              value={getFieldValue(field.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 