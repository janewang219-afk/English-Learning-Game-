# PlayLearn 后端 API 接口文档

版本：0.1.0 · 更新日期：2026-10-18 · 依据：当前仓库源代码

## 1. 范围与实现状态

本文供后端开发、前端联调和测试使用，覆盖全部 **28 个 HTTP 操作（22 个路由文件）** 及排行榜 WebSocket 协议。

**当前仅 `GET /api/health` 实现了业务。其余 27 个 HTTP 操作均为脚手架：通过已有鉴权及参数校验后返回 `501 NOT_IMPLEMENTED`。** 本文中的请求参数反映当前可执行的校验规则；标注为“类型草案”的成功响应来自已有 TypeScript 类型，不代表接口已经返回该数据。没有成功响应类型的接口不推测返回字段。

接口不接受额外字段的业务含义：目前 JSON / 查询参数由 Zod 对象解析，未声明的字段会被忽略。当前尚未提供分页、版本前缀或跨域配置契约。

## 2. 通用约定

| 项目 | 约定 |
| --- | --- |
| 本地 HTTP 地址 | `http://localhost:3000`（默认 Next.js 开发端口，以实际启动输出为准） |
| API 前缀 | `/api` |
| 普通请求体 | JSON；调用时设置 `Content-Type: application/json` |
| 语音请求体 | `multipart/form-data`，见第 9 节 |
| 响应编码 | `application/json; charset=utf-8` |
| 缓存 | 统一响应帮助函数及健康检查设置 `Cache-Control: no-store` |
| 请求追踪 | 可传 `x-request-id`；取前 128 个字符，空值或未传时生成 UUID；响应头及响应体返回该值 |
| 标识符 | 下文 `ID` 指 trim 后长度 1–128 的字符串；`UUID` 指通过 Zod UUID 校验的字符串 |
| 日期 | `weekStart` 当前只校验 `YYYY-MM-DD` 外形，尚不校验真实日期或周一 |
| 日期时间 | `nextReviewDue` 使用 `z.string().datetime()` 校验；示例使用 UTC `Z` 格式 |

### 2.1 响应结构

统一成功封装：

```json
{"data": {}, "requestId": "req-example-001"}
```

