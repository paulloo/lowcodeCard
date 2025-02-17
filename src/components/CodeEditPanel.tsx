import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import type { Template, TemplateField } from '../types/template';
import CodeEditor, { type CodeEditorRef } from './CodeEditor';
import TemplateRenderer from './editor/preview/TemplateRenderer';

interface Props {
  template: Template;
  onChange: (template: Template) => void;
}

// 变量面板组件
function VariablesPanel({ 
  template, 
  onInsert 
}: { 
  template: Template; 
  onInsert: (value: string) => void;
}) {
  // 按类型分组变量
  const groups = template.fields.reduce((acc, field) => {
    const group = field.options?.group || '基础变量';
    if (!acc[group]) acc[group] = [];
    acc[group].push(field);
    return acc;
  }, {} as Record<string, TemplateField[]>);

  return (
    <div className="h-full">
      <div className="p-4 border-b">
        <h3 className="font-medium">可用变量</h3>
      </div>
      <div className="p-4 space-y-6">
        {Object.entries(groups).map(([group, fields]) => (
          <div key={group}>
            <h4 className="text-sm font-medium text-gray-700 mb-2">{group}</h4>
            <div className="space-y-2">
              {fields.map(field => (
                <div
                  key={field.id}
                  onClick={() => onInsert(field.path || field.id)}
                  className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{field.label}</span>
                    {field.required && (
                      <span className="text-red-500 text-xs">*</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {field.path || field.id}
                  </div>
                  {field.description && (
                    <div className="text-xs text-gray-400 mt-1">
                      {field.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 代码片段面板组件
function SnippetsPanel({
  type,
  onInsert
}: {
  type: 'html' | 'css' | 'javascript';
  onInsert: (code: string) => void;
}) {
  const snippets = {
    html: [
      {
        label: '基础卡片',
        description: '带有图片和文本的卡片布局',
        code: `
<div class="card">
  <div class="photo">
    <img src="{{images.photo}}" alt="照片" />
  </div>
  <div class="content">
    <p>{{message}}</p>
  </div>
</div>`.trim()
      },
      {
        label: '照片墙',
        description: '网格布局的照片展示',
        code: `
<div class="photo-wall">
  {{#each images.photos}}
  <div class="photo">
    <img src="{{this}}" alt="照片" />
  </div>
  {{/each}}
</div>`.trim()
      }
    ],
    css: [
      {
        label: '卡片样式',
        description: '基础卡片的样式定义',
        code: `
.card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  min-height: 100%;
  background: linear-gradient(135deg, var(--primaryColor), var(--secondaryColor));
}

.photo {
  width: 150px;
  height: 150px;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  text-align: center;
}`.trim()
      },
      {
        label: '照片墙样式',
        description: '网格布局照片墙的样式',
        code: `
.photo-wall {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.photo {
  aspect-ratio: 1;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}`.trim()
      }
    ],
    javascript: [
      {
        label: '图片加载检查',
        description: '检查图片是否正确加载',
        code: `
function checkImages() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.onerror = () => {
      img.src = '/preview/placeholder.jpg';
    };
  });
}

window.addEventListener('load', checkImages);`.trim()
      },
      {
        label: '动画效果',
        description: '添加简单的动画效果',
        code: `
function addAnimations() {
  const photos = document.querySelectorAll('.photo');
  photos.forEach((photo, index) => {
    photo.style.animationDelay = \`\${index * 0.1}s\`;
    photo.classList.add('animate-fade-in');
  });
}

window.addEventListener('load', addAnimations);`.trim()
      }
    ]
  };

  return (
    <div className="h-full">
      <div className="p-4 border-b">
        <h3 className="font-medium">代码片段</h3>
      </div>
      <div className="p-4 space-y-4">
        {snippets[type].map((snippet, index) => (
          <div
            key={index}
            onClick={() => onInsert(snippet.code)}
            className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg border transition-colors"
          >
            <div className="font-medium mb-1">{snippet.label}</div>
            {snippet.description && (
              <div className="text-sm text-gray-500 mb-2">
                {snippet.description}
              </div>
            )}
            <div className="text-xs bg-gray-50 p-2 rounded font-mono line-clamp-3">
              {snippet.code}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 修改主组件中的相关部分
export default function CodeEditPanel({ template, onChange }: Props) {
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'javascript'>('html');
  const [showVariables, setShowVariables] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [previewZoom, setPreviewZoom] = useState(100);

  const htmlEditorRef = useRef<CodeEditorRef>(null);
  const cssEditorRef = useRef<CodeEditorRef>(null);
  const jsEditorRef = useRef<CodeEditorRef>(null);

  // 改进预览变量生成方式
  const previewVariables = useMemo(() => {
    const variables: Record<string, any> = {};
    
    template.fields.forEach(field => {
      // 使用字段路径或ID作为变量路径
      const path = field.path || field.id;
      
      // 处理嵌套路径 (例如: images.photo)
      if (path.includes('.')) {
        const parts = path.split('.');
        let current = variables;
        
        // 创建嵌套对象结构
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        
        // 设置最终值
        current[parts[parts.length - 1]] = getPreviewValue(field);
      } else {
        // 直接设置顶级变量
        variables[path] = getPreviewValue(field);
      }
    });

    return variables;
  }, [template.fields]);

  // 获取预览值的辅助函数
  function getPreviewValue(field: TemplateField) {
    if (field.defaultValue) {
      return field.defaultValue;
    }

    switch (field.type) {
      case 'text':
        return `示例${field.label}`;
      case 'image':
        return '/preview/placeholder.jpg';
      case 'color':
        return '#ff69b4';
      case 'select':
        return field.options?.choices?.[0] || '';
      case 'number':
        return 0;
      case 'boolean':
        return false;
      default:
        return '';
    }
  }

  // 生成模板代码的辅助函数
  function generateTemplateCode(field: TemplateField): string {
    const path = field.path || field.id;
    
    switch (field.type) {
      case 'image':
        return `
<div class="image-field">
  <img src="{{${path}}}" alt="${field.label}" class="preview-image" />
</div>`;
      
      case 'text':
        if (field.options?.rows && field.options.rows > 1) {
          return `
<div class="text-field">
  <label class="field-label">${field.label}</label>
  <div class="text-content">{{${path}}}</div>
</div>`;
        }
        return `
<div class="text-field">
  <label class="field-label">${field.label}</label>
  <div class="text-content">{{${path}}}</div>
</div>`;
      
      case 'color':
        return `
<div class="color-field">
  <label class="field-label">${field.label}</label>
  <div class="color-preview" style="background-color: {{${path}}}"></div>
</div>`;
      
      case 'select':
        return `
<div class="select-field">
  <label class="field-label">${field.label}</label>
  <select class="select-input">
    {{#each ${path}.options}}
    <option value="{{value}}" {{#if selected}}selected{{/if}}>{{label}}</option>
    {{/each}}
  </select>
</div>`;
      
      case 'slider':
        return `
<div class="slider-field">
  <label class="field-label">${field.label}</label>
  <input type="range" 
    min="{{${path}.min}}" 
    max="{{${path}.max}}" 
    value="{{${path}.value}}"
    class="slider-input"
  />
  <div class="slider-value">{{${path}.value}}</div>
</div>`;
      
      case 'datePicker':
        return `
<div class="date-field">
  <label class="field-label">${field.label}</label>
  <div class="date-input">{{${path}}}</div>
</div>`;
      
      case 'timePicker':
        return `
<div class="time-field">
  <label class="field-label">${field.label}</label>
  <div class="time-input">{{${path}}}</div>
</div>`;

      default:
        return `{{${path}}}`;
    }
  }

  // 更新模板代码
  const updateTemplateCode = useCallback(() => {
    // 生成HTML模板
    const htmlTemplate = template.fields.map(field => 
      generateTemplateCode(field)
    ).join('\n');

    // 更新模板
    onChange({
      ...template,
      html: htmlTemplate,
      // 可以根据需要添加默认CSS
      css: template.css || defaultCSS
    });
  }, [template.fields]);

  // 当字段更新时自动更新代码
  useEffect(() => {
    updateTemplateCode();
  }, [template.fields]);

  // 格式化当前编辑器的代码
  const handleFormat = async () => {
    switch (activeTab) {
      case 'html':
        await htmlEditorRef.current?.formatCode();
        break;
      case 'css':
        await cssEditorRef.current?.formatCode();
        break;
      case 'javascript':
        await jsEditorRef.current?.formatCode();
        break;
    }
  };

  return (
    <div className="flex h-full">
      {/* 左侧编辑区 */}
      <div className="flex-1 flex flex-col">
        {/* 工具栏 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex gap-2">
            {(['html', 'css', 'javascript'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-4 py-2 rounded-lg transition-colors
                  ${activeTab === tab 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFormat}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              title="格式化代码 (Alt+Shift+F)"
            >
              格式化
            </button>
            <button
              onClick={() => setShowVariables(!showVariables)}
              className={`
                px-4 py-2 rounded-lg transition-colors
                ${showVariables 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }
              `}
            >
              变量
            </button>
            <button
              onClick={() => setShowSnippets(!showSnippets)}
              className={`
                px-4 py-2 rounded-lg transition-colors
                ${showSnippets 
                  ? 'bg-green-500 text-white' 
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
                }
              `}
            >
              代码片段
            </button>
          </div>
        </div>

        {/* 编辑器区域 */}
        <div className="flex-1 relative">
          {activeTab === 'html' && (
            <div className="h-full">
              <CodeEditor
                ref={htmlEditorRef}
                value={template.html || ''}
                onChange={html => onChange({ ...template, html })}
                language="html"
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  folding: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  autoClosingBrackets: 'always',
                  autoClosingQuotes: 'always',
                  tabSize: 2,
                  wordWrap: 'on'
                }}
              />
            </div>
          )}
          {activeTab === 'css' && (
            <div className="h-full">
              <CodeEditor
                ref={cssEditorRef}
                value={template.css || ''}
                onChange={css => onChange({ ...template, css })}
                language="css"
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  folding: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  autoClosingBrackets: 'always',
                  tabSize: 2,
                  wordWrap: 'on'
                }}
              />
            </div>
          )}
          {activeTab === 'javascript' && (
            <div className="h-full">
              <CodeEditor
                ref={jsEditorRef}
                value={template.script || ''}
                onChange={script => onChange({ ...template, script })}
                language="javascript"
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  folding: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  autoClosingBrackets: 'always',
                  tabSize: 2,
                  wordWrap: 'on'
                }}
              />
            </div>
          )}

          {/* 变量面板 */}
          {showVariables && (
            <div className="absolute right-0 top-0 w-80 h-full bg-white border-l shadow-lg">
              <VariablesPanel
                template={template}
                onInsert={value => {
                  switch (activeTab) {
                    case 'html':
                      htmlEditorRef.current?.insertText(`{{${value}}}`);
                      break;
                    case 'css':
                      cssEditorRef.current?.insertText(`var(--${value})`);
                      break;
                    case 'javascript':
                      jsEditorRef.current?.insertText(`variables.${value}`);
                      break;
                  }
                }}
              />
            </div>
          )}

          {/* 代码片段面板 */}
          {showSnippets && (
            <div className="absolute right-0 top-0 w-80 h-full bg-white border-l shadow-lg">
              <SnippetsPanel
                type={activeTab}
                onInsert={code => {
                  switch (activeTab) {
                    case 'html':
                      htmlEditorRef.current?.insertText(code);
                      break;
                    case 'css':
                      cssEditorRef.current?.insertText(code);
                      break;
                    case 'javascript':
                      jsEditorRef.current?.insertText(code);
                      break;
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 右侧预览区 */}
      <div className="w-96 border-l flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">实时预览</h3>
            <div className="flex items-center gap-2">
              <select
                value={previewDevice}
                onChange={e => setPreviewDevice(e.target.value as any)}
                className="px-2 py-1 border rounded-lg"
              >
                <option value="mobile">手机</option>
                <option value="tablet">平板</option>
                <option value="desktop">桌面</option>
              </select>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPreviewZoom(z => Math.max(50, z - 10))}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  -
                </button>
                <span className="text-sm text-gray-600">{previewZoom}%</span>
                <button
                  onClick={() => setPreviewZoom(z => Math.min(200, z + 10))}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <div 
            className={`
              bg-gray-50 rounded-lg overflow-hidden mx-auto
              ${previewDevice === 'mobile' ? 'w-[375px]' 
                : previewDevice === 'tablet' ? 'w-[768px]' 
                : 'w-full'
              }
            `}
            style={{ 
              transform: `scale(${previewZoom / 100})`,
              transformOrigin: 'top center'
            }}
          >
            <div className="aspect-w-9 aspect-h-16">
              <TemplateRenderer
                template={template}
                variables={previewVariables}
                isPreview={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 默认CSS样式
const defaultCSS = `
.template {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.image-field {
  width: 100%;
}

.preview-image {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 0.5rem;
  object-fit: cover;
}

.text-field {
  width: 100%;
}

.text-content {
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  min-height: 2.5rem;
}

.color-field {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.color-preview {
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  border: 2px solid #e5e7eb;
}

.select-field {
  width: 100%;
}

.select-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: white;
}

.slider-field {
  width: 100%;
}

.slider-input {
  width: 100%;
  margin: 0.5rem 0;
}

.slider-value {
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.date-field,
.time-field {
  width: 100%;
}

.date-input,
.time-input {
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  text-align: center;
}
`.trim();