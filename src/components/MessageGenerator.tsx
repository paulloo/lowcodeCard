import { useState } from 'react';
import type { GenerateOptions } from '../services/ai/types';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  onGenerate: (message: string) => void;
  disabled?: boolean;
}

export default function MessageGenerator({ onGenerate, disabled }: Props) {
  const [generating, setGenerating] = useState(false);
  const [options, setOptions] = useState<GenerateOptions>({
    style: '浪漫',
    tone: '甜蜜',
    length: '中'
  });

  const handleGenerate = async () => {
    if (generating) return;
    
    setGenerating(true);
    try {
      const response = await fetch('/api/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ options }),
      });

      if (!response.ok) throw new Error('生成失败');

      const data = await response.json();
      onGenerate(data.message);
    } catch (error) {
      console.error('生成失败:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <select
          value={options.style}
          onChange={(e) => setOptions(prev => ({ ...prev, style: e.target.value as any }))}
          className="px-3 py-1 rounded border border-gray-300 text-sm"
          disabled={generating || disabled}
        >
          {['浪漫', '幽默', '文艺', '简约'].map(style => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>
        <select
          value={options.tone}
          onChange={(e) => setOptions(prev => ({ ...prev, tone: e.target.value as any }))}
          className="px-3 py-1 rounded border border-gray-300 text-sm"
          disabled={generating || disabled}
        >
          {['甜蜜', '深情', '轻松', '正式'].map(tone => (
            <option key={tone} value={tone}>{tone}</option>
          ))}
        </select>
        <select
          value={options.length}
          onChange={(e) => setOptions(prev => ({ ...prev, length: e.target.value as any }))}
          className="px-3 py-1 rounded border border-gray-300 text-sm"
          disabled={generating || disabled}
        >
          {['短', '中', '长'].map(length => (
            <option key={length} value={length}>{length}</option>
          ))}
        </select>
      </div>
      <button
        onClick={handleGenerate}
        disabled={generating || disabled}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-md hover:bg-pink-100 disabled:opacity-50"
      >
        {generating ? (
          <>
            <LoadingSpinner />
            <span>生成中...</span>
          </>
        ) : (
          <>
            <span>✨</span>
            <span>AI 生成祝福语</span>
          </>
        )}
      </button>
    </div>
  );
} 