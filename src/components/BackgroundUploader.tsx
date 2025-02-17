import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useDragUpload } from '../hooks/useDragUpload';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  onUpload: (file: File) => void;
  imageUrl?: string;
  uploading?: boolean;
  disabled?: boolean;
}

export default function BackgroundUploader({ onUpload, imageUrl, uploading, disabled }: Props) {
  const [dragMessage, setDragMessage] = useState('支持拖拽上传，建议使用宽幅图片');
  const { isDragging, dragProps } = useDragUpload({ onUpload });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 文件类型检查
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setDragMessage('只支持 JPG、PNG 和 WebP 格式');
      return;
    }

    // 文件大小检查
    if (file.size > 5 * 1024 * 1024) {
      setDragMessage('图片大小不能超过 5MB');
      return;
    }
    
    onUpload(file);
  };

  return (
    <div className="relative">
      <div 
        className={`group relative h-24 rounded-lg border-2 border-dashed transition-all overflow-hidden
          ${isDragging ? 'border-pink-400 bg-pink-50' : disabled ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-pink-300'}
          ${imageUrl ? 'border-solid' : ''}
        `}
        {...dragProps}
      >
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="背景图片" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <label className="cursor-pointer px-3 py-1.5 bg-white/90 rounded-full text-sm text-gray-700 hover:bg-white">
                更换背景
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={disabled}
                />
              </label>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {uploading ? (
              <div className="text-center">
                <LoadingSpinner />
                <p className="mt-2 text-sm text-gray-500">上传中...</p>
              </div>
            ) : (
              <div className="text-center">
                <label className="cursor-pointer px-3 py-1.5 bg-pink-50 rounded-full text-sm text-pink-600 hover:bg-pink-100">
                  上传背景图片
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={disabled}
                  />
                </label>
                <p className={`mt-2 text-xs ${dragMessage.includes('只支持') || dragMessage.includes('不能超过') ? 'text-red-500' : 'text-gray-400'}`}>
                  {dragMessage}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 