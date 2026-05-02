# YYTI - 压压题性格测试

一个基于维度打分的人格测试 + AI 对话功能。

## 快速开始

### 本地开发

```bash
cd workers/chat
npx wrangler dev
```

打开 `index.html` 即可使用。

### 部署

```bash
cd workers/chat
npx wrangler deploy
```

## 技术栈

- **前端**: 纯 HTML/JS，无框架
- **后端**: Cloudflare Workers（API 代理）
- **AI**: OpenRouter（gpt-oss-20b 模型）

## 主要功能

1. **人格测试** - 30 道题生成 H/M/L 模式，匹配 27 种预设人格
2. **AI 对话** - 根据测试结果生成专属 system prompt，支持多轮对话
3. **推荐书单** - 每个性格类型配套的书单、心理学工具、玄学推荐

## 文件结构

```
yyti/
├── index.html           # 主页面（人格测试 + AI 对话）
├── .gitignore
├── README.md
├── data/
│   ├── personalities.json    # 27 种人格定义
│   └── recommendations.json # 每种人格的推荐书单
└── workers/
    └── chat/
        ├── index.js      # Cloudflare Worker（转发 AI 请求）
        └── wrangler.toml # Worker 配置
```

## 环境变量

API Key 注入（不写在代码里）：

```bash
cd workers/chat
npx wrangler secret put OPENAI_API_KEY
```

## 隐私说明

人格测试题和推荐逻辑不保存任何个人信息，测试结果仅存在浏览器内存中。