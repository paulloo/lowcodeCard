import { useState, useEffect } from 'react';
import TemplateList from '../components/TemplateList';
import { TemplateManager } from '../services/template/TemplateManager';
import type { Template } from '../services/template/TemplateManager';

export default function TemplateManagerPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const templateManager = new TemplateManager();

  useEffect(() => {
    // 加载所有模板
    const loadTemplates = async () => {
      const allTemplates = templateManager.getTemplateList();
      setTemplates(allTemplates);
    };
    loadTemplates();
  }, []);

  const handleTemplateAdd = async (template: Omit<Template, 'id' | 'type'>) => {
    const id = await templateManager.addCustomTemplate(template);
    setTemplates(templateManager.getTemplateList());
  };

  const handleTemplateEdit = async (id: string, template: Partial<Template>) => {
    await templateManager.updateTemplate(id, template);
    setTemplates(templateManager.getTemplateList());
  };

  const handleTemplateDelete = async (id: string) => {
    await templateManager.removeTemplate(id);
    setTemplates(templateManager.getTemplateList());
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">模板管理</h1>
          <p className="mt-2 text-gray-600">
            在这里管理你的贺卡模板，可以创建、编辑、导入或删除模板
          </p>
        </div>

        <TemplateList
          templates={templates}
          onTemplateAdd={handleTemplateAdd}
          onTemplateEdit={handleTemplateEdit}
          onTemplateDelete={handleTemplateDelete}
        />
      </div>
    </div>
  );
} 