# Backend Source - 核心逻辑与API

<directory>
api/ - 业务API处理逻辑 (Import, Export, Template)
db/ - 数据库Schema与连接 (Drizzle, Postgres)
middleware/ - 中间件 (InsForge Auth, JWT fallback)
__generated__/ - Drizzle生成类型与Schema
</directory>

<files>
index.ts - Hono应用入口与路由定义，含全局错误处理器(onError)和DB健康检查
server.ts - 生产环境启动脚本 (InsForge Auth)
dev-server.ts - 开发环境启动脚本 (Mock User, Supabase DB)
</files>

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
