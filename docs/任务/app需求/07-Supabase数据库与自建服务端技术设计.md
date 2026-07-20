# Fangrush Supabase PostgreSQL 与自建服务端技术设计

> 冻结前提：Supabase 只作为托管 PostgreSQL、连接池、迁移和备份基础设施。Fangrush 不使用 Supabase Auth、客户端 Data API、Storage、Realtime 或 Edge Functions。

## 1. 总体方案

```text
Standalone Web / Android / iOS
             |
          HTTPS JSON
             |
       apps/fangrush-api
       Next Route Handlers
       自建 Google/Apple 验票
       自建 session/JWT
       pg + SQL repositories
             |
       PostgreSQL connection
             |
       Supabase managed Postgres
       schema: fangrush
```

门户默认例外：Poki 和 CrazyGames 使用平台账号/云存档，不调用 Fangrush API。只有后续平台授权且需要统一映射时，才增加 Poki/CG token exchange endpoint。

## 2. 使用与不使用的 Supabase 能力

| 能力 | 是否使用 | 说明 |
|---|---|---|
| PostgreSQL | 是 | 唯一业务数据库 |
| Supavisor/连接池 | 是 | 按 API 部署形态选择 session/transaction mode |
| Supabase CLI migrations | 是 | `supabase/migrations` 是 schema 唯一来源 |
| Dashboard SQL/Table viewer | 只读/应急 | 正式变更必须回写 migration |
| 自动备份/PITR | 是 | 按项目套餐配置并做恢复演练 |
| Supabase Auth | **否** | 不创建/依赖 `auth.users`，不使用 `auth.uid()` |
| `supabase-js` 客户端数据库访问 | **否** | Web/App 不持有 Supabase URL/anon key |
| service role + PostgREST DAO | **否** | API 直接连接 PostgreSQL，支持事务和清晰边界 |
| Storage | 否 | 当前存档是 JSONB，不需要对象存储 |
| Realtime | 否 | 单机游戏无实时同步需求 |
| Edge Functions | 否 | API 统一由 `apps/fangrush-api` 维护 |

## 3. 服务端技术栈

| 层 | 推荐 | 理由 |
|---|---|---|
| API 应用 | 独立 Next 15 Route Handlers，Node runtime | 仓库已有 Next/TS 构建与部署经验，不增加新 Web 框架 |
| 数据库驱动 | `pg` | 直接 PostgreSQL、事务成熟、无 ORM schema 双重来源 |
| SQL 迁移 | Supabase CLI + 手写 SQL | 与托管数据库一致、可审查、可在本地/CI 重放 |
| 输入校验 | `zod`，schema 放 `packages/api-contracts` | Web/Mobile/API 共用请求响应契约 |
| JWT | `jose` | Web 标准、JWKS/Apple token 验证能力清楚 |
| Google 验票 | 官方 `google-auth-library` 或等价官方验证器 | 完整验证签名、audience、issuer、expiry |
| 密码哈希 | 不需要 | 首版无邮箱密码 |
| 日志 | 结构化 JSON + request ID | 支持脱敏、检索和告警 |
| 测试 | Vitest + 测试 PostgreSQL/Supabase local | repository、事务、API 集成测试 |

API 项目只提供 API/health，不提供玩家页面。所有 route 明确使用 Node runtime，避免数据库驱动和加密代码意外进入 Edge runtime。

## 4. 数据库连接

### 4.1 环境变量

```text
DATABASE_URL                 API 运行时连接
DIRECT_DATABASE_URL          migration、pg_dump、维护任务
DATABASE_SCHEMA=fangrush

AUTH_ISSUER=https://api.fangrush.com
AUTH_AUDIENCE=fangrush-clients
AUTH_ACCESS_PRIVATE_KEY=...
AUTH_ACCESS_PUBLIC_KEY=...
AUTH_REFRESH_PEPPER=...

GOOGLE_WEB_CLIENT_ID=...
APPLE_CLIENT_ID=...
APPLE_TEAM_ID=...
APPLE_KEY_ID=...
APPLE_PRIVATE_KEY=...
```

任何 `DATABASE_*`、private key 和 refresh pepper 都不能以 `NEXT_PUBLIC_` 开头。

### 4.2 连接模式

