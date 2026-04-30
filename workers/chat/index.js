const MAX_TURNS = 5;

/**
 * YYTI Chat Worker
 * 处理 AI 对话请求，转发至 OpenAI API
 */
export default {
  async fetch(request, env) {
    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { messages, systemPrompt, turns } = body;

    // 空消息拦截
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage || !lastUserMessage.content.trim()) {
      return new Response(JSON.stringify({ error: '消息不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 对话轮次检查
    if (turns >= MAX_TURNS) {
      return new Response(JSON.stringify({
        error: '对话轮次已用完，请返回重新选择'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 检查 API Key
    if (!env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({
        error: 'API 未配置'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      // 流式调用 OpenAI API
      const stream = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          stream: true
        })
      });

      // API 错误处理
      if (!stream.ok) {
        const errorBody = await stream.text();
        console.error('OpenAI API error:', errorBody);
        return new Response(JSON.stringify({
          error: 'AI 服务暂时不可用，请稍后重试'
        }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 流式返回
      return new Response(stream.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (err) {
      console.error('Worker error:', err);
      return new Response(JSON.stringify({
        error: '网络错误，请检查连接'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
