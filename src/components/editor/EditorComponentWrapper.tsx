import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { EditorComponent } from '../../types/editor';
import { ComponentRenderer } from './preview/ComponentRenderer';

interface Props {
  component: EditorComponent;
  isSelected: boolean;
  isDragging?: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<EditorComponent>) => void;
  onDelete: () => void;
}

export default function EditorComponentWrapper({
  component,
  isSelected,
  isDragging,
  onSelect,
  onChange,
  onDelete
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id: component.id,
    data: component
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative group
        ${isSelected ? 'ring-2 ring-pink-500' : ''}
        ${isDragging ? 'shadow-lg' : 'shadow-sm'}
      `}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <ComponentRenderer
        component={component}
        onChange={onChange}
        preview={false}
      />
      
      {/* 删除按钮 */}
      <button
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500
          opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
} 