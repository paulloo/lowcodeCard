import { type EditorComponent } from '../../../../types/editor';

interface Props {
  component: EditorComponent | null;
  onChange: (component: EditorComponent) => void;
}

export default function PropertiesPanel({ component, onChange }: Props) {
  if (!component) {
    return (
      <div className="p-4 text-center text-gray-500">
        请选择一个组件进行编辑
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">属性</h3>
      {/* 组件属性编辑表单 */}
    </div>
  );
} 