import { type ReactNode } from 'react';
import type { TemplateField } from '../../../../types/editor';

export interface FieldProps {
  field: TemplateField;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (field: TemplateField) => void;
  onDelete: () => void;
}

export interface BaseFieldProps extends FieldProps {
  icon: ReactNode;
  children: ReactNode;
}

export default function BaseField({ 
  field, 
  isSelected, 
  onSelect, 
  onDelete, 
  icon, 
  children 
}: BaseFieldProps) {
  return (
    <div 
      className={`
        group relative p-4 border rounded-lg transition-all
        ${isSelected ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-6 h-6 text-gray-400">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          {children}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onSelect}
            className="p-1 text-gray-400 hover:text-blue-500"
            title="编辑"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-500"
            title="删除"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 