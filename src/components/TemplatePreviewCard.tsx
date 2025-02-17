import { useState, useMemo } from 'react';
import type { Template } from '../types/template';
import TemplateRenderer from './editor/preview/TemplateRenderer';

interface Props {
  template: Template;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  previewData?: {
    images?: {
      self?: string;
      partner?: string;
      background?: string;
    };
    message?: string;
  };
}

// 预定义一些渐变色组合
const GRADIENTS = [
  ['#ff69b4', '#ff1493'], // 粉红
  ['#FF6B6B', '#FF8E8E'], // 珊瑚红
  ['#845EC2', '#D65DB1'], // 紫粉
  ['#FF9671', '#FFC75F'], // 橙黄
  ['#F9F871', '#FFC75F'], // 柠檬黄
  ['#00C9A7', '#4D8076'], // 青绿
  ['#4B4453', '#B0A8B9'], // 优雅灰
  ['#C34A36', '#FF8066']  // 砖红
];

export default function TemplatePreviewCard({
  template,
  selected,
  onSelect,
  onEdit,
  onDelete,
  previewData
}: Props) {
  const [isHovered, setIsHovered] = useState(false);

  // 为每个模板生成固定的渐变色
  const gradient = useMemo(() => {
    if (template.thumbnail) return null;
    // 使用模板ID生成固定的索引，这样每次渲染都是同一个渐变色
    const index = Math.abs(template.id.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0)) % GRADIENTS.length;
    return GRADIENTS[index];
  }, [template.id]);

  // 获取预览变量
  const getPreviewVariables = () => {
    const variables: Record<string, any> = {};
    
    // 添加空值检查
    if (!template.fields) return variables;
    
    template.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        variables[field.id] = field.defaultValue;
      } else {
        // 根据字段类型设置默认预览值
        switch (field.type) {
          case 'text':
            variables[field.id] = `示例${field.label}`;
            break;
          case 'image':
            variables[field.id] = '/preview/placeholder.jpg';
            break;
          case 'color':
            variables[field.id] = '#ff69b4';
            break;
          case 'number':
            variables[field.id] = 0;
            break;
          case 'boolean':
            variables[field.id] = false;
            break;
          case 'select':
            variables[field.id] = field.options?.choices?.[0] || '';
            break;
          default:
            variables[field.id] = '';
        }
      }
    });

    return variables;
  };

  // 获取主色调
  const getPrimaryColor = () => {
    // 添加空值检查
    if (!template.fields) return '#ff69b4';
    
    const colorField = template.fields.find(
      field => field.type === 'color' && field.options?.group === '样式设置'
    );
    return colorField?.defaultValue || '#ff69b4';
  };

  // 使用 useMemo 缓存预览变量
  const previewVariables = useMemo(() => ({
    ...getPreviewVariables(),
    images: {
      self: previewData?.images?.self || '/preview/self.jpg',
      partner: previewData?.images?.partner || '/preview/partner.jpg',
      background: previewData?.images?.background || ''
    },
    message: previewData?.message || '预览文本',
    styles: {
      colors: [getPrimaryColor()],
      effects: []
    }
  }), [template.fields, previewData, getPrimaryColor]);

  return (
    <div className="group relative">
      <div
        className={`
          relative aspect-[4/5] rounded-xl overflow-hidden transition-all duration-200
          ${selected 
            ? 'ring-4 ring-pink-500 ring-offset-2 scale-[1.02]' 
            : 'hover:ring-2 hover:ring-pink-300 hover:ring-offset-1 hover:scale-[1.01]'
          }
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onSelect}
      >
        {/* 预览内容 */}
        <div className="w-full h-full">
          {template.thumbnail ? (
            // 如果有缩略图就显示缩略图
            <img 
              src={template.thumbnail} 
              alt={template.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // 图片加载失败时移除src属性，触发渐变色背景
                e.currentTarget.removeAttribute('src');
              }}
            />
          ) : gradient ? (
            // 如果没有缩略图，显示渐变色背景
            <div 
              className="w-full h-full flex items-center justify-center p-8 text-white"
              style={{
                background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`
              }}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">✨</div>
                <div className="text-sm opacity-90">{template.name}</div>
              </div>
            </div>
          ) : (
            // 如果都没有，显示模板预览
            <div className="w-full h-full p-4">
              <TemplateRenderer
                template={template}
                variables={previewVariables}
                isPreview={true}
              />
            </div>
          )}
        </div>

        {/* 模板信息 */}
        <div 
          className={`
            absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent 
            p-3 transition-all duration-200
            ${isHovered ? 'h-full justify-end' : 'h-auto'}
          `}
        >
          <div className="space-y-1">
            <h3 className="text-white font-medium">{template.name}</h3>
            {template.description && (
              <p className="text-white/80 text-sm">{template.description}</p>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        {(onEdit || onDelete) && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-lg">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-2 text-gray-600 hover:text-blue-500"
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('确定要删除这个模板吗？')) {
                      onDelete();
                    }
                  }}
                  className="p-2 text-gray-600 hover:text-red-500"
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 标签 */}
      {template.tags && template.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {template.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
} 