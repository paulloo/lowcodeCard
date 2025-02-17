import { create } from 'zustand';
import type { Template, EditorComponent } from '../../types/editor';
import { ComponentConverter } from '../converter/ComponentConverter';

interface EditorState {
  template: Template;
  selectedComponent: EditorComponent | null;
  dragging: boolean;
  dropTarget: { id: string; position: 'before' | 'after' | 'inside' } | null;
}

type EditorActions = {
  selectComponent: (component: EditorComponent | null) => void;
  updateComponent: (component: EditorComponent) => void;
  deleteComponent: (id: string) => void;
  setDragging: (dragging: boolean) => void;
  setDropTarget: (target: EditorState['dropTarget']) => void;
}

export const useEditorStore = create<EditorState & EditorActions>((set) => ({
  template: { id: '', name: '', fields: [] },
  selectedComponent: null,
  dragging: false,
  dropTarget: null,

  selectComponent: (component: EditorComponent | null) => 
    set({ selectedComponent: component }),

  updateComponent: (component: EditorComponent) => 
    set((state: EditorState) => ({
      template: {
        ...state.template,
        fields: state.template.fields?.map(field => 
          field.id === component.id 
            ? ComponentConverter.toField(component) 
            : field
        )
      }
    })),

  deleteComponent: (id: string) => 
    set((state: EditorState) => ({
      template: {
        ...state.template,
        fields: state.template.fields?.filter(field => field.id !== id)
      },
      selectedComponent: state.selectedComponent?.id === id 
        ? null 
        : state.selectedComponent
    })),

  setDragging: (dragging: boolean) => set({ dragging }),
  setDropTarget: (target: EditorState['dropTarget']) => set({ dropTarget })
})); 