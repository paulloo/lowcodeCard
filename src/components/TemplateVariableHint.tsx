import { useState, useEffect, useRef } from 'react';
import type { editor } from 'monaco-editor';

interface Variable {
  label: string;
  value: string;
  description?: string;
  category: string;
}

interface Props {
  editor: editor.IStandaloneCodeEditor;
  variables: Variable[];
  onClose: () => void;
}

export default function TemplateVariableHint({ editor, variables, onClose }: Props) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // 过滤变量
  const filteredVariables = variables.filter(v => 
    v.label.toLowerCase().includes(search.toLowerCase()) ||
    v.value.toLowerCase().includes(search.toLowerCase())
  );

  // 更新提示框位置
  useEffect(() => {
    const updatePosition = () => {
      const position = editor.getPosition();
      if (position) {
        const coordinates = editor.getScrolledVisiblePosition(position);
        const editorDom = editor.getDomNode();
        if (coordinates && editorDom) {
          const rect = editorDom.getBoundingClientRect();
          setPosition({
            x: rect.left + coordinates.left,
            y: rect.top + coordinates.top + 20
          });
        }
      }
    };

    updatePosition();
    
    // 监听编辑器滚动和大小变化
    const scrollDisposable = editor.onDidScrollChange(updatePosition);
    const layoutDisposable = editor.onDidLayoutChange(updatePosition);

    return () => {
      scrollDisposable.dispose();
      layoutDisposable.dispose();
    };
  }, [editor]);

  // 处理键盘导航
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => Math.min(i + 1, filteredVariables.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredVariables[selectedIndex]) {
            insertVariable(filteredVariables[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [selectedIndex, filteredVariables]);

  const insertVariable = (variable: Variable) => {
    const position = editor.getPosition();
    if (position) {
      editor.executeEdits('', [{
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        },
        text: variable.value
      }]);
      editor.focus();
      onClose();
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-96 overflow-hidden z-50"
    >
      {/* 搜索框 */}
      <div className="p-2 border-b">
        <input
          type="text"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setSelectedIndex(0);
          }}
          placeholder="搜索变量..."
          className="w-full px-3 py-1.5 bg-gray-50 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          autoFocus
        />
      </div>

      {/* 变量列表 */}
      <div className="overflow-y-auto max-h-80">
        {filteredVariables.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            没有找到匹配的变量
          </div>
        ) : (
          <div className="py-2">
            {filteredVariables.map((variable, index) => (
              <button
                key={variable.value}
                className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-start gap-3
                  ${index === selectedIndex ? 'bg-pink-50' : ''}
                `}
                onClick={() => insertVariable(variable)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {variable.label}
                    </span>
                    <span className="text-xs text-gray-500 px-1.5 py-0.5 bg-gray-100 rounded">
                      {variable.category}
                    </span>
                  </div>
                  <code className="mt-0.5 text-xs text-gray-500 block">
                    {variable.value}
                  </code>
                  {variable.description && (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                      {variable.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 快捷键提示 */}
      <div className="px-3 py-2 bg-gray-50 text-xs text-gray-500 border-t">
        <span className="mr-3">↑↓ 选择</span>
        <span className="mr-3">Enter 插入</span>
        <span>Esc 关闭</span>
      </div>
    </div>
  );
} 