import { useState, useEffect, useRef } from 'react';
import TemplateList from './TemplateList';
import { TemplateManager } from '../services/template/TemplateManager';
import type { Template } from '../services/template/TemplateManager';
import Toast from './Toast';

export default function TemplateManagerPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const templateManager = useRef(new TemplateManager());

  useEffect(() => {
    const init = async () => {
      await templateManager.current.initialize();
      setTemplates(templateManager.current.getTemplateList());
    };
    init();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTemplateAdd = async (template: Omit<Template, 'id' | 'type'>) => {
    try {
      const id = await templateManager.current.addCustomTemplate(template);
      setTemplates(templateManager.current.getTemplateList());
      showToast('模板创建成功', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '创建失败', 'error');
    }
  };

  const handleTemplateEdit = async (id: string, template: Partial<Template>) => {
    try {
      await templateManager.current.updateTemplate(id, template);
      setTemplates(templateManager.current.getTemplateList());
      showToast('模板更新成功', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '更新失败', 'error');
    }
  };

  const handleTemplateDelete = async (id: string) => {
    try {
      if (await templateManager.current.removeTemplate(id)) {
        setTemplates(templateManager.current.getTemplateList());
        showToast('模板删除成功', 'success');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : '删除失败', 'error');
    }
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

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
} 