import { useRef } from 'react';
import { useDragUpload } from '../hooks/useDragUpload';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  onUpload: (file: File) => void;
  uploading?: boolean;
  disabled?: boolean;
  label?: string;
}

export default function ImageUploader({ onUpload, uploading, disabled, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isDragging, dragProps } = useDragUpload({ onUpload });

  return (
    <div
      className={`relative rounded-lg border-2 border-dashed transition-all ${
        isDragging 
          ? 'border-pink-400 bg-pink-50' 
          : disabled 
            ? 'border-gray-200 bg-gray-50' 
            : 'border-gray-300 hover:border-pink-300'
      }`}
      {...dragProps}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
        }}
        className="hidden"
        disabled={disabled}
      />
      
      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="w-full p-4 text-center"
      >
        <div className="flex flex-col items-center space-y-2">
          {uploading ? (
            <LoadingSpinner />
          ) : (
            <>
              <span className="text-2xl">📷</span>
              <span className="text-sm text-gray-600">
                {label || '点击或拖拽上传图片'}
              </span>
            </>
          )}
        </div>
      </button>
    </div>
  );
} 