- API 部署为 Vercel/serverless：`DATABASE_URL` 使用 Supavisor transaction mode，数据库调用不得依赖 session 状态和命名 prepared statement。
- API 部署为常驻 Node 服务：优先 direct connection；网络不支持时使用 Supavisor session mode。
- `DIRECT_DATABASE_URL` 用于 migration、dump 和单会话维护，不用于大量 serverless 请求。
- 每个进程/实例建立小型 `pg.Pool`，设置连接、statement 和 idle timeout。
- 所有 query 通过 repository 层；route handler 禁止散落 SQL。

Supabase 官方明确区分 direct、session pooler 和 transaction pooler；部署时按实际运行形态选择，不把连接字符串写死进代码。

## 5. Schema 与访问边界

### 5.1 专用 schema

所有业务表放 `fangrush` schema，不放 `public`：

```sql
create schema if not exists fangrush;
revoke all on schema fangrush from public, anon, authenticated;
```

Fangrush 不通过 PostgREST 暴露这些表。客户端没有数据库角色；玩家鉴权发生在 API 层，API 根据自己的 session `sub` 决定 `user_id`。

RLS 不作为主要业务鉴权，因为没有 Supabase Auth/JWT 到数据库的映射。可以对表启用 RLS 且不给 `anon/authenticated` policy 作为防误暴露，但 API 使用受保护的数据库连接访问。

### 5.2 Migration 纪律

- 路径：`supabase/migrations/<timestamp>_<name>.sql`。
- 本地、staging、production 使用同一 migration 顺序。
- 禁止只在 Dashboard 手工改生产表。
- 若紧急手工修改，下一次提交前必须 `db pull/diff` 并生成等价 migration。
- migration 默认向前兼容：先加 nullable/default，再部署新代码，最后清理旧字段。
- 已应用 production 的 migration 不回改内容，只新增补丁 migration。

## 6. 核心数据模型

以下是逻辑字段；精确 SQL 由 DB-002 migration 实现。

### 6.1 `users`

```text
id               uuid primary key
status           active | deletion_pending | deleted
display_name     text nullable
avatar_url       text nullable
created_at       timestamptz
updated_at       timestamptz
deleted_at       timestamptz nullable
```

- 不强制 email，更不能以 email 做用户唯一身份。
- 用户删除后可保留不可逆随机 ID 用于交易审计，但个人字段清空。

### 6.2 `auth_identities`

```text
id                 uuid primary key
user_id            uuid -> users on delete cascade
provider           google | apple | poki | crazygames
provider_subject   text
provider_email     text nullable
email_verified     boolean nullable
display_name       text nullable
avatar_url         text nullable
created_at         timestamptz
updated_at         timestamptz

unique(provider, provider_subject)
index(user_id)
```

- `provider_subject` 只能来自服务端验票后的稳定 ID。
- 不使用 `unique(email)` 触发自动合并。
- 一个用户可绑定多个 provider；同一 provider subject 只能属于一个用户。

### 6.3 `sessions`

```text
id                    uuid primary key
user_id               uuid -> users
family_id             uuid
refresh_token_hash    text unique
rotation_counter      integer
client_type           web | android | ios
device_id             text nullable
created_at            timestamptz
last_used_at          timestamptz
expires_at            timestamptz
revoked_at            timestamptz nullable
revoked_reason        text nullable
```

- refresh token 是高熵随机 opaque token，不使用长期 stateless refresh JWT。
- 数据库只存带 pepper 的 hash，不存原文。
- 每次刷新轮换 token；旧 token 再次使用视为可能重放，撤销整个 `family_id`。
- 用户登出撤销当前 session，删除账号撤销全部 session。

### 6.4 `player_saves`

```text
user_id                uuid primary key -> users
revision               bigint not null
schema_version         integer not null
save_json              jsonb not null
checksum               text not null
updated_by_device_id   text nullable
client_updated_at      timestamptz nullable
updated_at             timestamptz
```

- 每个 Fangrush 用户首版只有一个主存档。
- `revision` 服务端递增，客户端不可指定结果 revision。
- `save_json` 通过 API schema、`migrate()` 兼容范围和大小限制校验。

### 6.5 `save_revisions`

```text
user_id          uuid
revision         bigint
request_id       uuid
schema_version   integer
save_json        jsonb
checksum         text
reason           initial | sync | merge | support_restore | migration
created_at       timestamptz

primary key(user_id, revision)
unique(user_id, request_id)
```

- 用于幂等重试、冲突诊断和客服恢复。
- 正常保留最近 N 个版本和最长期限，定时清理；support restore 记录长期审计。

### 6.6 `entitlements`

