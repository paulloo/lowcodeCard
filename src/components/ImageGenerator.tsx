import { useState } from 'react';
import type { ImageGenerateOptions } from '../services/ai/ImageGenerationService';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  onGenerate: (imageUrl: string) => void;
  type: 'self' | 'partner' | 'background' | 'avatar';
  disabled?: boolean;
}

export default function ImageGenerator({ onGenerate, type, disabled }: Props) {
  const [generating, setGenerating] = useState(false);
  const [options, setOptions] = useState<ImageGenerateOptions>({
    style: '写实',
    scene: '户外',
    emotion: '浪漫'
  });

  const handleGenerate = async () => {

    // 尽情期待
    alert('敬请期待');
    return;

    if (generating) return;
    
    setGenerating(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          options,
        }),
      });

      if (!response.ok) throw new Error('生成失败');

      const data = await response.json();
      onGenerate(data.imageUrl);
    } catch (error) {
      console.error('生成失败:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <select
          value={options.style}
          onChange={(e) => setOptions(prev => ({ ...prev, style: e.target.value as any }))}
          className="px-2 py-1 text-sm border rounded"
          disabled={generating || disabled}
        >
          {['写实', '动漫', '艺术', '素描'].map(style => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>
        <select
          value={options.scene}
          onChange={(e) => setOptions(prev => ({ ...prev, scene: e.target.value as any }))}
          className="px-2 py-1 text-sm border rounded"
          disabled={generating || disabled}
        >
          {['室内', '户外', '城市', '自然'].map(scene => (
            <option key={scene} value={scene}>{scene}</option>
          ))}
        </select>
        <select
          value={options.emotion}
          onChange={(e) => setOptions(prev => ({ ...prev, emotion: e.target.value as any }))}
          className="px-2 py-1 text-sm border rounded"
          disabled={generating || disabled}
        >
          {['开心', '浪漫', '温馨', '甜蜜'].map(emotion => (
            <option key={emotion} value={emotion}>{emotion}</option>
          ))}
        </select>
      </div>
      <button
        onClick={handleGenerate}
        disabled={generating || disabled}
        className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 bg-pink-50 text-pink-600 rounded hover:bg-pink-100 disabled:opacity-50 text-sm"
      >
        {generating ? (
          <>
            <LoadingSpinner />
            <span>生成中...</span>
          </>
        ) : (
          <>
            <span>🎨</span>
            <span>AI 生成照片</span>
          </>
        )}
      </button>
    </div>
  );
} 