# YYTI AI 对话功能设计

## Context

用户想要为 YYTI（压抑指数测试）添加 AI 对话功能。当用户完成测试并查看了哲学/心理学/玄学指引后，可以就某一推荐内容与 AI 进行对话。

**核心需求**：
- 点击推荐项 → 弹出 Chat Overlay → AI 以特定角色回答用户问题
- Philosophy：扮演推荐书籍的作者
- Psychology：扮演推荐书籍的作者
- Metaphysics：扮演玄学大师，进行随机起卦并解读

**技术约束**：纯前端 index.html 无法安全存储 API Key，需使用 Cloudflare Workers 作为后端代理。

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      index.html (前端)                       │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │ Philosophy  │    │ Psychology  │    │ Metaphysics │    │
│  │   Panel     │    │    Panel    │    │    Panel    │    │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    │
│         │                   │                   │            │
│         └───────────────────┼───────────────────┘            │
│                             │                                │
│              ┌──────────────┴──────────────┐                │
│              │      Chat Overlay             │                │
│              │  ┌────────────────────────┐  │                │
│              │  │  AI 角色身份显示        │  │                │
│              │  │  对话消息列表           │  │                │
│              │  │  用户输入框             │  │                │
│              │  └────────────────────────┘  │                │
│              └──────────────┬───────────────┘                │
└────────────────────────────┼────────────────────────────────┘
                             │ fetch /v1/chat
                             ▼
┌─────────────────────────────────────────────────────────────┐
│               Cloudflare Workers (后端代理)                   │
│                                                              │
│  - 存储 API Key（环境变量）                                  │
│  - 注入系统提示词（角色设定）                                 │
│  - 限制对话轮次（如 5 轮）                                    │
│  - 流式返回（SSE）                                           │
└────────────────────────────┬────────────────────────────────┘
                             │ api.openai.com / api.anthropic.com
                             ▼
                      LLM API (GPT-4o / Claude)
```

---

## UI Design

### Chat Overlay 布局

```
┌────────────────────────────────────────────────────────────┐
│  [← 返回]           塞内卡正在聆听...           [清空对话]  │
├────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐   │
│  │ 塞内卡（公元前4年-65年）                             │   │
│  │ 斯多葛学派哲学家、《谈话录》作者                      │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │                    对话消息列表                       │   │
│  │                    （可滚动区域）                     │   │
│  │                                                     │   │
│  │  [AI 消息气泡]  作为塞内卡，我理解你当前的学业压力...  │   │
│  │                                                     │   │
│  │                        [用户 消息气泡]               │   │
│  │                        学习真的有意义吗？             │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ 输入消息...                                    [发送]│   │
│  └────────────────────────────────────────────────────┘   │
│  剩余对话轮次：4/5                                         │
└────────────────────────────────────────────────────────────┘
```

### Chat Overlay CSS 样式

```css
/* Chat Overlay 容器 */
.chat-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

/* Chat 窗口 */
.chat-window {
  width: 90%;
  max-width: 500px;
  height: 80vh;
  max-height: 700px;
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

/* Chat Header */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--card-bg);
}

.chat-back-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
}

.chat-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.chat-clear-btn {
  background: none;
  border: none;
  color: var(--text-light);
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
}

/* 角色身份卡片 */
.chat-identity {
  padding: 16px 20px;
  background: var(--bg-gradient);
  border-bottom: 1px solid var(--border-color);
}

.chat-identity-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.chat-identity-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 消息列表 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  line-height: 1.5;
  font-size: 14px;
}

.chat-message.ai {
  align-self: flex-start;
  background: var(--bg-gradient);
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
}

.chat-message.user {
  align-self: flex-end;
  background: var(--primary);
  color: white;
  border-bottom-right-radius: 4px;
}

/* 输入区域 */
.chat-input-area {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}

.chat-input-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: var(--primary);
}

