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
  DragOverEvent,
  DragCancelEvent
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

// 添加自定义组件导入对话框组件
const ImportCustomComponentDialog = ({ isOpen, onClose, onImport }: {
  isOpen: boolean;
  onClose: () => void;
  onImport: (component: EditorComponent) => void;
}) => {
  const [componentData, setComponentData] = useState('');
  const [error, setError] = useState('');

  const handleImport = () => {
    try {
      const component = JSON.parse(componentData);
      // 验证组件数据
      if (!component.type || !component.label) {
        throw new Error('组件数据格式不正确');
      }
      onImport(component);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '无效的组件数据');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h3 className="text-lg font-medium mb-4">导入自定义组件</h3>
        <div className="mb-4">
          <textarea
            className="w-full h-48 p-3 border rounded-lg font-mono text-sm"
            placeholder="粘贴组件 JSON 配置..."
            value={componentData}
            onChange={(e) => {
              setComponentData(e.target.value);
              setError('');
            }}
          />
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={onClose}
          >
            取消
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            onClick={handleImport}
          >
            导入
          </button>
        </div>
      </div>
    </div>
  );
};

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

  // 添加导入对话框状态
  const [showImportDialog, setShowImportDialog] = useState(false);

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
  description: ${JSON.stringify(description || '')},
  style: ${JSON.stringify(style || {}, null, 2)},
  options: ${JSON.stringify(options || {}, null, 2)},
  defaultValue: ${JSON.stringify(defaultValue || '')}
}`;
    }).join(',\n');

    const templateCode = `
