import { useState, useRef } from 'react';
import type { Template } from '../services/template/TemplateManager';
import { ImageService } from '../services/image/ImageService';

interface Props {
  onImport: (template: Omit<Template, 'id' | 'type'>) => void;
  onCancel: () => void;
}

export default function TemplateImporter({ onImport, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageService = ImageService.getInstance();

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      if (file.type === 'application/json') {
        // 导入JSON格式的模板
        const content = await file.text();
        const template = JSON.parse(content);
        validateTemplate(template);
        await processTemplateImages(template);
        onImport(template);
      } else if (file.name.endsWith('.html')) {
        // 导入HTML文件
        const content = await file.text();
        const template = parseHTMLTemplate(content);
        validateTemplate(template);
        await processTemplateImages(template);
        onImport(template);
      } else {
        throw new Error('不支持的文件格式');
      }
    } catch (err) {
      setError('导入模板失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateTemplate = (template: any) => {
    if (!template.name || !template.html || !template.css) {
      throw new Error('模板格式不正确');
    }
  };

  const parseHTMLTemplate = (html: string): Omit<Template, 'id' | 'type'> => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 提取样式
    const styleElements = Array.from(doc.getElementsByTagName('style'));
    const css = styleElements
      .map(style => style.textContent)
      .filter((text): text is string => text !== null)
      .join('\n');

    // 提取脚本
    const scriptElements = Array.from(doc.getElementsByTagName('script'));
    const script = scriptElements
      .map(script => script.textContent)
      .filter((text): text is string => text !== null)
      .join('\n');

    // 移除样式和脚本标签
    styleElements.forEach(el => el.parentNode?.removeChild(el));
    scriptElements.forEach(el => el.parentNode?.removeChild(el));

    return {
      name: '导入的模板',
      html: doc.body.innerHTML,
      css,
      script: script || undefined,
      thumbnail: '',
      variables: {
        images: {},
        message: '',
        styles: {
          colors: ['#ff69b4', '#ff1493'],
          effects: []
        }
      }
    };
  };

  const processTemplateImages = async (template: Omit<Template, 'id' | 'type'>) => {
    const { html, css, errors } = await imageService.processTemplateImages({
      html: template.html,
      css: template.css
    });

    if (errors.length > 0) {
      console.warn('模板导入警告:', errors);
    }

    template.html = html;
    template.css = css;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">导入模板</h2>
        
        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-500 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.json"
              onChange={handleImport}
              className="hidden"
              id="template-import"
              disabled={loading}
            />
            <label
              htmlFor="template-import"
              className={`
                inline-block px-4 py-2 rounded-lg
                ${loading 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                }
                text-white transition-colors
              `}
            >
              {loading ? '处理中...' : '导入模板'}
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 