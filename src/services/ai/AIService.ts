import type { AIConfig, ChatMessage, ChatResponse, GenerateOptions } from './types';

// 模拟数据
const MOCK_MESSAGES = {
  '浪漫': [
    "亲爱的，有你的每一天都是情人节。愿我们的爱情像星星一样永远闪耀。",
    "时光飞逝，但我对你的爱永远不变。感谢你让我的生活如此美好。",
  ],
  '幽默': [
    "听说你在找一个又帅又可爱的人，不好意思，让你久等了！情人节快乐！",
    "你知道为什么我这么喜欢你吗？因为除了你，没人受得了我的土味情话了！",
  ],
  '文艺': [
    "你是我诗篇里最美的意象，是我生命中最温柔的风景。情人节快乐，我的挚爱。",
    "愿我们的爱情，如同诗行般优美，如同花开般绚烂。",
  ],
  '简约': [
    "遇见你，是我最大的幸福。情人节快乐！",
    "有你在的每一天，都值得庆祝。",
  ]
};

export class AIService {
  private config: AIConfig;
  private isDev: boolean;

  constructor(config: AIConfig) {
    this.config = config;
    this.isDev = import.meta.env.DEV; // 判断是否是开发环境
  }

  private getSystemPrompt(options: GenerateOptions = {}): string {
    const { style = '浪漫', tone = '甜蜜', length = '中' } = options;
    
    const lengthGuide = {
      '短': '30-50字',
      '中': '50-100字',
      '长': '100-200字'
    };

    return `你是一个专业的情人节祝福语生成助手。请按照以下要求生成祝福语：
    - 风格：${style}
    - 语气：${tone}
    - 长度：${lengthGuide[length]}
    - 要求：温暖、真诚、富有感情，避免过于俗套的表达
    - 确保内容积极向上，富有创意，且符合中国情人节文化
    `;
  }

  async generateMessage(prompt: string, options?: GenerateOptions): Promise<ChatResponse> {
    // 开发环境使用模拟数据
    if (this.isDev) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟延迟
      const style = options?.style || '浪漫';
      const messages = MOCK_MESSAGES[style];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      return { message: randomMessage };
    }

    // 生产环境使用真实 API
    try {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: this.getSystemPrompt(options)
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature: 0.7,
          max_tokens: 200,
          presence_penalty: 0.6,
          frequency_penalty: 0.8,
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'AI 服务请求失败');
      }

      const data = await response.json();
      return {
        message: data.choices[0].message.content.trim()
      };
    } catch (error) {
      console.error('AI 生成失败:', error);
      // 如果 API 调用失败，fallback 到模拟数据
      const style = options?.style || '浪漫';
      const messages = MOCK_MESSAGES[style];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      return { message: randomMessage };
    }
  }
} 