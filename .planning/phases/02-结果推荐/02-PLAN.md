# Phase 2: 结果推荐 - Plan

**Phase:** 02-结果推荐
**Wave:** 1
**Plans:** 1
**Goal:** 测试完成后展示左右分栏推荐界面

## Wave 1: 推荐数据 + UI

### Plan 01: 推荐系统

**Objective:** 新增 data/recommendations.json + 推荐 UI 区块

**Requirements addressed:** REC-01~04 (新增需求，覆盖 Phase 2 scope)

**Files modified:**
- `data/recommendations.json` (new)
- `index.html` (modified)

---

#### Task 1.1: 创建推荐数据结构

<read_first>
- index.html (fetch 加载逻辑 line 792~812)
- .planning/phases/02-结果推荐/02-CONTEXT.md
</read_first>

<Action>

创建 `data/recommendations.json`，包含所有 25 种人格 + 2 种隐藏人格的推荐数据：

```json
{
  "scholar": {
    "name": "学者",
    "philosophy": [
      {"book": "塞内卡《谈话录》", "reason": "学业压力下的斯多葛智慧"},
      {"book": "尼采《查拉图斯特拉如是说》", "reason": "重新发现学习的意义"}
    ],
    "metaphysics": [
      {"tool": "梅花易数", "desc": "以数理解读学业困惑"},
      {"tool": "塔罗占星", "desc": "探索学业方向与天赋"}
    ]
  },
  "worker": {
    "name": "卷王",
    "philosophy": [
      {"book": "马可·奥勒留《沉思录》", "reason": "职场中的内在平静"},
      {"book": "斯多葛学派", "reason": "在竞争中保持清醒"}
    ],
    "metaphysics": [
      {"tool": "六爻", "desc": "解读职场机遇与挑战"},
      {"tool": "Oh卡", "desc": "潜意识探索职场方向"}
    ]
  }
  /* ... 其他 23 种人格类似结构 ... */
}
```

每种人格结构相同：`philosophy` 数组（2本书）、`metaphysics` 数组（2个工具）。
按 5 个生活域组织内容（学业/职场/家庭/亲密/内心各有不同哲学家和玄学工具）。

</Action>

<acceptance_criteria>
- [ ] data/recommendations.json 文件存在
- [ ] 包含 "scholar", "worker" 等至少 5 个人格 key
- [ ] 每个人格有 philosophy（数组）和 metaphysics（数组）字段
- [ ] philosophy 每项有 book 和 reason 字段
- [ ] metaphysics 每项有 tool 和 desc 字段
- [ ] JSON 可被 JSON.parse() 正确解析（无语法错误）
</acceptance_criteria>

---

#### Task 1.2: 修改 index.html 增加推荐数据加载

<read_first>
- index.html (startTest fetch 逻辑 line 792~812, calculateResult 函数 line 755~768)
</read_first>

<Action>

在 `startTest()` 的 Promise.all 中增加 `recommendations.json` 加载：

```javascript
// 修改 line 792~804
const [questionsRes, personalitiesRes, dimensionsRes, recsRes] = await Promise.all([
  fetch('data/questions.json'),
  fetch('data/personalities.json'),
  fetch('data/dimensions.json'),
  fetch('data/recommendations.json')  // 新增
]);

const [questionsData, personalitiesData, dimensionsData, recsData] = await Promise.all([
  questionsRes.json(),
  personalitiesRes.json(),
  dimensionsRes.json(),
  recsRes.json()  // 新增
]);

// 新增一行
window.recommendations = recsData;
```

</Action>

<acceptance_criteria>
- [ ] startTest() 中 Promise.all 包含 fetch('data/recommendations.json')
- [ ] window.recommendations = recsData 在数据赋值块中
- [ ] 无新增 JS 语法错误
</acceptance_criteria>

---

#### Task 1.3: 修改 calculateResult 传递人格 ID

<read_first>
- index.html (calculateResult 函数 line ~755)
</read_first>

<Action>

在 `calculateResult()` 返回值中增加人格 ID 字段：

```javascript
// 在 return { ... } 对象中添加
return {
  type: bestMatch,
  pattern: pattern,
  dimensionScores: dimensionScores,
  dimensionLevels: dimensionLevels,
  similarity: bestSimilarity,
  typeId: bestMatch.id   // <-- 新增：传递人格 ID 给 renderResult
};
```

