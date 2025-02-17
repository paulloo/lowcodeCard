import React, { useState, useCallback, useEffect } from 'react';
import type { Template, EditorComponent, ComponentType, ComponentOptions } from '../../types/editor';
import { 
  DndContext, 
  DragOverlay, 
  useSensor, 
  useSensors, 
  PointerSensor,
  MeasuringStrategy,
  closestCenter
} from '@dnd-kit/core';
// 分离类型导入
import type { Active, Over } from '@dnd-kit/core';
// 使用 type 导入事件类型
import type { 
  DragStartEvent, 
  DragEndEvent, 
  DragOverEvent 
} from '@dnd-kit/core/dist/types';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import ComponentPanel from './components/panels/ComponentPanel';
import PropertyPanel from './components/panels/PropertyPanel';
import PreviewPanel from './components/panels/PreviewPanel';
import EditorComponentWrapper from './EditorComponentWrapper';
import DroppableArea from './components/DroppableArea';
import { EditorProvider, useEditor } from '../../core/editor/EditorContext';
import { ComponentRenderer } from './preview/ComponentRenderer';
import TemplatePreview from './preview/TemplatePreview';
import { defaultDropAnimationSideEffects } from '@dnd-kit/core';

interface Props {
  template: Template;
  onChange: (template: Template) => void;
  onCodeChange?: (code: string) => void;
  onSave: () => void;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('编辑器错误:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-500">
          <h2>编辑器出错了</h2>
          <pre>{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// 导入组件类型定义
const componentTypes = [
  { 
    type: 'text' as ComponentType, 
    label: '文本', 
    icon: '📝',
    description: '用于输入单行或多行文本'
  },
  { 
    type: 'image' as ComponentType, 
    label: '图片', 
    icon: '🖼️',
    description: '用于上传和展示图片'
  },
  { 
    type: 'select' as ComponentType, 
    label: '选择框', 
    icon: '📋',
    description: '提供多个选项供用户选择'
  },
  { 
    type: 'color' as ComponentType, 
    label: '颜色', 
    icon: '🎨',
    description: '用于选择颜色'
  }
] as const;

export default function TemplateVisualEditor({ template, onChange, onCodeChange, onSave }: Props) {
  return (
    <div className="relative">
      <ErrorBoundary>
        <EditorProvider 
          template={template} 
          onChange={onChange}
          onCodeChange={onCodeChange}
          onSave={onSave}
        >
          <TemplateVisualEditorContent />
        </EditorProvider>
      </ErrorBoundary>
    </div>
  );
}

function TemplateVisualEditorContent() {
  const { 
    template, 
    selectedId, 
    setSelectedId,
    updateComponent,
    deleteComponent,
    setTemplate,
    onCodeChange,
    onChange,
    onSave
  } = useEditor();

  // 状态声明
  const [activeComponent, setActiveComponent] = useState<EditorComponent | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{
    show: boolean;
    index: number;
    position: 'before' | 'after';
  }>({
    show: false,
    index: -1,
    position: 'after'
  });
  const [showPreview, setShowPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 添加拖拽预览状态
  const [dragPreview, setDragPreview] = useState<{
    show: boolean;
    component: EditorComponent | null;
  }>({
    show: false,
    component: null
  });

  // 先声明 generateCodePreview 函数
  const generateCodePreview = useCallback((fields: EditorComponent[]) => {
    if (!onCodeChange) return;

    const code = fields.map(field => {
      const { id, type, label, required, hidden, description, style, options, defaultValue } = field;
      return `
// ${type} 组件: ${label}
{
  id: '${id}',
  type: '${type}',
  label: '${label}',
  required: ${required},
  hidden: ${hidden},
  description: ${JSON.stringify(description)},
  style: ${JSON.stringify(style, null, 2)},
  options: ${JSON.stringify(options, null, 2)},
  defaultValue: ${JSON.stringify(defaultValue)}
}`;
    }).join(',\n');

    const templateCode = `
{
  id: '${template.id}',
  name: '${template.name}',
  description: ${JSON.stringify(template.description)},
  type: '${template.type}',
  fields: [
    ${code}
  ],
  styles: ${JSON.stringify(template.styles, null, 2)}
}`;

    onCodeChange(templateCode);
  }, [template, onCodeChange]);

  // 然后声明其他事件处理函数
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    
    // 设置拖拽预览
    if (active.data.current?.isNew) {
      const type = active.data.current.type as ComponentType;
      setDragPreview({
        show: true,
        component: {
          id: `${type}_${Date.now()}`,
          type,
          label: `新${componentTypes.find(t => t.type === type)?.label || '组件'}`,
          required: false,
          hidden: false,
          description: '',
          defaultValue: '',
          style: {},
          options: {}
        }
      });
    } else {
      const component = template.fields.find(f => f.id === active.id);
      if (component) {
        setDragPreview({
          show: true,
          component
        });
      }
    }
  }, [template.fields]);

  // 优化拖拽处理
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeIndex = template.fields.findIndex(f => f.id === active.id);
    const overIndex = template.fields.findIndex(f => f.id === over.id);
    
    // 计算放置位置
    const rect = (over.data.current?.rect as { top: number; bottom: number }) || null;
    if (rect) {
      const mouseY = event.activatorEvent.clientY;
      const threshold = (rect.bottom - rect.top) * 0.5;
      const position = mouseY - rect.top < threshold ? 'before' : 'after';
      
      setDropIndicator({
        show: true,
        index: overIndex,
        position
      });
    }
  }, [template.fields]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    try {
      if (!over || !dragPreview.component) return;

      const newFields = [...template.fields];
      const activeIndex = newFields.findIndex(f => f.id === active.id);
      
      if (activeIndex !== -1) {
        // 排序现有组件
        const overIndex = newFields.findIndex(f => f.id === over.id);
        if (overIndex !== -1 && activeIndex !== overIndex) {
          const [movedItem] = newFields.splice(activeIndex, 1);
          const insertIndex = dropIndicator.position === 'after' ? overIndex + 1 : overIndex;
          newFields.splice(insertIndex, 0, movedItem);
        }
      } else {
        // 添加新组件
        const overIndex = over.id === 'editor-area' 
          ? newFields.length 
          : newFields.findIndex(f => f.id === over.id);

        if (overIndex !== -1) {
          const insertIndex = dropIndicator.position === 'after' ? overIndex + 1 : overIndex;
          newFields.splice(insertIndex, 0, dragPreview.component);
        } else {
          newFields.push(dragPreview.component);
        }
      }

      // 更新模板
      setTemplate(prev => ({
        ...prev,
        fields: newFields
      }));

      // 标记有未保存的更改
      setHasUnsavedChanges(true);

      // 生成代码预览
      generateCodePreview(newFields);

      // 选中新添加的组件
      if (!activeIndex) {
        setSelectedId(dragPreview.component.id);
      }

    } catch (error) {
      console.error('处理拖拽结束错误:', error);
    } finally {
      setDragPreview({ show: false, component: null });
      setDropIndicator({ show: false, index: -1, position: 'after' });
    }
  }, [dragPreview.component, template.fields, dropIndicator, setTemplate, setSelectedId, generateCodePreview]);

  // 修改自动保存逻辑
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timer = setTimeout(() => {
        console.log('Auto saving template:', template);
        onChange(template);
        setHasUnsavedChanges(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [template, hasUnsavedChanges, onChange]);

  // 修改手动保存处理函数
  const handleSave = useCallback(() => {
    console.log('Manual saving template:', template);
    onChange(template);
    setHasUnsavedChanges(false);
    onSave();
  }, [template, onChange, onSave]);

  // 修改组件更新处理函数
  const handleFieldChange = useCallback((fieldId: string, updates: Partial<EditorComponent>) => {
    console.log('Field change:', fieldId, updates);
    const updatedFields = template.fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    );
    
    const updatedTemplate = {
      ...template,
      fields: updatedFields,
      updatedAt: Date.now()
    };

    onChange(updatedTemplate);
    setHasUnsavedChanges(true);
  }, [template, onChange]);

  // 修改传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
        delay: 0,
        tolerance: 5,
        pressure: 0
      },
    })
  );

  // 添加拖拽动画配置
  const animationConfig = {
    duration: 200,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5'
        }
      }
    })
  };

  // 添加组件编辑处理函数
  const handleEditComponent = useCallback((componentId: string) => {
    setSelectedId(componentId);
  }, [setSelectedId]);

  // 添加组件删除处理函数
  const handleDeleteComponent = useCallback((componentId: string) => {
    if (confirm('确定要删除此组件吗？')) {
      deleteComponent(componentId);
      if (selectedId === componentId) {
        setSelectedId(null);
      }
    }
  }, [deleteComponent, selectedId, setSelectedId]);

  // 清理拖拽状态
  const handleDragCancel = useCallback(() => {
    setDropIndicator({ show: false, index: -1, position: 'after' });
    setActiveComponent(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setDragPreview({ show: false, component: null });
        setDropIndicator({ show: false, index: -1, position: 'after' });
      }}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always
        }
      }}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
    >
      <div className="h-full flex">
        {/* 左侧组件面板 */}
        <div className="w-72 border-r border-gray-200 bg-white overflow-y-auto">
          <ComponentPanel />
        </div>

        {/* 中间编辑区域 */}
        <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
          {/* 顶部工具栏 */}
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium text-gray-900">编辑区域</h2>
              <span className="text-xs text-gray-500">
                {template.fields.length} 个组件
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('确定要清空所有组件吗？')) {
                    setTemplate(prev => ({ ...prev, fields: [] }));
                  }
                }}
                className="text-xs text-gray-500 hover:text-red-500 transition-colors"
              >
                清空
              </button>
            </div>
          </div>

          {/* 可滚动的内容区域 */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              <DroppableArea
                id="editor-area"
                className="p-4 bg-gray-50 min-h-[400px]"
              >
                <SortableContext
                  items={template.fields.map(f => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {template.fields.map(field => (
                    <SortableComponent
                      key={field.id}
                      component={field}
                      isSelected={selectedId === field.id}
                      onSelect={() => handleEditComponent(field.id)}
                      onDelete={() => handleDeleteComponent(field.id)}
                    />
                  ))}
                </SortableContext>
              </DroppableArea>
            </div>
          </div>
        </div>

        {/* 右侧属性面板 */}
        <div className="w-80 border-l border-gray-200 bg-white">
          <div className="h-full flex flex-col">
            {/* 切换按钮 */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex rounded-lg overflow-hidden">
                <button
                  className={`
                    flex-1 px-4 py-2 text-sm font-medium
                    ${!showPreview ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}
                  `}
                  onClick={() => setShowPreview(false)}
                >
                  属性
                </button>
                <button
                  className={`
                    flex-1 px-4 py-2 text-sm font-medium
                    ${showPreview ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}
                  `}
                  onClick={() => setShowPreview(true)}
                >
                  预览
                </button>
              </div>
            </div>

            {/* 面板内容 */}
            <div className="flex-1 overflow-y-auto">
              {showPreview ? (
                <div className="p-4">
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <TemplatePreview
                      template={template}
                      values={template.fields.reduce((acc, field) => ({
                        ...acc,
                        [field.id]: field.defaultValue
                      }), {})}
                    />
                  </div>
                </div>
              ) : (
                <PropertyPanel
                  component={selectedId ? template.fields.find(f => f.id === selectedId) || null : null}
                  onChange={(updates) => {
                    if (selectedId) {
                      updateComponent(selectedId, updates);
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* 拖拽预览和指示器 */}
        <DragOverlay dropAnimation={animationConfig}>
          {dragPreview.show && dragPreview.component && (
            <div className="p-4 bg-white rounded-lg shadow-xl border-2 border-pink-500/50
              backdrop-blur-sm transform transition-all duration-200 scale-105">
              <ComponentRenderer
                component={dragPreview.component}
                value={dragPreview.component.defaultValue}
                preview
              />
            </div>
          )}
        </DragOverlay>

        {/* 放置位置指示器 */}
        {dropIndicator.show && (
          <div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500
              transform transition-all duration-200"
            style={{
              top: `${dropIndicator.position === 'before' ? -2 : 2}px`,
              zIndex: 1000
            }}
          />
        )}

        {/* 添加保存提示 */}
        {hasUnsavedChanges && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">⚠️</span>
              <span className="text-sm text-gray-600">有未保存的更改</span>
              <button
                type="button"
                className="px-3 py-1 bg-pink-500 text-white rounded-md text-sm
                  hover:bg-pink-600 transition-colors"
                onClick={handleSave}
              >
                保存
              </button>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}

function SortableComponent({ component, isSelected, onSelect, onDelete }: {
  component: EditorComponent;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: component.id
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 999 : 1
  };

  // 修改点击处理函数
  const handleClick = (e: React.MouseEvent) => {
    // 如果点击的是按钮或者其父元素是按钮，不触发选中
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'button' || target.closest('button')) {
      e.stopPropagation();
      return;
    }
    onSelect();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative group cursor-pointer
        ${isDragging ? 'opacity-50' : ''}
      `}
      onClick={handleClick}
    >
      {/* 拖拽手柄 */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-12
          flex items-center justify-center cursor-move opacity-0 group-hover:opacity-100
          transition-opacity z-10"
      >
        <span className="text-gray-400">⋮⋮</span>
      </div>

      {/* 编辑按钮组 */}
      <div 
        className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-1
          opacity-0 group-hover:opacity-100 transition-opacity z-20"
      >
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700
            transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect();
          }}
        >
          <span className="sr-only">编辑</span>
          ✎
        </button>
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500
            transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
        >
          <span className="sr-only">删除</span>
          ×
        </button>
      </div>

      {/* 组件内容 */}
      <div className={`
        mx-6 rounded-lg transition-all relative z-0
        ${isSelected ? 'ring-2 ring-pink-500 ring-opacity-50' : ''}
      `}>
        <ComponentRenderer
          component={component}
          value={component.defaultValue}
          preview
        />
      </div>
    </div>
  );
}

// 辅助函数：获取组件类型图标
function getComponentTypeIcon(type: ComponentType): string {
  const icons: Record<ComponentType, string> = {
    text: '📝',
    image: '🖼️',
    select: '📋',
    color: '🎨',
    slider: '⚡',
    switch: '🔘'
  };
  return icons[type] || '⚡';
} 