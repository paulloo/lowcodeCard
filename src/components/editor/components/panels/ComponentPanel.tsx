import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { ComponentType } from '../../../../types/editor';

const componentTypes: Array<{
  type: ComponentType;
  label: string;
  icon: string;
  description: string;
}> = [
  { 
    type: 'text', 
    label: '文本', 
    icon: '📝',
    description: '用于输入单行或多行文本'
  },
  { 
    type: 'image', 
    label: '图片', 
    icon: '🖼️',
    description: '用于上传和展示图片'
  },
  { 
    type: 'select', 
    label: '选择框', 
    icon: '📋',
    description: '提供多个选项供用户选择'
  },
  { 
    type: 'color', 
    label: '颜色', 
    icon: '🎨',
    description: '用于选择颜色'
  }
];

// 可拖拽的组件项
function DraggableComponent({ type, label, icon, description }: {
  type: ComponentType;
  label: string;
  icon: string;
  description: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: `component-${type}`,
    data: {
      type,
      isNew: true
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 100 : undefined,
    opacity: isDragging ? 0.8 : undefined,
    boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.1)' : undefined
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`
        group p-3 rounded-lg cursor-grab
        bg-white hover:bg-pink-50 transition-colors
        ${isDragging ? 'ring-2 ring-pink-500 ring-opacity-50' : ''}
      `}
      style={style}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <div className="font-medium text-gray-900">{label}</div>
          <div className="text-xs text-gray-500">{description}</div>
        </div>
      </div>
    </div>
  );
}

// 组件面板主组件
export default function ComponentPanel() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">组件库</h3>
        <p className="mt-1 text-xs text-gray-500">
          拖拽组件到编辑区域进行添加
        </p>
      </div>
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {componentTypes.map((component) => (
          <DraggableComponent
            key={component.type}
            {...component}
          />
        ))}
      </div>
    </div>
  );
} 