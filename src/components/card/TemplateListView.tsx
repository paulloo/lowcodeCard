import React from 'react';
import type { Template } from '../../types/template';
import TemplateList from '../template/TemplateList';

interface Props {
  templates: Template[];
  onSelect: (template: Template) => void;
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
  onCreateNew: () => void;
}

export function TemplateListView({
  templates,
  onSelect,
  onEdit,
  onDelete,
  onCreateNew
}: Props) {
  // 处理模板选择
  const handleTemplateSelect = (template: Template) => {
    onSelect(template);
    // 这里可以添加其他逻辑，比如切换步骤等
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">选择模板</h2>
          <p className="mt-1 text-sm text-gray-500">
            从以下模板中选择一个开始创建你的贺卡
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex items-center px-4 py-2 rounded-lg
            bg-pink-500 text-white hover:bg-pink-600 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          创建新模板
        </button>
      </div>

      <TemplateList
        templates={templates}
        onSelect={handleTemplateSelect}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
} 