import { useState } from 'react';
import type { ExportOptions } from './ExportOptions';

interface Props {
  imageUrl: string;
  options: ExportOptions;
  onConfirm: () => void;
  onCancel: () => void;
  onOptionsChange: (options: ExportOptions) => void;
}

export default function ExportPreview({ imageUrl, options, onConfirm, onCancel, onOptionsChange }: Props) {
  const [showOriginalSize, setShowOriginalSize] = useState(false);

  const fileSize = imageUrl.length * 0.75; // base64 to bytes
  const fileSizeFormatted = fileSize > 1024 * 1024
    ? `${(fileSize / (1024 * 1024)).toFixed(1)}MB`
    : `${(fileSize / 1024).toFixed(1)}KB`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            预览导出效果
          </h3>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            <div className={`
              relative rounded-lg overflow-hidden bg-gray-100
              ${showOriginalSize ? 'w-fit mx-auto' : 'aspect-[3/4] max-w-sm mx-auto'}
            `}>
              <img
                src={imageUrl}
                alt="预览"
                className={showOriginalSize ? '' : 'w-full h-full object-contain'}
              />
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowOriginalSize(!showOriginalSize)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {showOriginalSize ? '适应窗口' : '原始尺寸'}
              </button>
              <span className="text-sm text-gray-600">
                文件大小: {fileSizeFormatted}
              </span>
            </div>

            {/* 导出选项 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  图片质量
                </label>
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={options.quality}
                  onChange={e => onOptionsChange({
                    ...options,
                    quality: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
                <div className="text-sm text-gray-600 text-right">
                  {options.quality}%
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  缩放比例
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.5"
                  value={options.scale}
                  onChange={e => onOptionsChange({
                    ...options,
                    scale: parseFloat(e.target.value)
                  })}
                  className="w-full"
                />
                <div className="text-sm text-gray-600 text-right">
                  {options.scale}x
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600"
          >
            确认导出
          </button>
        </div>
      </div>
    </div>
  );
} 