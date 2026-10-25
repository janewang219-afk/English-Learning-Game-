# PlayLearn 后端架构脚手架

PlayLearn 是面向 7–11 岁儿童的游戏化英语学习平台。本目录保留现有 Next.js App Router 前端演示页面，并提供与 PRD 对齐的后端边界、数据模型和本地基础设施。

## Vercel 部署

导入 GitHub 仓库时将 Root Directory 设置为 `playlearn-app`，使用 `npm ci` 安装依赖、`npm run build` 构建。环境变量、数据库迁移及独立 WebSocket 服务说明见 [仓库部署指南](../README.md#部署到-vercel)。

## 技术栈

- Next.js 14 Route Handlers：REST API，Node.js runtime
- PostgreSQL + Prisma：用户、内容、学习记录、成就和反馈
- Redis：会话缓存、refresh token 撤销、排行榜 publisher
- JWT：家长 access/refresh token，以及儿童短期 access token
- `ws`：独立排行榜 WebSocket 服务
- Zod：请求 DTO 和查询参数校验
- 语音 provider：本地 deterministic mock 或外部 HTTP 服务

## 本地启动

```bash
npm install
cp .env.example .env
npm run db:up
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

另开终端启动排行榜 WebSocket：

```bash
npm run ws:dev
```

默认演示账号由 seed 创建：`parent@example.com / playlearn`。

停止本地基础设施：

```bash
npm run db:down
```

## API 契约

完整中文接口说明、参数表、实现状态和调用示例见 [后端 API 接口文档](docs/backend-api.md)。

成功响应统一为：

```json
{ "data": {}, "requestId": "..." }
```

错误响应统一为：

```json
{
  "error": { "code": "BAD_REQUEST", "message": "...", "details": {} },
  "requestId": "..."
}
```

当前业务逻辑仍保持脚手架状态，未完成的接口会在参数校验和权限校验通过后返回 `501 NOT_IMPLEMENTED`。

| 模块 | 路径 |
|---|---|
| 基础 | `GET /api/health` |
| 认证 | `POST /api/auth/register`、`login`、`refresh`、`logout` |
| 儿童档案 | `GET/POST /api/children`、`GET/PATCH /api/children/[id]`、`POST /api/children/[id]/activate` |
| 设置 | `GET/PATCH /api/settings` |
| 内容 | `GET /api/content/themes`、`levels`、`levels/[levelId]`、`items/[itemId]` |
| 会话 | `POST/GET /api/sessions`、`GET/PATCH /api/sessions/[id]`、`POST /api/sessions/[id]/lock` |
| 报告 | `GET /api/reports/weekly`、`/api/reports/weak-points` |
| 游戏能力 | `POST /api/speech/assess`、`GET /api/leaderboard`、`GET/POST /api/badges`、`POST /api/feedback` |

认证接口使用 `Authorization: Bearer <access-token>`。儿童不注册或登录，家长通过 `/api/children/[id]/activate` 获取短期儿童 token。refresh token 的撤销状态使用 Redis `jti` key 保存。

离线同步请求应携带 `Idempotency-Key`，请求体中的 `clientSyncId` 与它保持一致。语音请求使用 `multipart/form-data`，字段名为 `audioBlob`；本地默认 `SPEECH_PROVIDER=mock`，不会上传录音。

## 数据模型

Prisma schema 包含 PRD 的核心实体，并补充：

- `LevelLearningItem`：关卡与学习项的显式关联，保证题目顺序并支持复用。
- `ContentFeedback`：家长内容反馈及后续降级流程的持久化边界。
- `LeaderboardEntry` 按 `childProfileId + weekStart` 唯一，支持周榜重置。

最小 seed 会创建两个主题、四个关卡、五个学习项、两个徽章、一个演示家长和一个匿名儿童档案，不代表完整 MVP 内容包。

## 校验命令

```bash
npm run prisma:validate
npm run typecheck
npm run lint
npm test
npm run build
```

## 后续实现顺序

1. 为现有 Route Handler 注入 Prisma repository 和 Redis adapter。
2. 实现注册、登录、刷新、儿童档案和设置业务。
3. 实现内容读取、会话状态机、离线批量同步和掌握度持久化。
4. 接入真实语音 provider、报告聚合、排行榜和徽章规则。
5. 将前端 demo store 逐步切换到上述 REST API。
