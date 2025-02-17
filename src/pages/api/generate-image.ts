import type { APIRoute } from 'astro';
import { imageGenerationService } from '../../services/ai';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { type, options } = await request.json();
    
    const prompt = type === 'self' 
      ? '年轻帅气的男生'
      : '年轻漂亮的女生';

    const imageUrl = await imageGenerationService.generateImage(prompt, options);

    return new Response(
      JSON.stringify({ imageUrl }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('生成失败:', error);
    return new Response(
      JSON.stringify({ error: '生成失败，请重试' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}; 