# 缘脉 BridgeFlow - 关系资产管理工具

## 项目概述
一款参考 FancyEvent.cn 设计风格打造的关系资产管理工具，采用大面积留白与精致的卡片布局。

## 技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite 7
- **样式**: Tailwind CSS 3.4
- **状态管理**: Zustand
- **路由**: React Router DOM 6
- **动画**: Framer Motion
- **图标**: Lucide React
- **字体**: Plus Jakarta Sans (Google Fonts)

## 核心功能
1. **资产总览** - 卡片/表格/画廊三种视图，展开查看互动频率统计
2. **多维度标签** - 行业、技能、关系、地区四维标签分类
3. **侧边栏筛选器** - 仿 FancyEvent 风格的分类筛选
4. **全局搜索** - 顶部搜索框，支持姓名/标签/公司搜索
5. **沟通时间轴** - 记录每次沟通细节与跟进提醒
6. **关系资产图谱** - Canvas 力导向图，动态节点展示关系网络
7. **社交周报** - 一键生成本周关系资产拓展成果报告
8. **智能分组** - 自动归类半年未联系的好友
9. **快速录入** - 右下角悬浮按钮，任何页面可快速录入新关系资产
10. **分享页面** - 自定义公开范围，隐藏敏感备注，个性化域名

## 设计规范
- 主色: #4F46E5 (Indigo)
- 背景: #FAFAFA
- 卡片: 白色，圆角 2xl，微阴影
- 字体: Plus Jakarta Sans
- 间距: 大面积留白，宽松布局

## 项目结构
```
src/
├── types/contact.ts       # 类型定义
├── store/contactStore.ts  # Zustand 状态管理
├── layouts/MainLayout.tsx # 主布局（导航+侧边栏+悬浮按钮）
├── components/
│   ├── FilterSidebar.tsx  # 筛选器侧边栏
│   └── QuickAddModal.tsx  # 快速录入弹窗
├── pages/
│   ├── Dashboard.tsx      # 资产总览
│   ├── Timeline.tsx       # 沟通时间轴
│   ├── NetworkGraph.tsx   # 关系网络图
│   ├── WeeklyReport.tsx  # 社交周报
│   └── SharePage.tsx     # 分享页面编辑器
```
