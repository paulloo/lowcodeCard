import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { prompt } = await request.json();

    const response = await fetch(import.meta.env.AI_API_BASE_URL + '/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: import.meta.env.AI_MODEL,
        messages: [
          {
            role: 'system',
            content: '你是一个浪漫的情人节祝福语生成器。生成的内容要温暖、甜蜜、真诚。'
          },
          {
            role: 'user',
            content: prompt || '生成一段情人节祝福语'
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      throw new Error('AI服务请求失败');
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || '生成失败';

    return new Response(JSON.stringify({ message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('生成失败:', error);
    return new Response(
      JSON.stringify({ error: '生成失败，请重试' }),
      { status: 500 }
    );
  }
}; 