</Action>

<acceptance_criteria>
- [ ] calculateResult() 的 return 对象包含 typeId 字段
- [ ] typeId 值为 bestMatch.id（人格类型标识符字符串）
</acceptance_criteria>

---

#### Task 1.4: 新增 renderRecommendations 函数

<read_first>
- index.html (renderResult 函数 line 769~786, result-screen HTML line 577~590)
</read_first>

<Action>

在 `renderResult()` 函数之后新增：

```javascript
function renderRecommendations(typeId) {
  const recs = window.recommendations;
  if (!recs || !recs[typeId]) return;

  const r = recs[typeId];

  // 创建推荐区块 HTML，插入 result-card 和 result-footer 之间
  const recSection = document.createElement('div');
  recSection.id = 'recommendation-section';
  recSection.className = 'recommendation-section';

  recSection.innerHTML = `
    <div class="rec-column">
      <h3 class="rec-column-title">哲学指引</h3>
      <div class="rec-list">
        ${r.philosophy.map(p => `
          <div class="rec-item">
            <div class="rec-book">${p.book}</div>
            <div class="rec-reason">${p.reason}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="rec-column">
      <h3 class="rec-column-title">玄学指引</h3>
      <div class="rec-list">
        ${r.metaphysics.map(m => `
          <div class="rec-item">
            <div class="rec-tool">${m.tool}</div>
            <div class="rec-desc">${m.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // 插入到 result-card 之后、result-footer 之前
  const resultCard = document.querySelector('.result-card');
  const resultFooter = document.querySelector('.result-footer');
  resultCard.parentNode.insertBefore(recSection, resultFooter);
}
```

</Action>

<acceptance_criteria>
- [ ] renderRecommendations 函数存在于 script 中
- [ ] 函数接收 typeId 参数
- [ ] 从 window.recommendations 读取数据
- [ ] 在 result-card 和 result-footer 之间插入推荐区块
</acceptance_criteria>

---

#### Task 1.5: 修改 renderResult 调用 renderRecommendations

<read_first>
- index.html (renderResult 函数尾部 line ~785)
</read_first>

<Action>

在 `renderResult(result)` 函数最后一行（`showScreen('result')` 调用之后）添加推荐渲染：

```javascript
// renderResult 函数最后添加：
renderRecommendations(result.typeId);
```

</Action>

<acceptance_criteria>
- [ ] renderResult 末尾调用 renderRecommendations(result.typeId)
- [ ] 调用在 showScreen('result') 之后执行
</acceptance_criteria>

---

#### Task 1.6: 新增推荐区块 CSS 样式

<read_first>
- index.html (现有 CSS 变量定义 line 8~21, result-card 样式 line 321~370)
</read_first>

<Action>

在 `</style>` 结束标签之前、result-footer 样式之后添加：

```css
/* Recommendation Section */
.recommendation-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
  animation: slideUp 0.6s ease;
}

.rec-column {
  background: var(--card-bg);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.rec-column-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--primary-dark);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--border-color);
}

.rec-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rec-item {
  padding: 10px;
  background: var(--bg-gradient);
  border-radius: var(--radius-sm);
}

.rec-book, .rec-tool {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.rec-reason, .rec-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Mobile responsive */
@media (max-width: 480px) {
  .recommendation-section {
    grid-template-columns: 1fr;
  }
}
```

</Action>

<acceptance_criteria>
- [ ] .recommendation-section CSS 类存在
- [ ] .rec-column, .rec-column-title, .rec-list, .rec-item 样式存在
- [ ] 移动端断点 (max-width: 480px) 将 grid 改为单列
- [ ] 样式使用已有的 CSS 变量（--primary-dark, --card-bg, --radius 等）
</acceptance_criteria>

---

## Verification

1. `grep -c "recommendations.json" index.html` → 输出 2（fetch + window.recommendations）
2. `grep "renderRecommendations" index.html` → 找到函数定义和调用
3. `grep "typeId" index.html` → 找到 calculateResult 返回值和传参
4. `cat data/recommendations.json | python3 -m json.tool > /dev/null` → 无报错
5. `grep "recommendation-section" index.html` → 找到 CSS 和 HTML

