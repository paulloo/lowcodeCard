import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TemplateField } from '../../../../types/editor';
import { 
  TextField,
  ImageField,
  ColorField,
  SelectField 
} from './index';
import type { EditorComponent } from '../../../../types/editor';

interface Props {
  field: TemplateField;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<EditorComponent>) => void;
  onDelete: () => void;
}

function convertFieldToComponent(field: TemplateField): EditorComponent {
  return {
    ...field,
    hidden: false,
    style: {}
  };
}

export default function SortableField({ field, isSelected, onSelect, onChange, onDelete }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
    overIndex
  } = useSortable({
    id: field.id,
    data: {
      type: field.type,
      field
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 1000 : 0
  };

  const Component = {
    text: TextField,
    image: ImageField,
    color: ColorField,
    select: SelectField
  }[field.type];
  if (!Component) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative p-4 bg-white rounded-lg border border-gray-200
        group hover:border-pink-500 transition-colors
        ${isSelected ? 'ring-2 ring-pink-500' : ''}
        ${isDragging ? 'shadow-lg' : 'shadow-sm'}
        ${isOver ? 'bg-pink-50' : ''}
      `}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* 拖放指示器 */}
      {isOver && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 -top-1 h-2 bg-pink-500 rounded-t-lg opacity-50" />
          <div className="absolute inset-x-0 -bottom-1 h-2 bg-pink-500 rounded-b-lg opacity-50" />
        </div>
      )}

      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move 
          p-1 rounded hover:bg-gray-100 text-gray-400"
      >
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zM7 12a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" />
        </svg>
      </div>

      <div className="pl-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {field.label}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-gray-400 hover:text-red-500 
              opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <Component
          component={convertFieldToComponent(field)}
          value={field.defaultValue}
          onChange={value => onChange({ defaultValue: value })}
        />
      </div>
    </div>
  );
} 