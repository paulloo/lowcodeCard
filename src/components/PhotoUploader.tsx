import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useDragUpload } from '../hooks/useDragUpload';
import LoadingSpinner from './LoadingSpinner';
import ImageGenerator from './ImageGenerator';

interface Props {
  type: 'self' | 'partner';
  onUpload: (file: File) => void;
  onGenerate: (url: string) => void;
  imageUrl?: string;
  uploading?: boolean;
  disabled?: boolean;
  isAnimated?: boolean;
  onAnimatedChange?: (isAnimated: boolean) => void;
}

export default function PhotoUploader({ type, onUpload, onGenerate, imageUrl, uploading, disabled, isAnimated, onAnimatedChange }: Props) {
  const [showAI, setShowAI] = useState(false);
  const [dragMessage, setDragMessage] = useState('支持拖拽上传，建议使用正方形照片');
  const { isDragging, dragProps } = useDragUpload({ onUpload });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 文件类型检查
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setDragMessage('只支持 JPG、PNG、GIF 和 WebP 格式');
      return;
    }

    // 文件大小检查
    if (file.size > 10 * 1024 * 1024) {
      setDragMessage('图片大小不能超过 10MB');
      return;
    }
    
    // 检查是否为动图
    const isGif = file.type === 'image/gif';
    if (onAnimatedChange) {
      onAnimatedChange(isGif);
    }
    
    onUpload(file);
  };

  return (
    <div className="relative">
      <div 
        className={`group relative h-32 rounded-lg border-2 border-dashed transition-all overflow-hidden
          ${isDragging ? 'border-pink-400 bg-pink-50' : disabled ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-pink-300'}
          ${imageUrl ? 'border-solid' : ''}
        `}
        {...dragProps}
      >
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="已上传照片" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <label className="cursor-pointer px-3 py-1.5 bg-white/90 rounded-full text-sm text-gray-700 hover:bg-white">
                更换照片
                <input
                  type="file"
                  accept="image/*, image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                  id={`photo-upload-${type}`}
                  disabled={disabled}
                />
              </label>
              <button
                onClick={() => setShowAI(true)}
                className="px-3 py-1.5 bg-pink-500/90 rounded-full text-sm text-white hover:bg-pink-500"
              >
                AI 生成
              </button>
            </div>
            {isAnimated && (
              <span className="absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                GIF
              </span>
            )}
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
                <div className="flex items-center justify-center gap-3">
                  <label className="cursor-pointer px-3 py-1.5 bg-pink-50 rounded-full text-sm text-pink-600 hover:bg-pink-100">
                    上传照片
                    <input
                      type="file"
                      accept="image/*, image/gif"
                      onChange={handleFileChange}
                      className="hidden"
                      id={`photo-upload-${type}`}
                      disabled={disabled}
                    />
                  </label>
                  <span className="text-gray-300">或</span>
                  <button
                    onClick={() => setShowAI(true)}
                    className="px-3 py-1.5 bg-pink-50 rounded-full text-sm text-pink-600 hover:bg-pink-100"
                  >
                    AI 生成
                  </button>
                </div>
                <p className={`mt-2 text-xs ${dragMessage.includes('只支持') || dragMessage.includes('不能超过') ? 'text-red-500' : 'text-gray-400'}`}>
                  {dragMessage}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI 生成面板 */}
      {showAI && (
        <div className="absolute inset-x-0 top-full mt-2 bg-white rounded-lg shadow-lg p-3 border border-gray-100 z-10">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-700">AI 生成照片</h4>
            <button
              onClick={() => setShowAI(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <ImageGenerator
            type={type}
            onGenerate={(url) => {
              onGenerate(url);
              setShowAI(false);
            }}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
} 