```text
id                 uuid primary key
user_id            uuid -> users
entitlement_key    remove_ads | skin:<id>
source             google_play | app_store | support
source_reference   text
status             active | revoked | expired
valid_until        timestamptz nullable
created_at         timestamptz
updated_at         timestamptz

unique(user_id, entitlement_key, source, source_reference)
```

普通 `SaveGame` 不存这些真相。客户端每次登录/恢复购买后重新获取有效权益。

### 6.7 `purchases`

```text
id                       uuid primary key
user_id                  uuid nullable -> users
platform                 google_play | app_store
product_id               text
transaction_id           text
original_transaction_id  text nullable
status                   pending | verified | revoked | refunded | failed
receipt_hash             text nullable
verified_at              timestamptz nullable
raw_payload              jsonb nullable, restricted/retained minimally
created_at               timestamptz
updated_at               timestamptz

unique(platform, transaction_id)
```

- 未登录购买允许先验证并留在商店恢复域；绑定用户时必须再次证明商店交易。
- 不在日志打印 receipt/token。

### 6.8 `privacy_requests`

```text
id             uuid primary key
user_id        uuid
request_type   export | delete
status         requested | confirmed | processing | completed | rejected
requested_at   timestamptz
confirmed_at   timestamptz nullable
completed_at   timestamptz nullable
result_ref     text nullable
```

### 6.9 `audit_events`

只记录认证、provider 绑定、会话撤销、存档恢复、购买校验、权益变更和隐私请求等高价值事件。payload 必须脱敏，禁止完整 token、email、receipt 和 save JSON。

## 7. API 规范

### 7.1 通用响应

成功：

```json
{
  "data": {},
  "requestId": "uuid"
}
```

失败：

```json
{
  "error": {
    "code": "SAVE_REVISION_CONFLICT",
    "message": "The cloud save changed on another device.",
    "retryable": true,
    "details": {}
  },
  "requestId": "uuid"
}
```

- `code` 是客户端逻辑依据；`message` 不是稳定契约。
- 生产错误不返回 SQL、堆栈、provider token 或内部表名。
- 所有改变状态的请求接受/生成 request ID；购买和保存按 request ID 幂等。

### 7.2 Endpoint

| Method | Path | Auth | 用途 |
|---|---|---|---|
| `GET` | `/health/live` | 否 | 进程存活，不访问 DB |
| `GET` | `/health/ready` | 内部 | DB 和必要配置可用 |
| `POST` | `/v1/auth/google/exchange` | provider token | Google 换 Fangrush session |
| `POST` | `/v1/auth/apple/exchange` | provider token | Apple 换 Fangrush session |
| `POST` | `/v1/auth/refresh` | refresh token | token 轮换 |
| `POST` | `/v1/auth/logout` | session | 撤销当前 session |
| `GET` | `/v1/me` | access token | 用户、identity、同步能力 |
| `POST` | `/v1/me/identities/{provider}/link` | access + provider | 显式绑定 |
| `DELETE` | `/v1/me/identities/{provider}` | access + reauth | 解绑，至少保留一种恢复方式 |
| `GET` | `/v1/save` | access | 云存档 envelope |
| `PUT` | `/v1/save` | access | 基于 revision 写入 |
| `GET` | `/v1/entitlements` | access | 有效权益 |
| `POST` | `/v1/purchases/google/verify` | access optional | Play 交易验证 |
| `POST` | `/v1/purchases/apple/verify` | access optional | App Store 交易验证 |
| `POST` | `/v1/purchases/restore` | access optional | 恢复并投影权益 |
| `POST` | `/v1/privacy/export` | access + reauth | 数据导出 |
| `POST` | `/v1/privacy/delete` | access + reauth | 账号删除 |

Poki/CG exchange endpoint 不在首版 schema 中，避免未获得权限前形成错误承诺。

## 8. 认证技术设计

### 8.1 Google

推荐统一使用服务端 audience 对应的 Google ID token：

1. Web 使用 Google Identity Services 获取 ID token/credential。
2. Android Credential Manager 请求服务端 client ID 对应的 ID token。
3. API 用官方验证库检查签名、`iss`、`aud`、`exp`、`sub`，并按需要检查 nonce。
4. 使用 `sub` 查 `auth_identities`；不存在则创建用户和 identity。
5. 不因相同 email 绑定已有用户。

StartUpSense 的 `tokeninfo(access_token) + userinfo` 可以作为旧流程参考，但 Fangrush 不原样复制：旧实现对 tokeninfo 非 2xx 仍继续、依赖 access token/userinfo，并且 email 模型不适合多 provider。

