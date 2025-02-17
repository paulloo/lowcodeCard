import type { AIConfig } from './types';

export interface ImageGenerateOptions {
  style?: '写实' | '动漫' | '艺术' | '素描';
  scene?: '室内' | '户外' | '城市' | '自然';
  emotion?: '开心' | '浪漫' | '温馨' | '甜蜜';
}

const MOCK_IMAGES = {
  '写实': [
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2',
    'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f',
  ],
  '动漫': [
    'https://example.com/anime-couple-1.jpg',
    'https://example.com/anime-couple-2.jpg',
  ],
  // ... 其他样式的示例图片
};

export class ImageGenerationService {
  private config: AIConfig;
  private isDev: boolean;

  constructor(config: AIConfig) {
    this.config = config;
    this.isDev = import.meta.env.DEV;
  }

  async generateImage(prompt: string, options?: ImageGenerateOptions): Promise<string> {
    // 开发环境使用模拟数据
    if (this.isDev) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const style = options?.style || '写实';
      const images = MOCK_IMAGES[style];
      return images[Math.floor(Math.random() * images.length)];
    }

    // 生产环境使用实际 API
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          prompt: this.buildImagePrompt(prompt, options),
          n: 1,
          size: '512x512',
          response_format: 'url'
        })
      });

      if (!response.ok) {
        throw new Error('图片生成失败');
      }

      const data = await response.json();
      return data.data[0].url;
    } catch (error) {
      console.error('图片生成失败:', error);
      // Fallback 到模拟数据
      const style = options?.style || '写实';
      const images = MOCK_IMAGES[style];
      return images[Math.floor(Math.random() * images.length)];
    }
  }

  private buildImagePrompt(basePrompt: string, options?: ImageGenerateOptions): string {
    const { style = '写实', scene = '户外', emotion = '浪漫' } = options || {};
    return `情侣照片，${style}风格，${scene}场景，${emotion}氛围。${basePrompt}`;
  }
} 