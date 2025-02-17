import { type Template } from '../../../types/editor';

interface Props {
  template: Template;
  onExport: () => void;
  onPreview: () => void;
}

export default function PreviewControls({ template, onExport, onPreview }: Props) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h3 className="text-lg font-medium text-gray-900">预览</h3>
      <div className="flex gap-2">
        <button
          onClick={onPreview}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
        >
          新窗口打开
        </button>
        <button
          onClick={onExport}
          className="px-3 py-1.5 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          导出模板
        </button>
      </div>
    </div>
  );
} 