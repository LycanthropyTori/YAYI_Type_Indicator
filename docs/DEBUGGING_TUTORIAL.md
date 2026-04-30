# YYTI 项目调试教程

## 项目概述

YYTI（压抑 Type Indicator）是一款纯前端的趣味心理测试，用于测量用户在学业、职场、家庭、亲密关系、内心五个生活域中的压抑指数。

**技术栈**：纯 HTML + CSS + JavaScript（单文件，零依赖）

**项目结构**：
```
/home/lpy/yyti/
├── index.html           # 主页面（所有代码都在这里）
├── data/
│   ├── questions.json   # 题目数据（30道题）
│   ├── personalities.json # 25种人格类型定义
│   ├── dimensions.json   # 维度定义（5模型×3维度=15维）
│   └── recommendations.json # 测试结果推荐
└── workers/
    └── chat/
        ├── index.js      # Cloudflare Workers 后端
        └── wrangler.toml # Workers 配置
```

---

## 如何运行项目

### 方法 1：直接打开（最简单）

```bash
# 直接用浏览器打开
open /home/lpy/yyti/index.html
# 或
xdg-open /home/lpy/yyti/index.html  # Linux
```

**注意**：直接打开时，`fetch()` 加载 JSON 文件可能会被浏览器跨域限制。如果遇到 JSON 加载失败，使用方法 2。

### 方法 2：本地 HTTP 服务器

```bash
cd /home/lpy/yyti
python3 -m http.server 8080
# 然后浏览器访问 http://localhost:8080
```

或使用 Node.js 的 `serve`：

```bash
npx serve /home/lpy/yyti
```

### 方法 3：VS Code Live Server

在 VS Code 中安装 "Live Server" 插件，右键 `index.html` → "Open with Live Server"。

---

## 项目数据流

```
用户答题 → 计算分数 → 匹配人格类型 → 显示结果 → 显示推荐指引
    ↓
用户点击推荐项的 💬 按钮 → 弹出 Chat Overlay → 与 AI 对话
```

### 核心函数

| 函数名 | 位置 | 功能 |
|--------|------|------|
| `startTest()` | 第 1210 行 | 初始化测试，加载数据 |
| `calculateResult()` | 第 937 行 | 核心算法：计算结果并匹配人格 |
| `renderResult()` | 第 1133 行 | 渲染结果页面 |
| `renderGuidancePanel()` | 第 1229 行 | 渲染指引面板（含 💬 按钮） |
| `openChat()` | 第 1490 行 | 打开 AI 对话 Overlay |
| `sendChatMessage()` | 第 1540 行 | 发送消息并获取 AI 响应 |

---

## AI 对话功能

### 工作原理

```
用户点击 💬
    ↓
openChat(type, bookOrTool, btn)
    ↓
提取角色名：塞内卡、卡伦·霍妮、梅花易数 等
    ↓
构建 System Prompt（AI 角色设定）
    ↓
显示 Chat Overlay
    ↓
用户发送消息 → sendChatMessage()
    ↓
请求 Cloudflare Workers（/v1/chat）
    ↓
Workers 调用 OpenAI API（流式返回）
    ↓
前端解析 SSE 流，逐字显示 AI 回复
```

### 角色设定

| 类型 | 角色 | System Prompt 特点 |
|------|------|-------------------|
| Philosophy | 书籍作者 | 文言文+白话文，古典气质 |
| Psychology | 心理学家 | 共情优先，专业分析 |
| Metaphysics | 玄学大师 | 随机起卦，玄幻解读 |

### 配置 API 地址

`index.html` 第 1470 行：

```javascript
const CHAT_API_URL = 'https://yyti-chat.xxx.workers.dev';
```

**本地开发**：可以启动一个本地 server 代替 Workers：

```bash
cd workers/chat
npx wrangler dev
# 然后修改 CHAT_API_URL 为 http://localhost:8787
```

### 本地开发模式

1. 启动本地 Workers 模拟：
```bash
cd /home/lpy/yyti/workers/chat
npx wrangler dev
```

2. 修改 `index.html` 中的 `CHAT_API_URL`：
```javascript
const CHAT_API_URL = 'http://localhost:8787';
```

3. 刷新浏览器页面即可测试

---

## 常见问题调试

### 1. JSON 文件加载失败

**症状**：页面显示"正在加载题目数据..."后卡住

**排查**：
- 打开浏览器 DevTools（F12）→ Console 查看错误
- 如果是 CORS 错误，使用本地 HTTP 服务器（见上文"如何运行项目"）
- 如果是 404，检查 `data/` 文件夹是否存在且包含所有 JSON 文件

