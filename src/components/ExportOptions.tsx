import { useState } from 'react';

interface Props {
  onExport: (options: ExportOptions) => void;
  loading?: boolean;
  disabled?: boolean;
}

export interface ExportOptions {
  format: 'png' | 'jpg' | 'gif';
  quality: number;
  scale: number;
  withAnimation: boolean;
  filename: string;
}

export default function ExportOptions({ onExport, loading, disabled }: Props) {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 90,
    scale: 2,
    withAnimation: false,
    filename: `valentine-card-${Date.now()}`
  });

  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          onClick={() => onExport(options)}
          disabled={loading || disabled}
          className={`
            px-6 py-3 rounded-l-full shadow-lg
            ${loading || disabled
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600'
            }
            text-white font-medium transition-colors
          `}
        >
          {loading ? '导出中...' : disabled ? '请先选择模板' : '导出贺卡'}
        </button>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="px-3 py-3 rounded-r-full bg-pink-500 hover:bg-pink-600 text-white shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {showOptions && (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-lg shadow-xl p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              文件格式
            </label>
            <select
              value={options.format}
              onChange={e => setOptions(prev => ({ ...prev, format: e.target.value as 'png' | 'jpg' | 'gif' }))}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="png">PNG (推荐)</option>
              <option value="jpg">JPG</option>
              <option value="gif">GIF (支持动画)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              图片质量 ({options.quality}%)
            </label>
            <input
              type="range"
              min="60"
              max="100"
              value={options.quality}
              onChange={e => setOptions(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              缩放比例 ({options.scale}x)
            </label>
            <input
              type="range"
              min="1"
              max="4"
              step="0.5"
              value={options.scale}
              onChange={e => setOptions(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>

          {options.format === 'gif' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="withAnimation"
                checked={options.withAnimation}
                onChange={e => setOptions(prev => ({ ...prev, withAnimation: e.target.checked }))}
                className="rounded text-pink-500 focus:ring-pink-500"
              />
              <label htmlFor="withAnimation" className="ml-2 text-sm text-gray-700">
                包含动画效果
              </label>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              文件名
            </label>
            <input
              type="text"
              value={options.filename}
              onChange={e => setOptions(prev => ({ ...prev, filename: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
} 