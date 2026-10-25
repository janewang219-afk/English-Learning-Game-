# PlayLearn · English Learning Game

面向儿童的游戏化英语学习项目，包含 Next.js 应用和题库生成工具。

## 项目目录

- `playlearn-app/`：可运行的 Next.js 应用、API 脚手架、Prisma 数据模型和 SQL 题库。
- `build_question_bank.py`、`export_question_bank_sql.py`：题库生成与 SQL 导出工具。

本地启动与接口说明见 [应用说明](playlearn-app/README.md)。

## 部署到 Vercel

在 Vercel 中导入本仓库，使用以下设置：

| 设置 | 值 |
| --- | --- |
| Production Branch | `main` |
| Root Directory | `playlearn-app` |
| Framework Preset | `Next.js` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | 使用 Next.js 默认值 |

构建命令会先生成 Prisma Client，再构建 Next.js，避免构建缓存中的客户端与 schema 不一致。仓库中的 `playlearn-app/vercel.json` 包含区域、函数和静态资源缓存配置。

在 Vercel 的 Environment Variables 中按 [环境变量模板](playlearn-app/.env.example) 配置实际值：

- `DATABASE_URL`：可从部署环境访问的 PostgreSQL 连接地址。
- `REDIS_URL`：可从部署环境访问的 Redis 连接地址；使用服务商提供的连接协议和凭证。
- `JWT_ACCESS_SECRET`、`JWT_REFRESH_SECRET`：分别设置为独立的随机密钥。
- `APP_TIMEZONE=Asia/Shanghai`、`SPEECH_PROVIDER=mock`：与当前默认行为一致；外部语音服务另需配置对应参数。
- `NEXT_PUBLIC_WS_SERVER_URL`、`WS_SERVER_URL`：使用独立 WebSocket 服务时设置为该服务地址；生产环境浏览器应使用 `wss://`。

不要上传真实 `.env` 文件，也不要将本地的 `localhost` 数据库、Redis 和 WebSocket 地址作为线上服务地址。`NODE_ENV` 由部署平台管理。

数据库建表需要在配置好目标数据库的环境中，于 `playlearn-app` 目录执行 `npm run prisma:migrate:deploy`。按需导入题库或运行 seed；seed 会创建文档所列的演示账号，应仅在演示环境使用。数据库迁移和 seed 不会随构建自动执行。

排行榜 WebSocket 使用独立的常驻服务（入口：`playlearn-app/scripts/ws-server.ts`），不随 Next.js 应用部署到 Vercel。当前前端仍使用 demo store，部分后端业务接口会返回 `501 NOT_IMPLEMENTED`；部署成功不代表所有后端业务已完成。

部署配置参考：[Vercel 项目根目录](https://vercel.com/docs/monorepos)、[Prisma 与 Vercel 构建缓存](https://www.prisma.io/docs/orm/more/help-and-troubleshooting/nextjs-help)。
