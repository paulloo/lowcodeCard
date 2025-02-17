import { DragOverlay } from '@dnd-kit/core';
import type { EditorComponent } from '../../types/editor';

interface Props {
  component: EditorComponent | null;
  dropTarget: {
    id: string;
    position: 'before' | 'after' | 'inside';
  } | null;
}

export default function CustomDragOverlay({ children }) {
  return (
    <DragOverlay>
      {children}
    </DragOverlay>
  );
} 