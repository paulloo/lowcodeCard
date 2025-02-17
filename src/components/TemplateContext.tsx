import { createContext, useContext } from 'react';

interface TemplateContextValue {
  template: Template;
  selectedField: TemplateField | null;
  previewVariables: Record<string, any>;
  actions: {
    updateField: (field: TemplateField) => void;
    deleteField: (id: string) => void;
    moveField: (id: string, direction: 'up' | 'down') => void;
    addField: (type: string) => void;
    setPreviewVariable: (path: string, value: any) => void;
  };
}

const TemplateContext = createContext<TemplateContextValue | null>(null);

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  // ... 实现上下文逻辑
}

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplate must be used within TemplateProvider');
  }
  return context;
} 