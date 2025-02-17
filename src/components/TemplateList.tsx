import { useState, useEffect } from 'react';
import type { Template } from '../types/template';
import { TemplateManager } from '../services/template/TemplateManager';
import TemplatePreviewCard from './TemplatePreviewCard';
import TemplateEditor from './TemplateEditor';
import TemplateImporter from './TemplateImporter';
import Toast from './Toast';

interface Props {
  onSelect: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
}

export default function TemplateList({ onSelect, onEdit, onDelete }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showImporter, setShowImporter] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const templateManager = TemplateManager.getInstance();

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templateList = await templateManager.getTemplateList();
        setTemplates(templateList);
      } catch (err) {
        console.error('加载模板失败:', err);
        setError(err instanceof Error ? err.message : '加载模板失败');
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddNew = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleDelete = async (template: Template) => {
    try {
      await templateManager.deleteTemplate(template.id);
      setTemplates(templates.filter(t => t.id !== template.id));
      showToast('模板删除成功', 'success');
    } catch (err) {
      console.error('删除模板失败:', err);
      showToast(err instanceof Error ? err.message : '删除模板失败', 'error');
    }
  };

  const handleSave = async (templateData: Omit<Template, 'id'>) => {
    try {
      if (editingTemplate) {
        const updated = await templateManager.updateTemplate(editingTemplate.id, {
          ...templateData,
          updatedAt: Date.now()
        });
        setTemplates(templates.map(t => t.id === updated.id ? updated : t));
        showToast('模板更新成功', 'success');
      } else {
        const newTemplate = await templateManager.saveTemplate({
          ...templateData,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        setTemplates([...templates, newTemplate]);
        showToast('模板添加成功', 'success');
      }
      setShowEditor(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : '保存失败', 'error');
    }
  };

  const handleImport = async (template: Template) => {
    try {
      const newTemplate = await templateManager.saveTemplate(template);
      setTemplates([...templates, newTemplate]);
      setShowImporter(false);
      showToast('模板导入成功', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '导入失败', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent"></div>
          <span className="text-gray-700">加载中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          重试
        </button>
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-gray-500">暂无模板</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            新建模板
          </button>
          <button
            onClick={() => setShowImporter(true)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            导入模板
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <TemplatePreviewCard
            key={template.id}
            template={template}
            selected={template.id === selectedId}
            onSelect={() => {
              setSelectedId(template.id);
              onSelect(template);
            }}
            onEdit={() => handleEdit(template)}
            onDelete={onDelete ? () => {
              if (confirm('确定要删除这个模板吗？')) {
                handleDelete(template);
                onDelete(template);
              }
            } : undefined}
          />
        ))}
      </div>

      {showEditor && (
        <TemplateEditor
          initialTemplate={editingTemplate || {
            name: '',
            description: '',
            fields: [
              {
                id: 'photo',
                type: 'image',
                label: '照片',
                description: '上传一张照片',
                required: true,
                options: {
                  format: 'jpg,jpeg,png,gif,webp',
                  maxSize: 5 * 1024 * 1024,
                  preview: true,
                  group: '内容设置'
                }
              },
              {
                id: 'message',
                type: 'text',
                label: '祝福语',
                description: '写下你的祝福',
                required: true,
                options: {
                  rows: 3,
                  placeholder: '在这里写下你的祝福...',
                  group: '内容设置'
                }
              }
            ],
            html: `
<div class="card">
  <div class="photo-container">
    <img src="{{photo}}" alt="照片" />
  </div>
  <div class="message-container">
    <p>{{message}}</p>
  </div>
</div>
            `,
            css: `
.card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  background: linear-gradient(135deg, var(--primaryColor), #fff);
  min-height: 100%;
}

.photo-container {
  width: 200px;
  height: 200px;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.photo-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-container {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  font-size: 1.125rem;
  line-height: 1.75;
  text-align: center;
  color: #1f2937;
}
            `,
            version: '1.0.0'
          }}
          onSave={handleSave}
          onCancel={() => setShowEditor(false)}
        />
      )}

      {showImporter && (
        <TemplateImporter
          onImport={handleImport}
          onCancel={() => setShowImporter(false)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
} 