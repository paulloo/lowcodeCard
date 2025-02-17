import React from 'react';
import type { EditorComponent } from '../../../types/editor';

interface Props {
  component: EditorComponent;
  value: any;
  preview?: boolean;
}

export function ComponentRenderer({ component, value, preview }: Props) {
  switch (component.type) {
    case 'text':
      if (component.options.multiline) {
        return (
          <div className="prose max-w-none">
            <p className={`
              whitespace-pre-wrap leading-relaxed
              ${component.style?.fontSize || 'text-base'}
              ${component.style?.color || 'text-gray-800'}
              ${component.style?.fontWeight || 'font-normal'}
            `}>
              {value || component.options.placeholder || '多行文本'}
            </p>
          </div>
        );
      }
      return (
        <h3 className={`
          ${component.style?.fontSize || 'text-xl'}
          ${component.style?.color || 'text-gray-900'}
          ${component.style?.fontWeight || 'font-bold'}
          leading-tight tracking-tight
        `}>
          {value || component.options.placeholder || '单行文本'}
        </h3>
      );

    case 'image':
      return (
        <div className={`
          relative overflow-hidden
          ${component.style?.borderRadius || 'rounded-xl'}
          ${component.style?.boxShadow || 'shadow-lg'}
          ${preview ? 'group' : ''}
        `}>
          {value ? (
            <img
              src={value}
              alt={component.label}
              className={`
                w-full transition duration-300
                ${component.options.aspectRatio === '1:1' ? 'aspect-square' : ''}
                ${component.options.aspectRatio === '16:9' ? 'aspect-video' : ''}
                ${component.style?.objectFit || 'object-cover'}
                ${preview ? 'group-hover:scale-105 group-hover:rotate-1' : ''}
              `}
              style={{
                objectPosition: component.style?.objectPosition || 'center'
              }}
            />
          ) : (
            <div className={`
              bg-gradient-to-br from-pink-100 to-purple-100
              flex items-center justify-center p-8
              ${component.options.aspectRatio === '1:1' ? 'aspect-square' : ''}
              ${component.options.aspectRatio === '16:9' ? 'aspect-video' : ''}
            `}>
              <div className="text-center">
                <div className="text-4xl mb-2">🖼️</div>
                <div className="text-sm text-gray-500">图片占位符</div>
              </div>
            </div>
          )}
        </div>
      );

    case 'select':
      return (
        <div className="flex flex-wrap gap-2">
          {value ? (
            (Array.isArray(value) ? value : [value]).map((v, i) => {
              const item = component.options.items?.find(item => item.value === v);
              return (
                <span key={i} className={`
                  inline-flex items-center px-3 py-1.5
                  text-sm font-medium rounded-full
                  bg-gradient-to-r from-pink-50 to-pink-100
                  text-pink-800 border border-pink-200
                  shadow-sm transform transition-all duration-200
                  hover:scale-105 hover:shadow-md
                  hover:from-pink-100 hover:to-pink-200
                  active:scale-95
                `}>
                  {item?.label || v}
                </span>
              );
            })
          ) : (
            <span className="text-gray-400 italic">未选择</span>
          )}
        </div>
      );

    case 'color':
      const colorValue = value || '#000000';
      return (
        <div className="flex items-center gap-3">
          <div
            className={`
              w-6 h-6 rounded-full shadow-inner
              transform transition-transform duration-200
              hover:scale-110 hover:shadow-lg
              ring-2 ring-white ring-offset-2
            `}
            style={{ 
              backgroundColor: colorValue,
              boxShadow: `0 0 0 2px white, 0 0 0 4px ${colorValue}22`
            }}
          />
          <span className="text-sm font-medium text-gray-700 tracking-wider uppercase">
            {colorValue}
          </span>
        </div>
      );

    default:
      return null;
  }
}

export default ComponentRenderer; 