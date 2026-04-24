# YYTI Requirements

## v1 Requirements

### Core Algorithm
- [ ] **ALGO-01**: 15 维度 × 2 题 = 30 道题目，3 选 1 计分
- [ ] **ALGO-02**: 原始分 2-6 转等级：≤3=L, 4=M, ≥5=H
- [ ] **ALGO-03**: 生成 15 位模式串（5 组 × 3 维）
- [ ] **ALGO-04**: 25 种预定义人格 pattern 距离匹配
- [ ] **ALGO-05**: 相似度 = (1 - distance/30) × 100
- [ ] **ALGO-06**: 匹配度 < 60% 触发兜底人格
- [ ] **ALGO-07**: 隐藏人格门特殊触发机制

### UI Screens
- [ ] **UI-01**: 首页 - 标题 + 开始按钮
- [ ] **UI-02**: 测试页 - 进度条 + 题目卡片 + 选项
- [ ] **UI-03**: 结果页 - 类型卡片 + 15 维评分详情
- [ ] **UI-04**: 响应式布局，移动端友好

### Test Logic
- [ ] **TEST-01**: 题目随机打乱
- [ ] **TEST-02**: 进度实时更新
- [ ] **TEST-03**: 全部作答后才可提交
- [ ] **TEST-04**: 隐藏人格门题目（答饮酒触发隐藏人格）

### Content
- [ ] **CONT-01**: 30 道题目（5 模型 × 3 维 × 2 题）
- [ ] **CONT-02**: 25 种人格类型描述 + intro + desc
- [ ] **CONT-03**: 15 维度 L/M/H 三级解释
- [ ] **CONT-04**: 类型匹配结果渲染

### Styling
- [ ] **STYLE-01**: 参考 SBTI 植物绿配色
- [ ] **STYLE-02**: 圆角卡片 + 柔和渐变背景
- [ ] **STYLE-03**: 统一字体（中文优先）

## v2 Requirements (Deferred)

- [ ] 结果分享功能（生成图片/链接）
- [ ] 预览模式（显示维度名称）
- [ ] 题目分类筛选

## Out of Scope

- 服务端 / 数据库
- 多语言支持
- 答题历史保存

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| All v1 requirements | Phase 1 | Pending |
