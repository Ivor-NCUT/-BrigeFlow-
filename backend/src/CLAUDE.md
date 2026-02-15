# Backend Source - 核心逻辑与API

<directory>
api/ - 业务API处理逻辑 (Import, Auth, etc.)
db/ - 数据库Schema与连接 (Drizzle, SQLite/Postgres)
middleware/ - 中间件 (Auth, CORS)
__generated__/ - Drizzle生成类型与Schema
</directory>

<files>
index.ts - Hono应用入口与路由定义
server.ts - 生产环境启动脚本
dev-server.ts - 开发环境启动脚本 (Mock User, SQLite)
</files>