### 8.2 Apple

1. 客户端获取 authorization code 和 identity token。
2. API 从 Apple JWKS 验签，检查 issuer、audience、expiry、nonce 和 `sub`。
3. 首次授权时最小化保存 name/email；后续不能假设 Apple 再返回。
4. 删除账号时按 Apple 要求撤销 token/授权。
5. Apple `sub` 是 provider subject，隐藏邮箱不影响账号稳定性。

### 8.3 Fangrush access/refresh

- Access JWT：建议 15 分钟；包含 `iss/aud/sub/sid/iat/exp`，不包含 email、权益和完整 profile。
- Refresh token：建议 30 天、opaque random、数据库 hash、每次使用轮换。
- Web：access token 内存，refresh token `Secure HttpOnly` cookie。
- App：access 可内存，refresh 存 Keychain/Keystore，通过原生安全存储 adapter。
- 权益变化不等待 access token 过期，客户端从 entitlement endpoint 刷新。

### 8.4 Provider 绑定

绑定必须在已登录 session 下再次完成新 provider 验票。事务顺序：

1. 锁定/查询 `(provider, subject)`。
2. 未占用则插入当前 user。
3. 已属于当前 user 则幂等成功。
4. 已属于其他 user 返回 `IDENTITY_ALREADY_LINKED`，不按 email 或存档大小自动合并。

跨账号人工合并属于 Admin 支持工具的后置能力，必须保留审计和双向确认。

## 9. 云存档事务

### 9.1 读取

- `GET /v1/save` 从 access token `sub` 获取 user，忽略任何客户端 user ID。
- 无存档返回 `data: null`，不是 500。
- 返回 `revision/schemaVersion/checksum/updatedAt/save`。

### 9.2 首次写入

事务：

1. 校验 schema、JSON 大小、合法字段和请求 ID。
2. 确认 `baseRevision = 0` 且当前无行。
3. 插入 `player_saves revision=1`。
4. 插入 `save_revisions revision=1`。
5. 提交后返回新 envelope。

### 9.3 更新

```sql
begin;
select revision from fangrush.player_saves
where user_id = $1 for update;

-- current revision 必须等于 baseRevision
-- request_id 已处理时返回原结果
-- 否则 revision + 1，并写历史
commit;
```

- revision 不匹配返回 HTTP 409 和当前云 envelope。
- 客户端使用 `game-core` 合并函数合并本地/云端，再用新 baseRevision 重试一次。
- API 不做“最后写赢整包覆盖”。
- API 可做结构校验、字段上限和合法 ID 清理，但不能复制一套游戏业务规则。

### 9.4 幂等与损坏保护

- `(user_id, request_id)` 唯一，网络重试不产生多个 revision。
- checksum 与 JSON 同时存；读取不一致时停止返回该 revision并告警。
- schema 高于客户端支持范围时客户端停止写入。
- 服务端保留历史，不让损坏客户端把默认空存档立即覆盖云端。

## 10. 权益与购买事务

- 客户端 purchase callback 只表示“需要验证”，不直接永久解锁。
- API 调 Google/Apple 官方服务验证 transaction。
- `purchases` 以 `(platform, transaction_id)` 幂等 upsert。
- 验证成功后在同一事务更新 `entitlements`。
- refund/revoke 通知更新 purchase 和 entitlement，保留审计。
- `remove_ads` 生效后 runtime 仍可保留主动激励入口，但 UI/商品描述必须一致。
- 支持人员手工授予使用 `source=support`，要求原因、操作者和审计事件。

## 11. 安全控制

### API 边界

- HTTPS、严格 CORS allowlist、body 大小限制、JSON content type。
- Web cookie 请求必须 `credentials: include`，服务端校验 `Origin`；refresh/logout/link/delete 等状态变更只接受 POST/DELETE，并结合 SameSite cookie 和 CSRF 防护。
- auth exchange、refresh、link、purchase、privacy 分别限流。
- provider token、refresh token、receipt 不进入日志和错误响应。
- 结构化日志中的 user/session/device 只存内部 ID 或 hash。
- 所有数据库查询参数化；动态表名/排序白名单。
- route 层验证输入，repository 层不接受未经规范化的自由对象。

### 客户端边界

- Web/App 不含 `DATABASE_URL`、Supabase key、JWT private key。
- portal bundle 不含 Fangrush provider 配置和 API session 代码。
- refresh 凭证不放 Web localStorage。
- App JS 与原生安全存储之间只暴露最小 get/set/clear session 方法。

