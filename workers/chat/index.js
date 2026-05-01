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
      // 非流式调用 OpenAI API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          stream: false
        })
      });

      // API 错误处理
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('OpenAI API error:', errorBody);
        return new Response(JSON.stringify({
          error: 'AI 服务暂时不可用，请稍后重试'
        }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 解析完整响应
      const data = await response.json();
      const messageContent = data.choices?.[0]?.message?.content || '';
      const filteredContent = filterReasoning(messageContent);

      // 返回 JSON 完整响应
      return new Response(JSON.stringify({ content: filteredContent }), {
        headers: {
          'Content-Type': 'application/json',
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

// 过滤 reasoning 内容
function filterReasoning(content) {
  if (!content) return '';

  // 过滤 <reasoning>...</reasoning> 标签包裹的内容
  content = content.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '');

  // 过滤 <!-- reasoning --> 注释内容
  content = content.replace(/<!--[\s\S]*?-->/gi, '');

  // 过滤 <think>...</think> 标签包裹的内容
  content = content.replace(/<think>[\s\S]*?<\/think>/gi, '');

  return content.trim();
}