统一错误封装（`details` 可省略）：

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "请求体校验失败",
    "details": {
      "formErrors": [],
      "fieldErrors": {"email": ["Invalid email"]}
    }
  },
  "requestId": "req-example-001"
}
```

健康检查依赖异常时，HTTP 503 仍使用 `data` 封装，不能仅凭 HTTP 状态推断一定存在 `error`。

### 2.2 状态码与错误码

| HTTP | code | 含义 / 当前触发情况 |
| --- | --- | --- |
| 200 | — | 健康检查全部依赖正常 |
| 400 | `BAD_REQUEST` | JSON 无效、参数校验失败、音频缺失或同步键不一致 |
| 401 | `UNAUTHORIZED` | 受保护接口缺少或使用无效 / 过期 access token |
| 403 | `FORBIDDEN` | 受保护接口角色不符 |
| 404 | `NOT_FOUND` | 已有错误帮助函数；业务路由尚未使用 |
| 409 | `CONFLICT` | 已有错误帮助函数；业务路由尚未使用 |
| 500 | `INTERNAL_ERROR` | 路由包装器捕获未预期异常 |
| 501 | `NOT_IMPLEMENTED` | 当前所有业务接口的最终结果 |
| 503 | `SERVICE_UNAVAILABLE` | 已有错误帮助函数；健康检查依赖异常实际返回 `data.status=degraded` |

以上错误封装适用于路由包装器处理的响应；框架处理的未知路径或未支持方法不在该约定内。

## 3. 鉴权与权限

受保护接口使用：

```http
Authorization: Bearer <accessToken>
```

`Bearer ` 前缀大小写按当前解析器精确匹配。认证检查验证 JWT 签名、有效期，以及 `type=access`、`sub` 和 `jti`；再按接口执行角色检查。

| 权限标记 | 当前行为 |
| --- | --- |
| 公开 | 路由不调用鉴权函数 |
| 家长 | 需要 `role=parent` 的 access token |
| 儿童 | 需要 `role=child` 的 access token |
| 家长 / 儿童 | 调用通用 access token 鉴权；尚未单独检查角色枚举或数据归属 |

JWT 工具默认有效期：家长 access token 900 秒，refresh token 2592000 秒（30 天），儿童 access token 1800 秒；可分别由 `JWT_ACCESS_TTL_SEC`、`JWT_REFRESH_TTL_SEC`、`JWT_CHILD_TTL_SEC` 修改。

设计流程为：家长登录 → 获取儿童档案 → 激活儿童档案 → 用儿童 token 学习。当前这些业务路由均未实现，因此尚不能通过登录接口实际取得 token。刷新、撤销 token 的底层工具存在，但尚未接入刷新及退出路由；Cookie 名称、写入方式、轮换策略和清除行为未形成可执行契约。

仓库已有 `assertChildAccess` 归属检查帮助函数，但当前业务路由未调用。不要将“家长 / 儿童”鉴权理解为已经完成儿童数据归属隔离。徽章写接口及排行榜目前为公开入口，这是现状记录，后续需要明确权限策略。

## 4. 接口总览

除健康检查外，下表接口均为 **501 脚手架**。

| 方法 | 路径 | 用途 | 权限 |
| --- | --- | --- | --- |
| GET | `/api/health` | 依赖健康检查，已实现 | 公开 |
| POST | `/api/auth/register` | 家长注册 | 公开 |
| POST | `/api/auth/login` | 家长登录 | 公开 |
| POST | `/api/auth/refresh` | 刷新 token | 公开 |
| POST | `/api/auth/logout` | 退出 | 公开 |
| GET | `/api/children` | 儿童档案列表 | 家长 |
| POST | `/api/children` | 创建儿童档案 | 家长 |
| GET | `/api/children/{id}` | 儿童档案详情 | 家长 |
| PATCH | `/api/children/{id}` | 更新儿童档案 | 家长 |
| POST | `/api/children/{id}/activate` | 激活儿童身份 | 家长 |
| GET | `/api/settings` | 家长设置 | 家长 |
| PATCH | `/api/settings` | 更新家长设置 | 家长 |
| GET | `/api/content/themes` | 主题列表 | 公开 |
| GET | `/api/content/levels` | 关卡列表 | 公开 |
| GET | `/api/content/levels/{levelId}` | 关卡详情 | 公开 |
| GET | `/api/content/items/{itemId}` | 学习项详情 | 公开 |
| POST | `/api/sessions` | 创建学习会话 | 家长 / 儿童 |
| GET | `/api/sessions` | 查询学习会话 | 家长 / 儿童 |
| GET | `/api/sessions/{id}` | 会话详情 | 家长 / 儿童 |
| PATCH | `/api/sessions/{id}` | 离线同步学习进度 | 家长 / 儿童 |
| POST | `/api/sessions/{id}/lock` | 锁定会话 | 家长 / 儿童 |
| GET | `/api/reports/weekly` | 周报 | 家长 |
| GET | `/api/reports/weak-points` | 薄弱项 | 家长 |
| POST | `/api/speech/assess` | 语音评估 | 儿童 |
| GET | `/api/leaderboard` | 周排行榜 | 公开 |
| GET | `/api/badges` | 徽章查询 | 公开 |
| POST | `/api/badges` | 徽章授予入口 | 公开 |
| POST | `/api/feedback` | 内容反馈 | 家长 |

路径中的 `{id}`、`{levelId}`、`{itemId}` 是客户端需替换的路径段。当前这些路径参数尚未执行 UUID、长度或资源存在性校验。

## 5. 基础与认证接口

### 5.1 GET /api/health

无参数，无鉴权。并行执行 PostgreSQL `SELECT 1` 与 Redis ping。全部成功返回 200；任一失败返回 503。

```json
{
  "data": {
    "status": "ok",
    "services": {
      "postgres": {"status": "up"},
      "redis": {"status": "up"}
    }
  },
  "requestId": "req-health-001"
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data.status` | string | `ok` / `degraded` |
| `data.services.postgres.status` | string | `up` / `down` |
| `data.services.redis.status` | string | `up` / `down` |
| `data.services.*.message` | string，可选 | 依赖失败时的错误信息 |

### 5.2 POST /api/auth/register

JSON 请求体：

| 字段 | 类型 | 必填 | 约束 |
| --- | --- | --- | --- |
| email | string | 是 | trim，有效邮箱，最长 320 字符 |
| password | string | 是 | 8–72 字符，不执行 trim |
| displayName | string | 是 | trim 后 1–80 字符 |

```json
{"email":"parent@example.com","password":"example-password","displayName":"家长"}
```

当前校验成功返回 501；邮箱唯一性、密码持久化及成功状态码未实现。认证成功类型草案见 5.6。

### 5.3 POST /api/auth/login

| JSON 字段 | 类型 | 必填 | 约束 |
| --- | --- | --- | --- |
| email | string | 是 | trim，有效邮箱，最长 320 字符 |
| password | string | 是 | 1–72 字符，不执行 trim |

当前不会核验账号密码，校验成功返回 501。seed 演示账号亦不能据此完成登录。

### 5.4 POST /api/auth/refresh

### 5.5 POST /api/auth/logout

两个接口当前使用同一 JSON 校验：

| 字段 | 类型 | 必填 | 约束 |
| --- | --- | --- | --- |
| refreshToken | string | 否 | 提供时至少 1 字符 |

请求体必须是有效 JSON 对象，允许 `{}`，空 HTTP body 则返回 400。当前既不验证 refresh token，也不读取或写入 Cookie，均最终返回 501。退出成功响应未定义。

### 5.6 已有认证成功类型草案

`AuthResponse` 定义以下 `data` 字段，尚未接入注册、登录、刷新路由；各路由是否复用此类型仍需业务实现确定：

```json
{
  "data": {
    "accessToken": "<parent-access-token>",
    "expiresInSec": 900,
    "parentAccount": {
      "id": "11111111-1111-4111-8111-111111111111",
      "email": "parent@example.com",
      "displayName": "家长"
    }
  },
  "requestId": "req-auth-example"
}
```

该类型没有 `refreshToken` 字段，不能据此推断 refresh token 如何下发。

## 6. 儿童档案与家长设置

### 6.1 GET /api/children

家长鉴权。可选查询参数 `childProfileId`（UUID）。当前仅校验，不执行筛选；列表响应结构尚未定义。

### 6.2 POST /api/children

家长鉴权，JSON 请求体：

| 字段 | 类型 | 必填 | 约束 |
| --- | --- | --- | --- |
| nickname | string | 是 | trim 后 1–24 字符 |
| age | integer | 是 | 7–11；当前允许可转为数字的值 |
| avatar | string | 是 | trim 后 1–64 字符；尚不校验头像白名单 |

```json
{"nickname":"小星星","age":8,"avatar":"star"}
```

### 6.3 GET /api/children/{id}

家长鉴权，无已声明的查询参数或请求体。详情响应尚未定义。

### 6.4 PATCH /api/children/{id}

家长鉴权。请求字段及约束同创建档案，但每个字段均可选，**至少提供一个已声明字段**。`{}` 或仅含未知字段会校验失败。

```json
{"nickname":"小月亮"}
```

### 6.5 POST /api/children/{id}/activate

家长鉴权，无已声明请求体。`ChildActivationResponse` 类型草案如下，当前实际返回 501：

```json
{
  "data": {
    "accessToken": "<child-access-token>",
    "expiresInSec": 1800,
    "childProfile": {
      "id": "22222222-2222-4222-8222-222222222222",
      "nickname": "小星星",
      "avatar": "star"
    }
  },
  "requestId": "req-activate-example"
}
```

### 6.6 GET /api/settings

家长鉴权，无已声明参数。成功响应未定义；可参考仓库 `ParentSettings` 模型，但不能当作已实现响应。

### 6.7 PATCH /api/settings

家长鉴权。虽然方法是 PATCH，当前校验要求以下 **全部四个字段**：

| 字段 | 类型 | 必填 | 约束 |
| --- | --- | --- | --- |
| sessionTimeLimitMin | integer | 是 | 仅 15 或 20；允许数字转换 |
| leaderboardOptIn | boolean | 是 | 使用 Zod boolean 强制转换 |
| shareRequiresAuth | boolean | 是 | 使用 Zod boolean 强制转换 |
| dailyUnlockLimit | integer | 是 | 0–5；允许数字转换 |

```json
{"sessionTimeLimitMin":20,"leaderboardOptIn":true,"shareRequiresAuth":true,"dailyUnlockLimit":1}
```

客户端应始终传原生 JSON 布尔值。当前 `z.coerce.boolean()` 使用 JavaScript 真值转换，因此字符串 `"false"` 会被转成 `true`，缺失布尔字段会被转成 `false`；这属于当前校验行为，不能理解为已定义的业务默认值。

## 7. 内容接口

四个接口当前均公开，合法请求返回 501，成功响应尚未定义。

| 方法与路径 | 参数 |
| --- | --- |
| `GET /api/content/themes` | 无 |
| `GET /api/content/levels` | 查询 `themeId`，可选，ID |
| `GET /api/content/levels/{levelId}` | 路径 `levelId` |
| `GET /api/content/items/{itemId}` | 路径 `itemId` |

已有仓库层返回类型可作为后续 DTO 设计参考：

| 类型 | 字段 |
| --- | --- |
| Theme | `id, name, nameEn, icon, levelIds, order, status`；status 为 `active/locked` |
| Level | `id, themeId, order, title, gameType, learningItemIds, passingThreshold, difficultyTier` |
| LearningItem | `id, type, word, phonetic, audioUrl, imageUrl, phonicsBreakdown, distractors, themeId`；type 为 `vocabulary/phonics` |

`gameType`：`listen_pick`、`drag_spell`、`read_aloud`、`follow_instruction`。以上为领域类型，不承诺接口会直接序列化全部字段，尤其不能将数据库实体视为 API DTO。

## 8. 学习会话与离线同步

所有会话接口调用家长 / 儿童通用鉴权，业务、数据归属和状态流转规则尚未实现。

### 8.1 POST /api/sessions

| JSON 字段 | 类型 | 必填 | 约束 |
| --- | --- | --- | --- |
| childProfileId | string | 是 | UUID |
| levelId | string | 是 | ID |

```json
{"childProfileId":"22222222-2222-4222-8222-222222222222","levelId":"animals-1"}
```

当前不验证关卡存在性、解锁状态或儿童归属，校验通过返回 501。

### 8.2 GET /api/sessions

查询 `childProfileId` 可选，UUID。尚未定义分页或排序；不应假定省略该参数会自动返回当前儿童的会话。

### 8.3 GET /api/sessions/{id}

路径参数 `id`，无其他已声明参数。会话详情成功响应未定义。

### 8.4 PATCH /api/sessions/{id}

用于提交离线学习数据。JSON 请求字段：

| 字段 | 类型 | 必填 | 约束 |
| --- | --- | --- | --- |
| clientSyncId | string | 是 | ID，客户端同步标识 |
| status | string | 否 | `active/completed/time_locked/manual_locked` |
| durationSec | integer | 否 | ≥0，秒 |
| levelsCompleted | string[] | 否 | 最多 100 项，每项为 ID |
| itemsAnswered | integer | 否 | ≥0 |
| itemsCorrect | integer | 否 | ≥0 |
| pointsEarned | integer | 否 | ≥0 |
| masteryUpdates | object[] | 否 | 最多 1000 项，见下表 |

`masteryUpdates[]`：

| 字段 | 类型 | 必填 | 约束 |
| --- | --- | --- | --- |
| learningItemId | string | 是 | ID |
| masteryScore | integer | 是 | 0–100 |
| reviewCount | integer | 是 | ≥0 |
| correctCount | integer | 是 | ≥0 |
| nextReviewDue | string | 是 | datetime，建议 UTC `Z` 格式 |
| inReviewQueue | boolean | 是 | 原生布尔值，无强制转换 |
| pronunciationBest | integer | 否 | 0–100 |

```json
{
  "clientSyncId": "sync-20261018-001",
  "status": "completed",
  "durationSec": 180,
  "levelsCompleted": ["animals-1"],
  "itemsAnswered": 5,
  "itemsCorrect": 4,
  "pointsEarned": 40,
  "masteryUpdates": [{
    "learningItemId": "cat",
    "masteryScore": 80,
    "reviewCount": 1,
    "correctCount": 1,
    "nextReviewDue": "2026-10-19T00:00:00.000Z",
    "inReviewQueue": false,
    "pronunciationBest": 85
  }]
}
```

调用方建议携带 `Idempotency-Key: sync-20261018-001`。当前请求头是可选的：**仅当请求头非空且与解析后的 `clientSyncId` 不同，才返回 400**。去重存储、重复提交处理和数据合并未实现，不能认为请求已经具备幂等性。

当前仅校验字段范围，不校验 `itemsCorrect ≤ itemsAnswered`、`correctCount ≤ reviewCount` 或状态流转合法性；累计值 / 增量值的语义也尚未定义。

已有 `SessionSyncResponse` 类型草案：

```json
{"data":{"accepted":true,"clientSyncId":"sync-20261018-001","duplicate":false},"requestId":"req-sync-example"}
```

### 8.5 POST /api/sessions/{id}/lock

路径参数 `id`，无已声明请求体。锁定原因、允许的状态流转及响应未定义。当前儿童 token 也可通过该路由的鉴权检查。

## 9. 报告、语音、排行榜、徽章与反馈

### 9.1 GET /api/reports/weekly

家长鉴权。查询参数：

| 字段 | 类型 | 必填 | 约束 |
| --- | --- | --- | --- |
| childProfileId | string | 是 | UUID |
| weekStart | string | 否 | `YYYY-MM-DD` 外形 |

当前未定义省略 weekStart 时的默认周期或报告 DTO。仓库 `WeeklyReportView` 属于前端视图类型，不等同于已实现报告响应。

### 9.2 GET /api/reports/weak-points

家长鉴权。必填查询参数 `childProfileId`，UUID；成功响应未定义。

### 9.3 POST /api/speech/assess

儿童鉴权。请求体为 `multipart/form-data`：

| 字段 | 位置 | 必填 | 约束 |
| --- | --- | --- | --- |
| audioBlob | form file | 是 | 必须解析为 Blob / File |
| learningItemId | form / query | 否 | ID |
| referenceText | form / query | 否 | trim 后最长 128 字符，允许空串 |

非空字符串 form 字段覆盖同名 query 字段，再统一进行参数校验。两个文本参数目前都可省略。未实现音频 MIME、大小、时长限制，也未调用已有 speech provider，合法请求仍返回 501。

FormData 调用应由浏览器自动设置 multipart boundary，不要手工指定不含 boundary 的 Content-Type。

### 9.4 GET /api/leaderboard

公开。可选查询：`weekStart`（`YYYY-MM-DD` 外形）、`childProfileId`（UUID）。默认周次、条目数量、个人排名及匿名展示规则尚未在该路由实现。

### 9.5 GET /api/badges

公开。可选查询 `childProfileId`（UUID）。尚未定义省略参数时返回全部徽章还是其他集合。

### 9.6 POST /api/badges

当前公开，仅校验 JSON：

| 字段 | 类型 | 必填 | 约束 |
| --- | --- | --- | --- |
| childProfileId | string | 是 | UUID |
| badgeId | string | 是 | ID |

当前不授予徽章，不检查达成条件，最终返回 501；未来写入权限需单独确认。

### 9.7 POST /api/feedback

家长鉴权，JSON：

| 字段 | 类型 | 必填 | 约束 |
| --- | --- | --- | --- |
| childProfileId | string | 否 | UUID |
| learningItemId | string | 否 | ID |
| category | string | 否 | `audio/image/content/pronunciation/other`，默认 `other` |
| message | string | 是 | trim 后 1–2000 字符 |

```json
{"learningItemId":"cat","category":"audio","message":"这道题的音频无法播放"}
```

当前未持久化反馈，成功响应未定义。

## 10. 排行榜 WebSocket

独立进程，默认地址 `ws://localhost:8080`，端口通过 `WS_PORT` 配置。当前连接没有 token 或角色校验，不使用 HTTP API 的响应封装和 requestId。

### 10.1 订阅与取消订阅

客户端发送：

```json
{"type":"subscribe","channel":"leaderboard:2026-10-12"}
```

服务端确认：

```json
{"type":"subscribed","channel":"leaderboard:2026-10-12"}
```

取消：

```json
{"type":"unsubscribe","channel":"leaderboard:2026-10-12"}
```

服务端返回 `{"type":"unsubscribed","channel":"leaderboard:2026-10-12"}`。同一连接可订阅多个频道；连接关闭后清理订阅。频道格式仅接受 `leaderboard:YYYY-MM-DD`，未验证实际日期。

不合法 JSON、消息 type 或频道返回：

```json
{"type":"error","code":"INVALID_MESSAGE"}
```

### 10.2 更新消息类型

已有广播函数及以下消息类型：

```json
{
  "type": "leaderboard.update",
  "weekStart": "2026-10-12",
  "entries": [{
    "childProfileId": "22222222-2222-4222-8222-222222222222",
    "nickname": "小星星",
    "avatar": "star",
    "weeklyPoints": 120,
    "rank": 1
  }]
}
```

`rank` 类型为 number 或 null。独立启动脚本仅启动连接、订阅和广播服务，**尚未接入 Redis 订阅或业务更新触发器**；订阅成功不代表会自动产生榜单更新，也没有初始快照、心跳、补发或断线恢复契约。

## 11. 调用示例

以下假设本地 HTTP 服务已启动。业务接口示例用于说明请求格式；使用有效 token 后仍会返回 501。

健康检查：

```bash
curl -i 'http://localhost:3000/api/health' \
  -H 'x-request-id: req-health-001'
```

注册（当前返回 501，不会创建账号）：

```bash
curl -i 'http://localhost:3000/api/auth/register' \
  -H 'Content-Type: application/json' \
  --data '{"email":"parent@example.com","password":"example-password","displayName":"家长"}'
```

查询周报（替换 `<parent-access-token>`）：

```bash
curl -i 'http://localhost:3000/api/reports/weekly?childProfileId=22222222-2222-4222-8222-222222222222&weekStart=2026-10-12' \
  -H 'Authorization: Bearer <parent-access-token>'
```

同步进度（替换会话 ID 和 token）：

```bash
curl -i -X PATCH 'http://localhost:3000/api/sessions/<session-id>' \
  -H 'Authorization: Bearer <access-token>' \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: sync-20261018-001' \
  --data '{"clientSyncId":"sync-20261018-001","status":"completed","durationSec":180,"itemsAnswered":5,"itemsCorrect":4,"pointsEarned":40}'
```

上传语音（替换 token 和本地音频路径）：

```bash
curl -i 'http://localhost:3000/api/speech/assess' \
  -H 'Authorization: Bearer <child-access-token>' \
  -F 'audioBlob=@/path/to/audio.webm' \
  -F 'learningItemId=cat' \
  -F 'referenceText=cat'
```

浏览器调用示例：

```javascript
const response = await fetch('/api/children', {
  headers: { Authorization: `Bearer ${parentAccessToken}` },
});
const body = await response.json();
if (!response.ok) {
  throw new Error(body.error?.message ?? `HTTP ${response.status}`);
}
const children = body.data; // 具体 data DTO 待业务接口实现
```

## 12. 联调边界与待定项

以下工作需在业务实现后更新本文，当前不作为已提供能力：

- 各业务接口的成功状态码、完整响应 DTO、列表分页和空值规则。
- 注册登录业务、refresh token 下发及 Cookie 契约、退出和撤销策略。
- 儿童归属校验、徽章写入权限、排行榜匿名与参与规则。
- 会话状态机、计分及掌握度的服务端校验、幂等去重与离线冲突处理。
- 报告默认周期、业务时区的路由应用、数据聚合规则。
- 音频格式 / 大小 / 时长、真实评估响应及降级行为。
- WebSocket 业务事件接入、初始榜单与重连恢复。

文档依据（相对本文件）：

- [全部 HTTP 路由](../src/app/api/)
- [请求校验 schemas.ts](../src/server/schemas.ts)
- [统一响应与错误 http.ts](../src/server/http.ts)
- [鉴权及归属检查 auth.ts](../src/server/auth.ts)
- [已有 API 响应类型](../src/types/api.ts)
- [领域及前端视图类型](../src/types/models.ts)
- [JWT 工具](../src/lib/auth/jwt.ts)
- [WebSocket 消息协议](../src/lib/websocket/protocol.ts)
- [WebSocket 服务](../src/lib/websocket/server.ts)