### 运营边界

- 数据库生产访问使用个人账号/MFA/最小权限，不共享密码。
- 备份下载加密保存并有访问审计。
- 支持工具不展示完整 token/receipt/save history，敏感操作二次确认。

## 12. 环境与部署

| 环境 | Supabase | OAuth/IAP | 数据 |
|---|---|---|---|
| local | Supabase CLI local Postgres | mock/开发 provider | 可重置 seed |
| staging | 独立 Supabase project | OAuth test、商店 sandbox | 隔离测试用户 |
| production | 独立 Supabase project | 正式 provider/商店 | 真实玩家数据 |

- staging 不复用 production 数据库和 JWT key。
- App 内测默认连接 staging；商店 release candidate 显式切 production，并由 build manifest 记录。
- production migration 先在 local `db reset`、staging migration/integration test 通过。
- API 和 DB migration 使用 expand/contract 发布，避免 API 回滚时字段消失。

## 13. 备份与恢复

- 付费阶段使用 Supabase 自动日备份；数据价值提升后评估 PITR。
- 免费方案必须定期 `db dump` 并离站保存，因为平台自动备份能力有限。
- 每季度至少做一次恢复到新项目/隔离数据库的演练。
- 恢复验收不是“SQL 导入成功”，还要验证用户、identity、session 撤销、存档 revision、entitlement 和 purchase 外键完整。
- 项目删除会连同平台备份永久删除，生产项目删除必须有独立审批和离站备份。

## 14. StartUpSense 复用清单

### 可复用思路/小模块

- auth config 的集中读取和启动时校验。
- provider 封装、auth response、route middleware 的职责划分。
- Google 登录 UI 的交互和错误状态。
- DAO/repository 分层、API route 到 service 的调用方向。
- Supabase migration 目录和专用 schema 思路。

### 不直接复制

- `@supabase/supabase-js + SUPABASE_SERVICE_ROLE_KEY` DAO：Fangrush 改为 `pg` 直连。
- email 必填/唯一的 `users` 表：不适合 Apple 隐藏邮箱和多 provider。
- access token `tokeninfo + userinfo` 验证实现：改用当前官方 ID token 验证。
- stateless refresh JWT：改为数据库 hash + rotation family。
- `loginWithGoogle` 中按 email 找用户并自动绑定：禁止。
- password、credits、admin role、reset token 和 StartUpSense 业务日志。

复用标准是“减少成熟基础代码重复”，不是把旧项目的安全和业务假设一起搬过来。

## 15. 测试要求

### 数据库

- migration 从空库重放、重复 reset、约束和索引测试。
- provider subject 唯一、session rotation、save revision、purchase 幂等并发测试。
- 删除用户 cascade/保留策略测试。

### API

- 无 token、过期 token、错误 audience、重放 refresh、撤销 session。
- Google/Apple 新建、重复登录、显式绑定和 identity 冲突。
- save 初始、更新、相同 request 重试、409、多设备、超大/非法 schema。
- purchase 成功、pending、重复、refund/revoke。
- export/delete、重新认证和全部 session 撤销。

### 安全

- 构建产物 secret scan。
- 日志脱敏 snapshot。
- CORS、rate limit、body limit、SQL injection 和错误泄漏测试。

## 16. 完成定义

1. Supabase project 中没有 Fangrush 对 Supabase Auth 的运行依赖。
2. Web/App 客户端不包含 Supabase URL/key，不直接访问数据库。
3. `supabase/migrations` 可从空库重建完整 `fangrush` schema。
4. API 使用 PostgreSQL connection 和事务完成 auth/save/entitlement。
5. Google/Apple subject 映射不依赖 email 自动合并。
6. refresh rotation、409 save conflict 和 purchase idempotency 有并发测试。
7. staging/production 隔离、备份和恢复演练有证据。

## 17. 官方参考

- [Supabase PostgreSQL 连接与 Supavisor](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase 本地开发与 migrations](https://supabase.com/docs/guides/local-development/overview)
- [Supabase CLI 工作流](https://supabase.com/docs/guides/local-development/cli-workflows)
- [Supabase 数据库备份](https://supabase.com/docs/guides/platform/backups)
- [Google Play Games 平台身份分层](https://developer.android.com/games/pgs/platform-authentication)
- [Sign in with Apple](https://developer.apple.com/documentation/signinwithapple)
