---
wave: 1
objective: "Create complete YYTI index.html"
requirements_addressed: [ALGO-01, ALGO-02, ALGO-03, ALGO-04, ALGO-05, ALGO-06, ALGO-07, UI-01, UI-02, UI-03, UI-04, TEST-01, TEST-02, TEST-03, TEST-04, CONT-01, CONT-02, CONT-03, CONT-04, STYLE-01, STYLE-02, STYLE-03]
files_modified: [index.html]
autonomous: true
---

## Tasks

### Task 1: 创建YYTI完整index.html单文件

<read_first>
- /home/lpy/yyti/.planning/PROJECT.md
- /home/lpy/yyti/.planning/REQUIREMENTS.md
</read_first>

<action>
创建完整的index.html文件，包含以下内容：

**HTML结构（3个屏幕）：**
1. 首页屏幕：标题"YYTI 压抑指数测试" + 副标题 + 开始测试按钮
2. 测试屏幕：进度条(0/30) + 题目卡片(题目文本 + 3个选项按钮) + 下一题按钮
3. 结果屏幕：类型卡片(类型名 + intro + desc) + 15维评分表格 + 匹配度百分比 + 重新测试按钮

**CSS样式（SBTI风格）：**
- 变量定义：--primary: #6c8d71, --primary-dark: #4d6a53, --bg-gradient: linear-gradient(135deg, #f5f7f5 0%, #e8ede8 100%)
- 圆角卡片：border-radius: 22px
- 响应式：@media (max-width: 768px)
- 字体：-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif

**JavaScript逻辑：**

1. 题目数据（30道，5模型×3维度×2题）：
   - Academic模型：A1学习动机、A2学业自我效能、A3学业情绪压抑 各2题
   - Career模型：C1晋升欲、C2工作生活平衡、C3职场人际 各2题
   - Family模型：F1家庭期望压力、F2家庭沟通、F3家庭独立 各2题
   - Intimate模型：I1依恋安全感、I2情感投入度、I3关系边界感 各2题
   - Inner模型：IN1欲望表达、IN2情感压抑、IN3自我反思 各2题
   - 每题3选项，每选项1-3分
   - 第15题（Intimate/依恋安全感第2题）包含隐藏人格触发：选项"独自喝点小酒"触发hiddenMatch=true

2. 人格类型数据（25种+2隐藏+1兜底）：
   - 学业组(5)：学者(HHH-HHH-HHH-HHH-HHH), 学酥(HMH-HMH-HMH-HMH-HMH), 学渣(LLL-LLL-LLL-LLL-LLL), 学历焦虑者(HHL-HHL-HHL-HHL-HHL), 学术混子(MMM-MMM-MMM-MMM-MMM)
   - 职场组(5)：卷王(HHH-HHH-HHH-HHH-HHH), 摸鱼大师(LLL-LLL-LLL-LLL-LLL), 996幸存者(HMH-HMH-HMH-HMH-HMH), 职场透明人(MLL-MLL-MLL-MLL-MLL), 晋升机器(HHH-HMM-HMM-HMM-HMM)
   - 家庭组(5)：家族担当者(HHH-HHH-HHH-HHH-HHH), 家庭叛逆者(LLL-LLL-LLL-LLL-LLL), 家庭和事佬(MMM-MMM-MMM-MMM-MMM), 离家出走者(LHL-LHL-LHL-LHL-LHL), 妈宝/爸宝(HHH-HHH-HHH-HHH-HHH)
   - 亲密组(5)：恋爱脑(HHH-HHH-HHH-HHH-HHH), 分手专家(LLL-LLL-LLL-LLL-LLL), 独行玩家(MLL-MLL-MLL-MLL-MLL), 情感乞丐(HMH-HMH-HMH-HMH-HMH), 海王/海后(LHL-LHL-LHL-LHL-LHL)
   - 内心组(5)：压抑容器(HHH-HHH-HHH-HHH-HHH), 定时炸弹(LHL-LHL-LHL-LHL-LHL), 行尸走肉(LLL-LLL-LLL-LLL-LLL), 慢性崩溃(MHM-MHM-MHM-MHM-MHM), 情绪海绵(HMH-HMH-HMH-HMH-HMH)
   - 隐藏组(2)：麻木者(HHH-HHH-LLL-LLL-LLL), 爆发者(LLL-LLL-HHH-HHH-HHH)
   - 兜底人格：迷途者(相似度 < 60%时触发)

