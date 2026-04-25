# Phase 2: 结果推荐 - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

在结果页增加左右分栏推荐界面：
- **左栏**：哲学著作/哲学家推荐
- **右栏**：玄学指导推荐（梅花易数/六爻/塔罗/Oh卡）
- 推荐内容以 JSON 格式存储在 `data/recommendations.json`，额外加载

</domain>

<decisions>
## Implementation Decisions

### 推荐规则
- **D-01:** 按人格类型匹配推荐。每种人格类型预定义哲学推荐 + 玄学推荐。

### 哲学内容
- **D-02:** 按5个生活域组织推荐内容：
  - 学业压抑 → 塞内卡《谈话录》、尼采《查拉图斯特拉如是说》
  - 职场压抑 → 马可·奥勒留《沉思录》、斯多葛学派
  - 家庭压抑 → 孔子《论语》、阳明心学
  - 亲密关系 → 弗洛姆《爱的艺术》、加缪《局外人》
  - 内心压抑 → 佛教《四念处》、《道德经》

### 玄学内容
- **D-03:** 全部包含：梅花易数、六爻、六壬、塔罗、Oh卡。每种人格预定义推荐工具 + 简要引导语。

### UI 布局
- **D-04:** 在现有 result-card 下方新增 recommendation-section，左右分栏卡片式展示。
- 左栏标题"哲学指引"，右栏标题"玄学指引"
- 每栏最多显示 4 个推荐项（哲学书籍/玄学工具）

### 数据结构
- **D-05:** `data/recommendations.json` 额外 fetch 加载，键为 personalityId。
- 结构：`{ "scholar": { "philosophy": [...], "metaphysics": [...] }, "worker": {...}, ... }`

### 推荐时机
- **D-06:** 提交答案后、显示结果前加载推荐数据，与结果数据并行 fetch

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

- `.planning/PROJECT.md` — 项目定义（维度体系、人格类型库）
- `.planning/REQUIREMENTS.md` — 需求清单
- `.planning/ROADMAP.md` — Phase 2 定义
- `.planning/phases/01-单文件实现/01-CONTEXT.md` — Phase 1 决策（数据分离架构）
- `index.html` — 当前实现（结果页结构、fetch 加载逻辑）

</canonical_refs>

<codebase_context>
## Existing Code Insights

### 可重用资产
- `data/` 目录已存在（Phase 1 数据分离），新增 `recommendations.json` 与之并列
- `fetch` 并行加载模式已有（Phase 1 中 Promise.all 加载 questions/personality/dimensions）
- SBTI 风格 CSS（植物绿配色、圆角卡片）可直接复用

### 已有的 result-screen 结构
- `result-card`：类型 badge、name、match%、intro、desc
- `result-footer`：重新测试按钮
- 新增 recommendation-section 插入两者之间

### Integration Points
- `renderResult()` 函数（line 769）→ 在此处调用 `renderRecommendations()`
- `startTest()` fetch 逻辑（line 792）→ 增加 `recommendations.json` 加载

</codebase_context>

<specifics>
## Specific Ideas

- 哲学推荐语示例："你的学业压抑指数较高，或许塞内卡的《谈话录》能帮你找到内心的平静"
- 玄学推荐语示例："梅花易数或许能为你提供一个新的视角来看待当前的人际关系困境"

</specifics>

<deferred>
## Deferred Ideas

None — all decisions captured above.

</deferred>

---

*Phase: 02-结果推荐*
*Context gathered: 2026-04-25*
*Auto-resolved: all gray areas decided with recommended defaults*