### 2. AI 对话按钮不显示

**排查**：
- 确认 `renderGuidancePanel()` 被调用（在 `showGuidanceScreen()` 中）
- 检查 `data/recommendations.json` 是否有对应人格类型的推荐
- 浏览器 Console 查看是否有 JS 错误

### 3. AI 消息发送后无响应

**排查**：
- 检查 Cloudflare Workers 是否已部署
- 检查 `CHAT_API_URL` 是否正确
- 浏览器 DevTools → Network 查看请求是否发出
- 查看 Workers 日志：`npx wrangler tail`

### 4. AI 回复不是预期的角色

**排查**：
- 检查 `buildSystemPrompt()` 函数（第 1476 行）
- 确认传入的 `itemName` 正确
- 查看 `getIdentityDescription()` 是否有对应角色的描述

### 5. 对话轮次提前耗尽

**排查**：
- 确认 `MAX_CHAT_TURNS = 5`（第 1469 行）
- 每次发送消息后轮次 +1，清空对话会重置

---

## 浏览器 DevTools 调试技巧

### Console 调试

在 Console 中可以直接访问全局变量：

```javascript
// 查看当前人格类型
window.currentTypeId

// 查看推荐数据
window.recommendations

// 手动调用函数
openChat('philosophy', '塞内卡《谈话录》')
```

### Network 调试

1. 打开 DevTools → Network
2. 筛选 `chat` 或 `fetch`
3. 发送消息后查看请求和响应
4. SSE 流式响应会在 Response 中显示

### 添加断点

在 `sendChatMessage()` 函数（第 1540 行）添加 `debugger;`

```javascript
async function sendChatMessage() {
  debugger;  // 添加这行
  // ... 函数内容
}
```

---

## Cloudflare Workers 调试

### 本地测试

```bash
cd /home/lpy/yyti/workers/chat
npx wrangler dev
```

这会启动本地服务器并模拟 Workers 环境。

### 查看线上日志

```bash
npx wrangler tail
```

### 部署

```bash
cd /home/lpy/yyti/workers/chat
npx wrangler secret put OPENAI_API_KEY
# 输入你的 OpenAI API Key
npx wrangler deploy
```

### Workers 核心代码（index.js）

```javascript
export default {
  async fetch(request, env) {
    // 1. CORS 处理
    // 2. 解析请求 JSON
    // 3. 检查轮次限制
    // 4. 检查 API Key
    // 5. 调用 OpenAI API（流式）
    // 6. 返回响应
  }
};
```

---

## 修改推荐数据

编辑 `data/recommendations.json`：

```json
{
  "学者": {
    "name": "学者",
    "philosophy": [
      {"book": "塞内卡《谈话录》", "reason": "学业压力下的斯多葛智慧"}
    ],
    "psychology": [
      {"book": "阿德勒《自卑与超越》", "author": "阿德勒", "reason": "..."}
    ],
    "metaphysics": [
      {"tool": "梅花易数", "desc": "..."}
    ]
  }
}
```

**注意**：
- `philosophy` 和 `psychology` 的 `book` 格式必须是 `"作者《作品》"`
- `metaphysics` 的 `tool` 直接是工具名
- 添加新角色时，确保人格类型在 `data/personalities.json` 中存在

---

## 添加新的人格类型

1. 在 `data/personalities.json` 中添加：
```json
{
  "name": "新类型",
  "group": "学业组",
  "pattern": "LLLLL-LLLLL-LLLLL-LLLLL-LLLLL",
  "intro": "一句话介绍",
  "desc": "详细描述"
}
```

2. 在 `data/recommendations.json` 中添加对应的推荐：
```json
{
  "新类型": {
    "philosophy": [...],
    "psychology": [...],
    "metaphysics": [...]
  }
}
```

---

## 项目代码结构（index.html）

| 行号范围 | 内容 |
|----------|------|
| 1-150 | HTML head 和 CSS 变量 |
| 150-400 | CSS 样式（按钮、卡片、动画等） |
| 401-700 | HTML 页面结构（各 screen） |
| 700-1000 | JavaScript 全局变量和核心算法 |
| 1001-1200 | 测试流程、结果显示 |
| 1201-1400 | 指引面板、推荐渲染 |
| 1401-1600 | **新增**：Chat Overlay 函数 |

---

## 下一步学习

1. 阅读 `calculateResult()` 理解核心算法
2. 阅读 `renderGuidancePanel()` 理解推荐如何渲染
3. 阅读 `buildSystemPrompt()` 理解 AI 角色设定
4. 阅读 `sendChatMessage()` 理解 SSE 流式响应处理
