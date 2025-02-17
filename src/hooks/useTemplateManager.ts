import { useState, useCallback } from 'react';
import type { Template } from '../types/template';
import { TemplateManager } from '../services/template/TemplateManager';

export function useTemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);

  const loadTemplates = useCallback(async () => {
    const manager = new TemplateManager();
    const templateList = await manager.getTemplateList();
    setTemplates(templateList);
    return templateList;
  }, []);

  const handleTemplateSelect = useCallback((template: Template) => {
    setSelectedTemplate(template);
  }, []);

  const handleEditTemplate = useCallback((template: Template) => {
    setEditingTemplate(template);
    setShowTemplateEditor(true);
  }, []);

  const handleDeleteTemplate = useCallback(async (template: Template) => {
    if (!window.confirm('确定要删除这个模板吗？')) return;

    const manager = new TemplateManager();
    await manager.deleteTemplate(template.id);
    const updatedList = await manager.getTemplateList();
    setTemplates(updatedList);

    if (selectedTemplate?.id === template.id) {
      setSelectedTemplate(null);
    }
  }, [selectedTemplate]);

  const handleSaveTemplate = useCallback(async (template: Template) => {
    const manager = new TemplateManager();
    
    if (editingTemplate) {
      await manager.updateTemplate(template.id, template);
    } else {
      await manager.addTemplate({
        ...template,
        type: 'custom' as const
      });
    }

    const updatedList = await manager.getTemplateList();
    setTemplates(updatedList);
    setShowTemplateEditor(false);
    setEditingTemplate(null);

    if (selectedTemplate?.id === template.id) {
      setSelectedTemplate(template);
    }
  }, [editingTemplate, selectedTemplate]);

  return {
    templates,
    selectedTemplate,
    editingTemplate,
    showTemplateEditor,
    setShowTemplateEditor,
    setEditingTemplate,
    setSelectedTemplate,
    loadTemplates,
    handleTemplateSelect,
    handleEditTemplate,
    handleDeleteTemplate,
    handleSaveTemplate
  };
} 