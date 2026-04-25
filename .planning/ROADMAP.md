# YYTI Roadmap

## Overview

**2 phases** | **18 requirements** | **All v1 requirements covered**

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | 单文件实现 | 完成 YYTI 完整可用的单 HTML 文件 | All v1 | 打开即测，零依赖 | [x] 2026-04-25 |
| 2 | 结果推荐 | 左右分栏推荐哲学/玄学内容 | REC-01~04 | 推荐展示正常 | [x] 2026-04-25 |

---

## Phase 1: 单文件实现

**Goal:** 交付完整可用的 YYTI 测试页面

**Requirements:**
- ALGO-01 ~ ALGO-07 (核心算法)
- UI-01 ~ UI-04 (三屏幕)
- TEST-01 ~ TEST-04 (测试逻辑)
- CONT-01 ~ CONT-04 (30 题 + 25 类型 + 维度解释)
- STYLE-01 ~ STYLE-03 (视觉风格)

**Success Criteria:**
1. 首页正常显示，点击开始进入测试
2. 30 道题目随机顺序展示，3 选 1 计分
3. 提交后正确计算 15 维等级并匹配人格
4. 结果页显示类型卡片 + 15 维评分详情
5. 隐藏人格门和兜底人格机制正常工作
6. 移动端布局正常

## Phase 2: 结果推荐

**Goal:** 测试完成后展示左右分栏结果推荐界面

**In Scope:**
- 左栏：哲学著作/哲学家推荐
- 右栏：玄学指导推荐（梅花易数/六爻/塔罗/Oh卡等）
- 推荐内容以 JSON 格式存储在 `data/` 目录，额外加载

**Depends on:** Phase 1
**Plans:** 0 plans

---

## File Outputs

- `index.html` — YYTI 完整单页应用
