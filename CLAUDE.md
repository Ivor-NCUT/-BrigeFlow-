# 缘脉BridgeFlow - 人脉可视化与管理系统
React + TypeScript + Vite + Hono + Drizzle + Tailwind

## 设计系统
Bonjour iOS-inspired Design System，适配大屏网页端
- 主色: #007AFF (iOS Blue)
- 字体: PingFang SC 中文优先
- 圆角: 4px 基础单元 (6px-20px)
- 阴影: 极致轻盈 (rgba(0,0,0,0.06))
- 标签: 药丸形 (rounded-pill: 100px)

<directory>
src/ - 前端核心代码 (4子目录: pages, components, store, lib)
  src/pages/ - 页面组件 (Dashboard, Timeline, SharePage, PublicSharePage)
  src/components/ - 可复用组件 (FilterSidebar, QuickAddModal, GlobalSearchModal, ThemeToggle)
  src/layouts/ - 布局组件 (MainLayout: Header+Sidebar+Main)
  src/store/ - Zustand 状态管理 (contactStore, themeStore, userStore)
  src/lib/ - 工具函数与 API 层
  src/types/ - TypeScript 类型定义
  src/assets/ - 静态资源 (icons)
backend/ - 后端服务 (Hono, Drizzle, Supabase Auth, xlsx)
  backend/src/api/ - 业务接口 (import: CSV导入, template: 模板下载, export: Excel多Sheet导出)
public/ - 静态资源
</directory>

<config>
package.json - 前端依赖与脚本
backend/package.json - 后端依赖与脚本
vite.config.ts - 前端构建配置
tailwind.config.js - 设计系统 token (颜色/字体/圆角/阴影)
src/index.css - 全局样式 (glass/pill-tag/动画)
YOUWARE.md - 业务需求文档
PRODUCT_MANUAL.md - 产品白皮书与用户手册
</config>

<commands>
Dev (Front): npm run dev (http://localhost:5173)
Dev (Back): cd backend && npm run dev (http://localhost:3001)
</commands>

法则: 极简·稳定·导航·版本精确·本地优先
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
