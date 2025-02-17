interface GenerateMessageOptions {
  type: string;
  tone: string;
  length: string;
}

interface GenerateMessageResponse {
  message: string;
}

class AIService {
  async generateMessage(options: GenerateMessageOptions): Promise<string> {
    try {
      const response = await fetch('/api/generate-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error('生成消息失败');
      }

      const data: GenerateMessageResponse = await response.json();
      
      // 确保返回字符串
      return data.message || '';
    } catch (error) {
      console.error('AI 生成消息失败:', error);
      throw error;
    }
  }
}

export const aiService = new AIService(); 