3. 算法实现：
   - 计算原始分：每维度2题得分相加(2-6)
   - 转等级：≤3=L, 4=M, ≥5=H
   - 生成15位模式串：格式"Ac1-Ac2-Ac3-Cr1-Cr2-Cr3-Fa1-Fa2-Fa3-In1-In2-In3-IN1-IN2-IN3"
   - 计算距离：与每种人格pattern的欧几里得距离
   - 相似度：(1 - distance/30) × 100
   - 排序取最高匹配

4. 隐藏人格门：第15题选择"独自喝点小酒"选项时，设置hiddenMatch=true，结果优先匹配隐藏人格

5. 屏幕切换逻辑：
   - showScreen('intro' | 'test' | 'result')
   - 测试页：shuffleQuestions()打乱题目，跟踪currentQuestion和answers[]
   - 结果页：调用calculateResult()计算并渲染

6. 进度更新：显示"已回答 N/30 题"，answerQuestion()后更新
</action>

<acceptance_criteria>
- grep "id=\"intro-screen\"" index.html - 首页存在
- grep "id=\"test-screen\"" index.html - 测试页存在
- grep "id=\"result-screen\"" index.html - 结果页存在
- grep "questions = \[" index.html - 30道题目数据存在
- grep "personalityTypes = \[" index.html - 25种人格类型存在
- grep "calculateResult" index.html - 算法函数存在
- grep "shuffle" index.html - 题目打乱逻辑存在
- grep "hiddenMatch" index.html - 隐藏人格触发机制存在
- grep "#6c8d71" index.html - SBTI配色存在
- grep "border-radius: 22px" index.html - 圆角样式存在
- grep "@media (max-width" index.html - 响应式布局存在
- wc -l index.html - 文件行数 > 1500行
</acceptance_criteria>

---

## Implementation Details

### 题目内容矩阵（30道）

| 模型 | 维度 | Q编号 | 题目示例 |
|------|------|-------|----------|
| Academic | A1学习动机 | Q1, Q16 | "你学习的动力主要来自？" |
| Academic | A2学业自我效能 | Q2, Q17 | "面对考试，你的心态是？" |
| Academic | A3学业情绪压抑 | Q3, Q18 | "成绩不理想时，你会？" |
| Career | C1晋升欲 | Q4, Q19 | "你对职级晋升的态度是？" |
| Career | C2工作生活平衡 | Q5, Q20 | "下班后，你通常会？" |
| Career | C3职场人际 | Q6, Q21 | "和同事产生分歧时，你？" |
| Family | F1家庭期望压力 | Q7, Q22 | "父母对你的期望，你感受？" |
| Family | F2家庭沟通 | Q8, Q23 | "回家后，你和父母交流？" |
| Family | F3家庭独立 | Q9, Q24 | "关于是否搬出去住，你的想法？" |
| Intimate | I1依恋安全感 | Q10, Q25 | "恋爱中，你经常担心？" |
| Intimate | I2情感投入度 | Q11, Q26 | "感情中，你倾向于？" |
| Intimate | I3关系边界感 | Q12, Q27 | "伴侣要求看手机，你会？" |
| Inner | IN1欲望表达 | Q13, Q28 | "你心里想要的东西，通常会？" |
| Inner | IN2情感压抑 | Q14, Q29 | "强烈的情绪涌上来时，你？" |
| Inner | IN3自我反思 | Q15, Q30 | "闲暇时，你会？" |

**Q15隐藏人格触发题**："闲暇时，你会？" → 选项"找个安静的角落独自喝点小酒" → 触发hiddenMatch=true

### 15维度评分表格结构

| 维度 | 名称 | 原始分 | 等级 | L解释 | M解释 | H解释 |
|------|------|--------|------|-------|-------|-------|
| Ac1 | 学习动机 | 4 | M | 被动应付 | 内外混合 | 内在驱动 |
| ... | ... | ... | ... | ... | ... | ... |

### 模式串格式
"Ac1-Ac2-Ac3-Cr1-Cr2-Cr3-Fa1-Fa2-Fa3-In1-In2-In3-IN1-IN2-IN3"
例如："HHH-HMH-MHH-HHH-MHM"