// 模板配置
{
  id: '${template.id}',
  name: '${template.name}',
  description: ${JSON.stringify(template.description || '')},
  type: '${template.type}',
  fields: [
    ${code}
  ],
  styles: ${JSON.stringify(template.styles || {}, null, 2)}
}`;

    onCodeChange(templateCode);
  }, [template, onCodeChange]);

  // 添加新的工具函数用于日志记录
  const logDragEvent = (event: string, details: any) => {
    console.log(`[拖拽事件] ${event}:`, {
      timestamp: new Date().toISOString(),
      ...details
    });
  };

  // 添加排序位置计算工具函数
  const calculateDropPosition = (event: DragOverEvent, overRect: DOMRect) => {
    const mouseY = (event.activatorEvent as MouseEvent).clientY;
    const elementHeight = overRect.height;
    const elementY = overRect.top;
    const relativeY = mouseY - elementY;
    const threshold = elementHeight * 0.3; // 调整阈值为 30%

    logDragEvent('计算放置位置详情', {
      mouseY,
      elementY,
      elementHeight,
      relativeY,
      threshold,
      topThreshold: threshold,
      bottomThreshold: elementHeight - threshold
    });

    if (relativeY < threshold) {
      return 'before';
    } else if (relativeY > elementHeight - threshold) {
      return 'after';
    } else {
      // 在中间区域时，根据鼠标位置相对于中心点的位置决定
      return relativeY < elementHeight / 2 ? 'before' : 'after';
    }
  };

  // 修改 handleDragStart 函数
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    
    logDragEvent('开始拖拽', {
      activeId: active.id,
      data: active.data.current
    });
    
    try {
      if (active.data.current?.isNew) {
        const type = active.data.current.type as ComponentType;
        const componentType = componentTypes.find(t => t.type === type);
        
        if (!componentType) {
          throw new Error(`未知的组件类型: ${type}`);
        }

        const newComponent = {
          id: `${type}_${Date.now()}`,
          type,
          label: `新${componentType.label}`,
          required: false,
          hidden: false,
          description: '',
          defaultValue: '',
          style: {},
          options: {}
        };

        setDragPreview({
          show: true,
          component: newComponent
        });

        logDragEvent('创建新组件预览', { component: newComponent });
      } else {
        const component = template.fields.find(f => f.id === active.id);
        if (component) {
          setDragPreview({
            show: true,
            component
          });
          logDragEvent('开始拖拽已有组件', { component });
        } else {
          console.warn(`未找到组件: ${active.id}`);
        }
      }
    } catch (error) {
      console.error('拖拽开始时发生错误:', error);
      // 重置拖拽状态
      setDragPreview({ show: false, component: null });
    }
  }, [template.fields]);

  // 修改 handleDragOver 函数
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    logDragEvent('拖拽过程中', {
      activeId: active.id,
      overId: over?.id,
      activeRect: active.rect,
      overRect: over?.rect,
      activeData: active.data.current,
      overData: over?.data.current
    });

    if (!over) {
      setDropIndicator({ show: false, index: -1, position: 'after' });
      return;
    }

    try {
      const activeIndex = template.fields.findIndex(f => f.id === active.id);
      const overIndex = template.fields.findIndex(f => f.id === over.id);
      
      // 获取拖拽目标的位置信息
      const overRect = over.data.current?.rect as DOMRect | undefined;
      if (!overRect) {
        console.warn('无法获取目标元素位置信息');
        return;
      }

      // 计算放置位置
      const position = calculateDropPosition(event, overRect);
      
      // 优化索引计算
      let targetIndex = overIndex;
      if (position === 'after') {
        targetIndex += 1;
      }
      
      // 如果是拖动已有组件，需要考虑原位置的影响
      if (activeIndex !== -1 && targetIndex > activeIndex) {
        targetIndex -= 1;
      }

      logDragEvent('排序位置计算结果', {
        activeIndex,
        overIndex,
        targetIndex,
        position,
        isSamePosition: activeIndex === targetIndex
      });

      // 避免无意义的状态更新
      if (activeIndex === targetIndex) {
        setDropIndicator({ show: false, index: -1, position: 'after' });
        return;
      }
      
      setDropIndicator({
        show: true,
        index: overIndex,
        position
      });
    } catch (error) {
      console.error('拖拽过程中发生错误:', error);
      setDropIndicator({ show: false, index: -1, position: 'after' });
    }
  }, [template.fields]);

  // 修改 handleDragEnd 函数
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    logDragEvent('结束拖拽', {
      activeId: active.id,
      overId: over?.id,
      dragPreview: dragPreview,
      dropIndicator
    });
    
    try {
      if (!over || !dragPreview.component) {
        throw new Error('无效的拖拽目标或预览组件');
      }

      const newFields = [...template.fields];
      const activeIndex = newFields.findIndex(f => f.id === active.id);
      
      // 处理新组件添加
      if (activeIndex === -1) {
        const overIndex = over.id === 'editor-area' 
          ? newFields.length 
          : newFields.findIndex(f => f.id === over.id);

        if (overIndex === -1 && over.id !== 'editor-area') {
          throw new Error(`未找到目标组件: ${over.id}`);
        }

        const insertIndex = dropIndicator.position === 'after' ? overIndex + 1 : overIndex;
        
        logDragEvent('添加新组件', {
          component: dragPreview.component,
          insertIndex,
          position: dropIndicator.position,
          currentFields: newFields.map(f => f.id)
        });

        newFields.splice(insertIndex, 0, dragPreview.component);
      } else {
        // 处理组件排序
        const overIndex = newFields.findIndex(f => f.id === over.id);
        if (overIndex !== -1 && activeIndex !== overIndex) {
          let targetIndex = overIndex;
          if (dropIndicator.position === 'after') {
            targetIndex += 1;
          }
          // 如果目标位置在源位置之后，需要减1，因为移除源项会影响后续索引
          if (targetIndex > activeIndex) {
            targetIndex -= 1;
          }

          logDragEvent('重排组件', {
            fromIndex: activeIndex,
            overIndex,
            targetIndex,
            position: dropIndicator.position,
            currentFields: newFields.map(f => f.id)
          });

          const [movedItem] = newFields.splice(activeIndex, 1);
          newFields.splice(targetIndex, 0, movedItem);
        }
      }

      // 更新模板
      setTemplate(prev => {
        const updated = {
          ...prev,
          fields: newFields
        };
        logDragEvent('更新模板', { 
          previousFieldsCount: prev.fields.length,
          newFieldsCount: newFields.length,
          newOrder: newFields.map(f => f.id)
        });
        return updated;
      });

      // 标记有未保存的更改
      setHasUnsavedChanges(true);

      // 生成代码预览
      generateCodePreview(newFields);

      // 选中新添加的组件
      if (activeIndex === -1) {
        setSelectedId(dragPreview.component.id);
      }

    } catch (error) {
      console.error('处理拖拽结束时发生错误:', error);
      // 显示错误提示
      // TODO: 添加一个 toast 组件来显示错误信息
    } finally {
      setDragPreview({ show: false, component: null });
      setDropIndicator({ show: false, index: -1, position: 'after' });
    }
  }, [dragPreview.component, template.fields, dropIndicator, setTemplate, setSelectedId, generateCodePreview]);

  // 修改错误处理函数
  const handleDragError = useCallback((event: DragCancelEvent) => {
    console.error('拖拽取消:', {
      active: event.active,
      activatorEvent: event.activatorEvent
    });
    // 重置所有拖拽相关状态
    setDragPreview({ show: false, component: null });
    setDropIndicator({ show: false, index: -1, position: 'after' });
    setActiveComponent(null);
  }, []);

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

  // 添加拖拽动画配置
  const dropAnimationConfig = {
    keyframes({ transform }: any) {
      return [
        { opacity: 1, transform: transform.initial },
        { opacity: 0.8, transform: transform.final }
      ];
    },
    sideEffects({ active, dragOverlay }: any) {
      active.node.style.opacity = '0.5';
      
      return () => {
        active.node.style.opacity = '';
        if (dragOverlay?.node) {
          dragOverlay.node.style.opacity = '';
        }
      };
    },
    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
    duration: 200
  };

  // 添加拖拽约束配置
  const mouseSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // 8px 的移动距离才触发拖拽
      tolerance: 5, // 允许 5px 的误差
      delay: 150, // 150ms 的延迟，防止意外触发
    },
  });

  const sensors = useSensors(mouseSensor);

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

  // 添加导入处理函数
  const handleImportComponent = useCallback((component: EditorComponent) => {
    const newFields = [...template.fields, component];
    setTemplate(prev => ({
      ...prev,
      fields: newFields
    }));
    setHasUnsavedChanges(true);
    generateCodePreview(newFields);
  }, [template.fields, setTemplate, generateCodePreview]);

  // 修改样式实现
  const GlobalStyle = () => (
    <style dangerouslySetInnerHTML={{
      __html: `
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scaleX(1);
          }
          50% {
            opacity: 0.7;
            transform: scaleX(0.98);
          }
        }
        
        .dragging {
          cursor: grabbing !important;
        }
        
        .can-drop {
          background-color: rgba(236, 72, 153, 0.1);
        }
      `
    }} />
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragError}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always
        }
      }}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
    >
      <div className="h-screen flex overflow-hidden">
        {/* 左侧组件面板 */}
        <div className="w-72 border-r border-gray-200 bg-white overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <button
              type="button"
              className="w-full px-4 py-2 text-sm font-medium text-pink-600 bg-pink-50
                hover:bg-pink-100 rounded-lg transition-colors"
              onClick={() => setShowImportDialog(true)}
            >
              导入自定义组件
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ComponentPanel />
          </div>
        </div>

        {/* 中间编辑区域 */}
        <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden">
          {/* 顶部工具栏 */}
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between flex-shrink-0">
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
          <div className="flex-1 overflow-y-auto">
            <div className="min-h-full p-6">
              <div className="max-w-3xl mx-auto">
                <DroppableArea
                  id="editor-area"
                  className="min-h-[calc(100vh-10rem)] p-4 bg-gray-50"
                  items={template.fields.map(f => f.id)}
                >
                  {template.fields.map((field, index) => (
                    <SortableComponent
                      key={field.id}
                      component={field}
                      isSelected={selectedId === field.id}
                      onSelect={() => handleEditComponent(field.id)}
                      onDelete={() => handleDeleteComponent(field.id)}
                      index={index}
                    />
                  ))}
                </DroppableArea>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧属性面板 */}
        <div className="w-80 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
          <div className="flex-shrink-0 p-4 border-b border-gray-200">
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

        {/* 拖拽预览和指示器 */}
        <DragOverlay dropAnimation={dropAnimationConfig}>
          {dragPreview.show && dragPreview.component && (
            <div className="p-4 bg-white rounded-lg shadow-xl border-2 border-pink-500/50
              backdrop-blur-sm transform scale-105 transition-transform">
              <ComponentRenderer
                component={dragPreview.component}
                value={dragPreview.component.defaultValue}
                preview
              />
            </div>
          )}
        </DragOverlay>

        {/* 优化放置位置指示器 */}
        {dropIndicator.show && (
          <div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500
              transform transition-all duration-200 ease-out"
            style={{
              top: `${dropIndicator.position === 'before' ? -2 : 2}px`,
              zIndex: 1000,
              animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
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

        {/* 添加导入对话框 */}
        <ImportCustomComponentDialog
          isOpen={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          onImport={handleImportComponent}
        />
      </div>

      {/* 添加全局样式 */}
      <GlobalStyle />
    </DndContext>
  );
}

function SortableComponent({ 
  component, 
  isSelected, 
  onSelect, 
  onDelete,
  index 
}: {
  component: EditorComponent;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: component.id,
    data: {
      index,
      component
    }
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: transition || undefined,
    zIndex: isDragging ? 999 : 1,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative group
        mb-4 last:mb-0
        rounded-lg bg-white
        shadow-sm hover:shadow-md
        transition-all duration-200
        ${isDragging ? 'shadow-lg ring-2 ring-pink-500 ring-opacity-50' : ''}
        ${isSelected ? 'ring-2 ring-pink-500 ring-opacity-50' : ''}
      `}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.tagName.toLowerCase() === 'button' || target.closest('button')) {
          e.stopPropagation();
          return;
        }
        onSelect();
      }}
    >
      {/* 拖拽手柄 */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-12
          flex items-center justify-center cursor-move opacity-0 group-hover:opacity-100
          transition-opacity z-10"
      >
        <div className="p-1 rounded hover:bg-gray-100">
          <span className="text-gray-400">⋮⋮</span>
        </div>
      </div>

      {/* 组件内容 */}
      <div className="pl-8 pr-20">
        <ComponentRenderer
          component={component}
          value={component.defaultValue}
          preview
        />
      </div>

      {/* 操作按钮组 */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1
        opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700
            transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50"
          onClick={() => onSelect()}
          title="编辑组件"
        >
          <span className="sr-only">编辑</span>
          ✎
        </button>
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500
            transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          onClick={() => onDelete()}
          title="删除组件"
        >
          <span className="sr-only">删除</span>
          ×
        </button>
      </div>

      {/* 排序指示器 */}
      {isDragging && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-pink-500 transform -translate-y-1/2" />
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-pink-500 transform translate-y-1/2" />
        </div>
      )}
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