import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { EditorComponent } from '../../../types/editor';

interface Props {
  id: string;
  children?: React.ReactNode;
  className?: string;
  onDrop?: (component: EditorComponent) => void;
}

export default function DroppableArea({ id, children, className = '', onDrop }: Props) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { onDrop }
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        relative min-h-[100px] rounded-lg
        ${isOver ? 'ring-2 ring-pink-500 ring-opacity-50 bg-pink-50' : ''}
        ${className}
      `}
    >
      {children}
      {isOver && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-pink-100 bg-opacity-20 animate-pulse" />
          <div className="absolute inset-x-0 top-0 h-1 bg-pink-500" />
          <div className="absolute inset-x-0 bottom-0 h-1 bg-pink-500" />
          <div className="absolute inset-y-0 left-0 w-1 bg-pink-500" />
          <div className="absolute inset-y-0 right-0 w-1 bg-pink-500" />
        </div>
      )}
    </div>
  );
} 