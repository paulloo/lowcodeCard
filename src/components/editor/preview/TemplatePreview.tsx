import React from 'react';
import type { Template } from '../../../types/editor';
import { ComponentRenderer } from './ComponentRenderer';

interface Props {
  template: Template;
  values?: Record<string, any>;
}

export default function TemplatePreview({ template, values = {} }: Props) {
  return (
    <div className="relative w-full h-full">
      {/* 背景 */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg"
      />

      {/* 内容 */}
      <div className="relative z-10 p-4 space-y-4">
        {template.fields.map(field => (
          <div 
            key={field.id}
            className={`
              animate-fade-in
              ${field.style?.margin || 'my-2'}
              ${field.style?.padding || 'px-2'}
            `}
          >
            <ComponentRenderer
              component={field}
              value={values[field.id] ?? field.defaultValue}
              preview
            />
          </div>
        ))}
      </div>
    </div>
  );
} 