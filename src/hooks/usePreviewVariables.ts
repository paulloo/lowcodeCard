import { useState, useEffect } from 'react';
import type { Template, TemplateField } from '../types/template';

const STORAGE_KEY = 'template-preview-variables';

export function usePreviewVariables(template: Partial<Template>) {
  const [variables, setVariables] = useState<Record<string, any>>(() => {
    if (typeof window === 'undefined') {
      return generateInitialValues(template.fields || []);
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 确保所有必要的字段都存在
        return {
          ...generateInitialValues(template.fields || []),
          ...parsed
        };
      }
    } catch (error) {
      console.error('Failed to load preview variables:', error);
    }

    return generateInitialValues(template.fields || []);
  });

  // 保存到本地存储
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(variables));
      } catch (error) {
        console.error('Failed to save preview variables:', error);
      }
    }
  }, [variables]);

  return [variables, setVariables] as const;
}

function generateInitialValues(fields: TemplateField[]): Record<string, any> {
  return fields.reduce((acc, field) => {
    acc[field.id] = field.defaultValue ?? getDefaultValueByType(field.type);
    return acc;
  }, {} as Record<string, any>);
}

function getDefaultValueByType(type: string): any {
  switch (type) {
    case 'text':
      return '示例文本';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'color':
      return '#ff69b4';
    case 'select':
      return '';
    case 'image':
      return '/preview/placeholder.jpg';
    default:
      return null;
  }
} 