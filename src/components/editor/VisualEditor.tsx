import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import type { EditorComponent } from '../../types/editor';
import { useEditor } from '../../core/editor/EditorContext';
import {
  TextComponent,
  ImageComponent,
  ColorComponent,
  SelectComponent,
  SliderComponent,
  SwitchComponent,
  GroupComponent,
  LayoutComponent
} from './components';

const ComponentMap = {
  text: TextComponent,
  image: ImageComponent,
  color: ColorComponent,
  select: SelectComponent,
  slider: SliderComponent,
  switch: SwitchComponent,
  group: GroupComponent,
  layout: LayoutComponent
};

export default function VisualEditor() {
  const { 
    state: { selectedId, components, isDragging },
    selectComponent,
    updateComponent,
    setDragging
  } = useEditor();

  return (
    <div className="flex h-full">
      {/* 组件面板 */}
      <ComponentPanel />

      {/* 画布区域 */}
      <div className="flex-1 p-4 overflow-auto">
        <DndContext
          onDragStart={() => setDragging(true)}
          onDragEnd={() => setDragging(false)}
        >
          <div className="min-h-full">
            {Array.from(components.values()).map(component => (
              <EditorComponentWrapper
                key={component.id}
                component={component}
                isSelected={component.id === selectedId}
                onSelect={() => selectComponent(component.id)}
                onChange={updates => updateComponent(component.id, updates)}
              />
            ))}
          </div>
        </DndContext>
      </div>

      {/* 属性面板 */}
      {selectedId && (
        <PropertiesPanel
          component={components.get(selectedId)!}
          onChange={updates => updateComponent(selectedId, updates)}
        />
      )}
    </div>
  );
} 