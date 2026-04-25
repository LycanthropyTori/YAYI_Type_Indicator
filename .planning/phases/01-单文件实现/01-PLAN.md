---
wave: 1
objective: "Phase 1 修改：去除饮酒触发 + 数据分离"
requirements_addressed:
  - "去除 Q15 饮酒触发选项"
  - "数据与代码分离（JSON 文件）"
  - "修改 index.html 初始化逻辑使用 fetch"
files_modified:
  - index.html
  - data/questions.json
  - data/personalities.json
  - data/dimensions.json
autonomous: true
---

## Tasks

### Task 1: 删除 Q15 饮酒选项

<read_first>
- /home/lpy/yyti/index.html（第 938-949 行，Q15 定义）
</read_first>

<action>
1. 定位 Q15（id=15，维度 IN3）的选项数组
2. 将第3个选项 `{ text: '找个安静的角落独自喝点小酒', score: 3 }` 替换为 `{ text: '冥想或静坐', score: 3 }`
3. 保留 hiddenMatch 变量和 hidden 人格数据（lines 1251, 1145-1161）
4. 保留 selectOption 中的 hiddenMatch 触发逻辑（lines 1477-1484），仅修改选项文本

编辑位置：index.html 第 947 行
```
old_string: { text: '找个安静的角落独自喝点小酒', score: 3 }
new_string: { text: '冥想或静坐', score: 3 }
```
</action>

<acceptance_criteria>
- `grep -n "独自喝点小酒" /home/lpy/yyti/index.html` 返回空（无匹配）
- `grep -n "冥想或静坐" /home/lpy/yyti/index.html` 返回匹配（第 947 行）
- `grep -n "hiddenMatch" /home/lpy/yyti/index.html` 返回匹配（变量定义和触发逻辑保留）
</acceptance_criteria>

---

### Task 2: 创建 JSON 数据文件

<read_first>
- /home/lpy/yyti/index.html（第 614-1245 行，数据结构定义）
</read_first>

<action>
1. 创建 `/home/lpy/yyti/data/` 目录
2. 创建 `data/questions.json`：
   - 从 index.html 第 615-961 行提取 questions 数组
   - 格式：`[{id, model, dimension, text, options: [{text, score}]}]`
   - 共 30 个题目

3. 创建 `data/personalities.json`：
   - 从 index.html 第 963-1162 行提取 personalityTypes 数组
   - 格式：`[{name, group, pattern, intro, desc, hidden?}]`
   - 共 27 个人格（25 + 2 hidden）

4. 创建 `data/dimensions.json`：
   - 从 index.html 第 1164-1245 行提取 dimensionNames、modelNames、dimensionExplanations
   - 格式：`{dimensionNames: {}, modelNames: {}, dimensionExplanations: {L: {}, M: {}, H: {}}}`
</action>

<acceptance_criteria>
- `test -f /home/lpy/yyti/data/questions.json && echo "exists"` 返回 "exists"
- `test -f /home/lpy/yyti/data/personalities.json && echo "exists"` 返回 "exists"
- `test -f /home/lpy/yyti/data/dimensions.json && echo "exists"` 返回 "exists"
- `jq '. | length' /home/lpy/yyti/data/questions.json` 返回 30
- `jq '. | length' /home/lpy/yyti/data/personalities.json` 返回 27
- `jq 'has("dimensionNames") and has("modelNames") and has("dimensionExplanations")' /home/lpy/yyti/data/dimensions.json` 返回 true
</acceptance_criteria>

---

### Task 3: 修改 index.html 初始化逻辑

<read_first>
- /home/lpy/yyti/index.html（第 1445-1452 行，startTest 函数）
- /home/lpy/yyti/data/questions.json（将要创建）
- /home/lpy/yyti/data/personalities.json（将要创建）
- /home/lpy/yyti/data/dimensions.json（将要创建）
</read_first>

<action>
1. 在 `startTest()` 函数开始处添加 fetch 加载逻辑：
```javascript
async function startTest() {
  currentQuestion = 0;
  answers = [];
  hiddenMatch = false;

  // Show loading state
  document.getElementById('question-text').textContent = '正在加载题目数据...';
  document.getElementById('options').innerHTML = '';

  try {
    const [questionsRes, personalitiesRes, dimensionsRes] = await Promise.all([
      fetch('data/questions.json'),
      fetch('data/personalities.json'),
      fetch('data/dimensions.json')
    ]);

    const [questionsData, personalitiesData, dimensionsData] = await Promise.all([
      questionsRes.json(),
      personalitiesRes.json(),
      dimensionsRes.json()
    ]);

    // Assign loaded data to global variables
    window.questions = questionsData;
    window.personalityTypes = personalitiesData;
    window.dimensionNames = dimensionsData.dimensionNames;
    window.modelNames = dimensionsData.modelNames;
    window.dimensionExplanations = dimensionsData.dimensionExplanations;

    shuffledQuestions = shuffle(window.questions);
    showScreen('test');
    renderQuestion();
  } catch (err) {
    console.error('Failed to load data:', err);
    document.getElementById('question-text').textContent = '数据加载失败，请刷新重试';
  }
}
```

2. 删除内嵌的 questions、personalityTypes、dimensionNames、modelNames、dimensionExplanations 数据定义（约第 614-1245 行）

3. 添加全局变量声明（在 script 开始处）：
```javascript
let questions = [];
let personalityTypes = [];
let dimensionNames = {};
let modelNames = {};
let dimensionExplanations = {};
```
</action>

<acceptance_criteria>
- `grep -n "async function startTest" /home/lpy/yyti/index.html` 返回匹配
- `grep -n "Promise.all" /home/lpy/yyti/index.html` 返回匹配
- `grep -n "fetch('data/questions.json')" /home/lpy/yyti/index.html` 返回匹配
- `grep -n "正在加载题目数据" /home/lpy/yyti/index.html` 返回匹配
- `grep -n "const questions = \[" /home/lpy/yyti/index.html` 返回空（内嵌数据已删除）
- `grep -n "const personalityTypes = \[" /home/lpy/yyti/index.html` 返回空（内嵌数据已删除）
</acceptance_criteria>

---

## 执行顺序

1. **Task 1** → 修改 index.html 删除饮酒选项（独立修改）
2. **Task 2** → 创建 3 个 JSON 数据文件（独立修改）
3. **Task 3** → 修改 index.html 初始化逻辑依赖 Task 2 完成的 JSON 文件

## 风险与注意事项

- Task 3 必须在 Task 2 完成后执行
- JSON 文件必须与 index.html 在同一目录结构下（data/ 子目录）
- 修改后的 index.html 需通过 HTTP 服务器访问（fetch 不支持 file:// 协议）
- hiddenMatch 触发逻辑保留，但由其他机制触发（供将来扩展）