.chat-send-btn {
  padding: 12px 20px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.chat-send-btn:hover {
  background: var(--primary-dark);
}

.chat-send-btn:disabled {
  background: var(--text-light);
  cursor: not-allowed;
}

.chat-turns {
  font-size: 12px;
  color: var(--text-light);
  text-align: center;
  margin-top: 8px;
}

/* 响应式适配 */
@media (max-width: 480px) {
  .chat-window {
    width: 100%;
    height: 100%;
    max-height: 100%;
    border-radius: 0;
  }
}
```

### 推荐项的"聊天"按钮

每个 rec-item 添加相对定位和聊天按钮：

```css
.rec-item {
  position: relative;
  padding: 10px;
  padding-right: 50px; /* 为按钮留出空间 */
  background: var(--bg-gradient);
  border-radius: var(--radius-sm);
}

.chat-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: var(--primary-light);
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.chat-btn:hover {
  background: var(--primary);
  transform: translateY(-50%) scale(1.1);
}
```

```html
<div class="rec-item">
  <div class="rec-book">塞内卡《谈话录》</div>
  <div class="rec-reason">学业压力下的斯多葛智慧</div>
  <button class="chat-btn" onclick="openChat('philosophy', '塞内卡', this)" title="与塞内卡对话">💬</button>
</div>
```

**注意**：`openChat(type, itemName, btn)` 的 `itemName` 从推荐项的书名/工具名中提取：

| type | 推荐项格式 | itemName 提取规则 | 示例 |
|------|-----------|------------------|------|
| philosophy | `"人物《作品》"` | 取 `《` 前的字符 | `"塞内卡《谈话录》"` → `"塞内卡"` |
| psychology | `"人物《作品》"` | 取 `《` 前的字符 | `"阿德勒《自卑与超越》"` → `"阿德勒"` |
| metaphysics | `"工具名"` | 直接使用 | `"梅花易数"` → `"梅花易数"` |

```javascript
function extractItemName(type, bookOrTool) {
  if (type === 'metaphysics') return bookOrTool; // 直接返回工具名
  const match = bookOrTool.match(/^(.+?)《/);     // 提取作者/人物名
  return match ? match[1] : bookOrTool;
}
```

---

## Data Flow

### 1. 打开对话

```javascript
function openChat(type, itemName) {
  // type: 'philosophy' | 'psychology' | 'metaphysics'
  // itemName: 推荐项名称（如 "塞内卡"、"卡伦·霍妮"、"梅花易数"）

  // 1. 根据 type 和 itemName 加载角色设定
  const systemPrompt = buildSystemPrompt(type, itemName);

  // 2. 创建 overlay DOM
  createChatOverlay(systemPrompt);

  // 3. 发送初始欢迎消息（AI 主动打招呼）
  sendInitialGreeting();
}
```

### 2. 构建系统提示词

```javascript
function buildSystemPrompt(type, itemName) {
  const basePrompts = {
    philosophy: `你扮演 ${itemName}，一位历史上的真实哲学家（代表作品见推荐书籍）。
你以第一人称"我"来回答问题。
当用户提问时，你结合你的著作、思想来给出建议。
保持角色一致性，即使面对与你的思想不符的问题，也要以你的视角来回应。
回答使用文言文与白话文结合的风格，体现古典气质。
重要：当用户描述自己的困扰时，你首先要表达理解和同情。`,

    psychology: `你是 ${itemName}，一位心理学大师。
你以第一人称"我"来回答问题，结合你的心理学理论来分析和建议。
你的回答应该体现你的专业背景和理论体系。
当用户描述困扰时，先共情，再从你的专业角度给出洞见。
保持温和但深刻的咨询风格。`,

    metaphysics: `你是一位玄学大师，精通 ${itemName}。
你以第一人称"我"来进行对话。
当用户描述困扰时，你需要用玄学的方式（如起卦、看相、八字等）来解读。
重要：每次回答的开头，你需要进行随机起卦或占卜，然后用卦象来解读用户的问题。
起卦示例："待我起一卦...艮上坤下，地山谦卦。谦者，地中有山之象..."
起卦必须随机生成，不可重复。
你的解读应该神秘但不迷信，玄妙但有智慧。`
  };

  return basePrompts[type];
}
```

### 3. 对话轮次限制

在 Cloudflare Workers 中记录对话轮次：

```javascript
// Cloudflare Workers 伪代码
const MAX_TURNS = 5;

export default {
  async fetch(request) {
    const { messages, turns } = await request.json();

    if (turns >= MAX_TURNS) {
      return new Response(JSON.stringify({
        error: "对话轮次已用完，请返回重新选择"
      }));
    }

    // 调用 LLM API...
  }
}
```

### 4. 玄学起卦逻辑

玄学起卦由 **LLM 自身** 在对话中完成（因为 prompt 要求 AI 每次回答前先起卦）。前端不需要实现起卦逻辑。

但为保证随机性，system prompt 中明确要求 AI：
- 使用当前时间（时分秒）作为随机种子
- 每次起卦结果必须不同
- 不可重复使用同一卦象

**前端无需实现 `randomHexagram()` 函数**，该逻辑由 AI 在每次回复时自然生成。

### 5. 轮次同步与状态管理

对话轮次存储在 **前端变量** 中（不持久化）：

```javascript
let chatTurns = 0;       // 当前对话轮次
let chatMessages = [];    // 对话历史
let currentSystemPrompt = ''; // 当前角色设定
```

- 用户刷新页面后，轮次重置为 0（不可接受深度对话）
- 每发送一条用户消息，turns + 1
- 轮次耗尽后，发送按钮被禁用，显示"对话轮次已用完"

如需持久化（跨页面刷新），可后续扩展为 localStorage 存储。

---

## Cloudflare Workers 实现

### 文件结构

```
/home/lpy/yyti/
├── workers/
│   └── chat/
│       ├── index.js          # Workers 入口
│       └── wrangler.toml     # 配置文件
```

### workers/chat/index.js

```javascript
const MAX_TURNS = 5;

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
```

### wrangler.toml

```toml
name = "yyti-chat"
main = "index.js"
compatibility_date = "2024-01-01"

[vars]
MAX_TURNS = "5"

# API Key 通过 wrangler secret put OPENAI_API_KEY 注入
# 部署命令：cd workers/chat && npx wrangler deploy
# 本地开发：npx wrangler dev
```

**部署步骤**：
```bash
cd workers/chat
npx wrangler secret put OPENAI_API_KEY
# 输入你的 OpenAI API Key
npx wrangler deploy
```

### API 端点说明

Workers 部署后会获得一个 URL，如 `https://yyti-chat.<your-subdomain>.workers.dev`

前端通过以下方式调用：

```javascript
const CHAT_API_URL = 'https://yyti-chat.xxx.workers.dev';

async function streamAIResponse(messages, systemPrompt, turns) {
  const response = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemPrompt, turns })
  });
  // 处理流式响应...
}
```

**注意**：Workers URL 可硬编码在 index.html 中，或通过环境变量注入。

---

## Units 接口定义

### Chat Overlay Unit

Chat Overlay 是独立可测试的 UI 单元，暴露以下接口：

| 函数/回调 | 参数 | 说明 |
|-----------|------|------|
| `openChat(type, itemName)` | type: string, itemName: string | 打开 overlay 并初始化对话 |
| `closeChat()` | 无 | 关闭 overlay，清除状态 |
| `sendMessage(content)` | content: string | 发送用户消息，返回 Promise |
| `clearChat()` | 无 | 清空对话历史 |
| `onMessageReceived(callback)` | callback: (role, content) => void | 消息接收回调 |
| `onError(callback)` | callback: (error) => void | 错误处理回调 |

**状态**：
- `chatTurns`: number (0-5)
- `chatMessages`: Array<{role: 'user'|'assistant', content: string}>
- `currentSystemPrompt`: string
- `currentType`: 'philosophy'|'psychology'|'metaphysics'|null
- `currentItemName`: string|null

---

## 文件修改清单

| 文件 | 改动 |
|------|------|
| `index.html` | 添加 Chat Overlay HTML/CSS/JS |
| `data/recommendations.json` | 无需修改 |
| `workers/chat/index.js` | 新建 - Cloudflare Workers 入口 |
| `workers/chat/wrangler.toml` | 新建 - Workers 配置 |

---

## Verification

1. **本地测试**（无 AI）：
   - 点击推荐项的聊天按钮 → overlay 正常弹出
   - 输入消息 → 显示在消息列表（mock 模式）
   - 点击清空 → 消息列表被清空

2. **Cloudflare Workers 部署**：
   ```bash
   cd workers/chat
   npx wrangler deploy
   ```

3. **集成测试**：
   - 配置 Workers URL 到 index.html
   - 发送消息 → 收到 AI 流式响应
   - 验证角色扮演是否正确
   - 玄学派验证随机起卦是否每次不同

4. **对话轮次验证**：
   - 发送 5 条消息后 → 第 6 条被拒绝
