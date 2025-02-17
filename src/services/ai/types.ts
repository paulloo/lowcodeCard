export interface AIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerateOptions {
  style?: '浪漫' | '幽默' | '文艺' | '简约';
  tone?: '甜蜜' | '深情' | '轻松' | '正式';
  length?: '短' | '中' | '长';
}

export interface ChatResponse {
  message: string;
  error?: string;
} 