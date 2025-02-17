import React from 'react';
import type { Template } from '../../types/template';
import TemplateContentEditor from '../template/TemplateContentEditor';

interface Props {
  template: Template;
  onSave: (values: Record<string, any>) => Promise<boolean>;
  onBack: () => void;
}

export function TemplateEditorView(props: Props) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">编辑贺卡内容</h2>
          <p className="mt-1 text-sm text-gray-500">
            自定义贺卡的文字、图片等内容
          </p>
        </div>
        <button
          type="button"
          onClick={props.onBack}
          className="text-gray-400 hover:text-gray-500 transition-colors"
        >
          <span className="sr-only">返回列表</span>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <TemplateContentEditor
        template={props.template}
        onSave={props.onSave}
        onImageUpload={async (file: File) => {
          // 实现图片上传逻辑
          return URL.createObjectURL(file);
        }}
      />
    </div>
  );
} 