import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Template, EditorComponent } from '../../types/editor';

interface EditorContextValue {
  template: Template;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  updateComponent: (id: string, updates: Partial<EditorComponent>) => void;
  deleteComponent: (id: string) => void;
  setTemplate: React.Dispatch<React.SetStateAction<Template>>;
  onChange: (template: Template) => void;
  onCodeChange?: (code: string) => void;
  onSave: () => void;
}

export const EditorContext = createContext<EditorContextValue | null>(null);

interface EditorProviderProps {
  template: Template;
  onChange: (template: Template) => void;
  onCodeChange?: (code: string) => void;
  onSave: () => void;
  children: React.ReactNode;
}

export function EditorProvider({ 
  template: initialTemplate, 
  onChange, 
  onCodeChange,
  onSave,
  children 
}: EditorProviderProps) {
  const [template, setTemplate] = useState(initialTemplate);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const updateComponent = useCallback((id: string, updates: Partial<EditorComponent>) => {
    setTemplate(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === id ? { ...field, ...updates } : field
      )
    }));
  }, []);

  const deleteComponent = useCallback((id: string) => {
    setTemplate(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== id)
    }));
  }, []);

  const value: EditorContextValue = {
    template,
    selectedId,
    setSelectedId,
    updateComponent,
    deleteComponent,
    setTemplate,
    onChange,
    onCodeChange,
    onSave
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
} 