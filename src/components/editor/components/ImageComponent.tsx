import { useState, useCallback } from 'react';
import type { EditorComponent } from '../../../types/editor';

interface Props {
  component: EditorComponent;
  onChange: (updates: Partial<EditorComponent>) => void;
  preview?: boolean;
}

export function ImageComponent({ component, onChange, preview = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const allowedTypes = component.options?.allowedTypes || ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('不支持的文件类型');
      return;
    }

    // 验证文件大小
    const maxSize = component.options?.maxSize || 5 * 1024 * 1024; // 默认5MB
    if (file.size > maxSize) {
      setError('文件大小超出限制');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 这里可以添加文件上传逻辑
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange({ defaultValue: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('上传失败');
      console.error('Image upload failed:', err);
    } finally {
      setLoading(false);
    }
  }, [component.options, onChange]);

  if (preview) {
    return (
      <div 
        className="image-component"
        style={component.style}
      >
        <img
          src={component.defaultValue || '/placeholder.jpg'}
          alt={component.label}
          className="w-full h-full object-cover rounded"
        />
      </div>
    );
  }

  return (
    <div className="image-component-editor relative">
      <div
        className={`
          aspect-video bg-gray-100 rounded overflow-hidden
          border-2 border-dashed 
          ${error ? 'border-red-500' : 'border-gray-300 hover:border-pink-500'} 
          transition-colors
          ${loading ? 'opacity-50' : ''}
        `}
      >
        {component.defaultValue ? (
          <img
            src={component.defaultValue}
            alt={component.label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-500">点击或拖拽上传图片</span>
          </div>
        )}

        <input
          type="file"
          accept={component.options?.allowedTypes?.join(',') || 'image/*'}
          onChange={handleFileChange}
          disabled={loading || component.options?.disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
} 