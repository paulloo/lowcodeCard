import { AIService } from './AIService';
import type { AIConfig } from './types';

const config: AIConfig = {
  apiKey: import.meta.env.AI_API_KEY,
  baseUrl: import.meta.env.AI_API_BASE_URL,
  model: import.meta.env.AI_MODEL,
};

export const aiService = new AIService(config);

// 导出类型
export type { ChatResponse } from './types'; 