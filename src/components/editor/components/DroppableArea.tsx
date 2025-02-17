import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { EditorComponent } from '../../../types/editor';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface Props {
  id: string;
  children?: React.ReactNode;
  className?: string;
  onDrop?: (component: EditorComponent) => void;
  items?: string[]; // 用于排序的项目 ID 列表
}

export default function DroppableArea({ id, children, className = '', onDrop, items = [] }: Props) {
  const { setNodeRef, isOver, active, over } = useDroppable({
    id,
    data: { onDrop }
  });

  // 计算指示器位置
  const getIndicatorPosition = () => {
    if (!isOver || !active || !over) return null;

    const isNew = active.data.current?.isNew;
    const activeIndex = active.data.current?.index ?? -1;
    const overIndex = over.data.current?.index ?? -1;
    const position = over.data.current?.position as 'before' | 'after' | undefined;

    // 如果是新组件或者位置发生变化，才显示指示器
    if (!isNew && activeIndex === overIndex) return null;

    return position;
  };

  const indicatorPosition = getIndicatorPosition();

  return (
    <div
      ref={setNodeRef}
      className={`
        ${className}
        relative
        min-h-[200px]
        rounded-lg
        transition-colors
        duration-200
        ${isOver ? 'bg-pink-50 border-2 border-dashed border-pink-300' : 'border-2 border-dashed border-gray-200'}
        ${!children ? 'flex items-center justify-center' : ''}
      `}
      style={{
        outline: isOver ? '2px solid rgba(236, 72, 153, 0.5)' : 'none',
        boxShadow: isOver ? '0 0 0 4px rgba(236, 72, 153, 0.1)' : 'none'
      }}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="relative">
          {children}
          
          {/* 排序指示器 */}
          {indicatorPosition && (
            <div
              className={`
                absolute left-0 right-0
                h-1 bg-gradient-to-r from-pink-500 to-rose-500
                transform transition-all duration-200
                ${indicatorPosition === 'before' ? '-top-1' : '-bottom-1'}
              `}
              style={{
                animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                zIndex: 1000
              }}
            />
          )}
        </div>
      </SortableContext>
      
      {/* 空状态提示 */}
      {!children && (
        <div className="text-center text-gray-400 pointer-events-none">
          <p className="text-sm mb-2">将组件拖放到这里</p>
          <div className="text-3xl mb-2">📦</div>
          <p className="text-xs">支持拖拽排序</p>
        </div>
      )}

      {/* 拖拽时的视觉反馈 */}
      {isOver && active && (
        <div className="absolute inset-0 bg-pink-500/5 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg text-pink-500 text-sm font-medium">
              {active.data.current?.isNew ? '添加新组件' : '调整组件位置'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 