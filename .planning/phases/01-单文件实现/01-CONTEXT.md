# Phase 1: 单文件实现 - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning (modified)

<domain>
## Phase Boundary

对已完成的 Phase 1 进行三项修改：
1. 去除 Q15 饮酒选项的隐藏人格触发
2. 数据与代码分离，外部 JSON 文件
3. （哲学/玄学推荐 → deferred）

</domain>

<decisions>
## Implementation Decisions

### 隐藏人格机制
- **D-01:** 删除 Q15 的"独自喝点小酒"选项（选项3）
- **D-02:** 保留 hiddenMatch 机制和 hidden 人格数据（供将来其他触发方式使用）

### 数据分离架构
- **D-03:** 分离多文件：questions.json、personalities.json、dimensions.json
- **D-04:** 文件替换方式切换数据集（用户自行替换 JSON 文件，代码不变）
- **D-05:** 初始化时加载（测试开始前 fetch 加载所有 JSON）

### Deferred
- **D-06:** 哲学/玄学推荐系统 → 记录为 deferred idea，不在本次 scope

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

- `.planning/PROJECT.md` — 项目定义（维度体系、人格类型库）
- `.planning/REQUIREMENTS.md` — 需求清单
- `.planning/ROADMAP.md` — Phase 1 目标
- `index.html` — 当前实现的完整代码

</canonical_refs>

<codebase_context>
## Existing Code Insights

### 可重用资产
- index.html 中已有完整实现，SBTI 风格 CSS 可参考
- questions、personalities 等数据结构需迁移到 JSON

### 需修改部分
- Q15 选项（删除饮酒选项）
- 初始化逻辑（增加 fetch 加载 JSON）
- hiddenMatch 触发逻辑（保留变量，删除 Q15 触发）

</codebase_context>

<specifics>
## Specific Ideas

- 哲学/玄学推荐内容生成：根据人格类型/维度组合，规则映射推荐（例：情绪压抑→塞内卡《谈话录》）

</specifics>

<deferred>
## Deferred Ideas

### 哲学/玄学推荐系统
- 根据测试结果推荐哲学家著作解决压抑问题（如尼采、塞内卡）
- 或推荐玄学/占星内容（如星盘、梅花易数）
- 结果页二选一界面：哲学 vs 玄学
- 推荐逻辑：规则映射（人格类型 → 预定义推荐列表）

</deferred>

---

*Phase: 01-单文件实现*
*Context gathered: 2026-04-25*
