# P-ACCOUNT · 账号与云存档（傻瓜式实施说明）

> 本文件独立维护，不挂任务清单。  
> **参考仓库（本机绝对路径）**：`C:\Users\fansu\git\StartUpSense`  
> Fangrush 仓库：`C:\Users\fansu\git\3pk15`  
> 下文凡写「SS:」= StartUpSense 里打开这个文件照着改；「FR:」= Fangrush 建议落到的路径。

做成什么样算完：独立站 Google 登录后，换浏览器再登录，碎片/皮肤/通关还在；门户包无登录、仍仅本地。

---

## 0. 先建立心智模型（2 分钟）

```text
玩家点「Continue with Google」
  → 浏览器弹出 Google（SS 用 @react-oauth/google）
  → 拿到 Google access_token（不是你们自己的 JWT）
  → POST /api/auth/google { token }
  → 服务端问 Google：这个 token 是谁？（tokeninfo + userinfo）
  → 在 Postgres 里找/建 users + auth_credentials
  → 签发你们自己的 access JWT + refresh cookie
  → 前端把 access JWT 存 localStorage
  → 以后请求带 Authorization: Bearer <JWT>
  → GET/PUT /api/save 读写云端 SaveGame
```

**不是** NextAuth，**不是** Supabase Auth。  
Supabase 在 SS 里 = **带 schema 的 Postgres**（`SUPABASE_SERVICE_ROLE_KEY` 服务端直连）。

现行 Fangrush 进度只在浏览器：

- FR: `apps/web/src/lib/storage.ts`（键 `wolf-sheep-save-v1`）
- FR: `packages/game-core/src/content/save.ts`（类型 `SaveGame`）

---

## 1. StartUpSense 代码地图（实现时按这个打开，别再搜）

根目录一律：`C:\Users\fansu\git\StartUpSense\`

### 1.1 首期必抄 / 必对照（Google 登录最小集）

| 步骤 | 打开这个文件（绝对路径） | 干什么 |
|------|--------------------------|--------|
| Google 验票 | `C:\Users\fansu\git\StartUpSense\lib\auth\providers\google.ts` | `tokeninfo` + `userinfo`；`createGoogleProvider()` |
| Auth 配置 | `C:\Users\fansu\git\StartUpSense\lib\auth\config.ts` | `NEXT_PUBLIC_GOOGLE_CLIENT_ID`、`JWT_*`、`REFRESH_*` |
| 签/验 JWT | `C:\Users\fansu\git\StartUpSense\lib\auth\jwt.ts` | `signToken` / `verifyToken` |
| 登录成功响应 | `C:\Users\fansu\git\StartUpSense\lib\auth\auth-response.ts` | JSON + Set-Cookie refresh |
| Refresh Cookie | `C:\Users\fansu\git\StartUpSense\lib\auth\utils\cookie-utils.ts` | cookie 名 `refresh_token`，path `/api/auth` |
| API 鉴权 | `C:\Users\fansu\git\StartUpSense\lib\auth\middleware.ts` | `requireAuth` / `optionalAuth` |
| 业务：Google 登录 | `C:\Users\fansu\git\StartUpSense\lib\services\auth-service.ts` | 搜 **`loginWithGoogle`**（约 218 行起）：credential → 或 email 绑 → 或新建用户 |
| Credential DAO | `C:\Users\fansu\git\StartUpSense\lib\dao\auth-credential-dao.ts` | `findByProvider` / `create` |
| User DAO | `C:\Users\fansu\git\StartUpSense\lib\dao\user-dao.ts` | `findById` / `findByEmail` / `create` |
| Google API 路由 | `C:\Users\fansu\git\StartUpSense\app\api\auth\google\route.ts` | `POST`，调 `loginWithGoogle` |
| Refresh 路由 | `C:\Users\fansu\git\StartUpSense\app\api\auth\refresh\route.ts` | 换 access |
| Logout 路由 | `C:\Users\fansu\git\StartUpSense\app\api\auth\logout\route.ts` | 清 cookie |
| Me 路由 | `C:\Users\fansu\git\StartUpSense\app\api\auth\me\route.ts` | 当前用户 |
| 前端 token | `C:\Users\fansu\git\StartUpSense\lib\auth\client\token-manager.ts` | localStorage 键 `startupsense:token:v1`（FR 改成 `fangrush:token:v1`） |
| 前端刷新 | `C:\Users\fansu\git\StartUpSense\lib\auth\client\refresh-manager.ts` | 401 时 `POST /api/auth/refresh` |
| Auth 上下文 | `C:\Users\fansu\git\StartUpSense\components\auth\auth-provider.tsx` | `loginWithGoogle` / `logout` / `user` |
| Google 按钮 | `C:\Users\fansu\git\StartUpSense\components\auth\google-login-button.tsx` | `@react-oauth/google` 的 `useGoogleLogin` |
| 用户类型 | `C:\Users\fansu\git\StartUpSense\lib\types\user.ts` | `User` / `PublicUser` / `toPublicUser` |
| 表结构 | `C:\Users\fansu\git\StartUpSense\supabase\migrations\001_startupsense_bootstrap.sql` | 看 `users`（约 7 行）、`auth_credentials`（约 29 行） |
| Env 模板 | `C:\Users\fansu\git\StartUpSense\.env.example` | Tier 1 Auth + Google + Supabase 段 |
| Google Console 说明 | `C:\Users\fansu\git\StartUpSense\docs\系统账号\google-oauth账号\Google-OAuth配置说明.md` | origins 怎么配 |

### 1.2 首期不要抄（避免把 SS 整站拖进来）

| 路径 | 原因 |
|------|------|
| `...\app\api\auth\login\route.ts`、`register\route.ts`、`reset-password\**`、`change-password`、`set-password` | 邮箱密码；Fangrush 首期不做 |
| `...\lib\auth\password.ts` | 同上 |
| `...\components\auth\login-form.tsx`、`register-form.tsx` | 同上 |
| `...\lib\services\credit-service.ts`、credits 相关 | 积分经济，与游戏无关 |
| `...\lib\services\user-activity-service.ts` | 可后置；首期可省略打点 |
| `...\lib\auth\e2e-mock-google.ts` | 可选；有 E2E 再抄 |
| `google-auth-library` / `lib\media\gcp-auth.ts` | **媒体 GCP**，与登录无关 |

### 1.3 `loginWithGoogle` 逻辑（照这个写，打开 SS 核对）

打开：`C:\Users\fansu\git\StartUpSense\lib\services\auth-service.ts` → `loginWithGoogle`：

1. `createGoogleProvider().verifyToken(token)` → email / id / name / avatar  
2. `authCredentialDAO.findByProvider('google', profile.id)`  
   - 有 → 取 user → `signToken` → 返回  
3. 否则 `userDAO.findByEmail(email)`  
   - 有用户 → `authCredentialDAO.create` 绑定 google  
   - 无 → `userDAO.create`（`password_hash: null`）+ create credential  
4. `signToken` + `toPublicUser` 返回  

Fangrush **不要**抄里面的 `credits` / `grantSignupBonus` / activity 日志（可整段删掉）。

---

## 2. Fangrush 建议落点（新建时按这个建文件）

在 `C:\Users\fansu\git\3pk15\apps\web\` 下建议：

| FR 路径 | 对照 SS | 备注 |
|---------|---------|------|
| `src/lib/auth/config.ts` | `lib/auth/config.ts` | project name 改 `fangrush` |
| `src/lib/auth/providers/google.ts` | `lib/auth/providers/google.ts` | 可几乎原样 |
| `src/lib/auth/jwt.ts` | `lib/auth/jwt.ts` | payload 可只留 `sub,email` |
| `src/lib/auth/auth-response.ts` | 同名 | |
| `src/lib/auth/utils/cookie-utils.ts` | 同名 | |
| `src/lib/auth/middleware.ts` | 同名 | 可精简，去掉 admin role 若暂不需要 |
| `src/lib/auth/client/token-manager.ts` | 同名 | 键改为 `fangrush:token:v1` |
| `src/lib/auth/client/refresh-manager.ts` | 同名 | |
| `src/lib/db/supabase.ts` | SS 里找 supabase client 创建处 | service role **仅服务端** |
| `src/lib/dao/user-dao.ts` | `lib/dao/user-dao.ts` | 字段裁剪：去掉 credits 等 |
| `src/lib/dao/auth-credential-dao.ts` | 同名 | |
| `src/lib/dao/player-save-dao.ts` | **SS 没有** | 新建：读写 `player_saves` |
| `src/lib/services/auth-service.ts` | 只留 `loginWithGoogle` 精简版 | |
| `src/app/api/auth/google/route.ts` | 同名 | |
| `src/app/api/auth/refresh/route.ts` | 同名 | |
| `src/app/api/auth/logout/route.ts` | 同名 | |
| `src/app/api/auth/me/route.ts` | 同名 | |
| `src/app/api/save/route.ts` | **SS 没有** | `GET`/`PUT` SaveGame |
| `src/components/auth/auth-provider.tsx` | 同名 | 可去掉 email login/register |
| `src/components/auth/google-login-button.tsx` | 同名 | 文案走 FR `messages.ts` |
| `packages/game-core/src/content/merge-save.ts` | **SS 没有** | `mergeSaveGames` + 单测 |

壳：仅当 `process.env.NEXT_PUBLIC_APP_SHELL !== 'portal'`（或 `=== 'standalone'`）渲染登录按钮。  
现有本地存档继续用 FR: `apps/web/src/lib/storage.ts`、`save-store.ts`。

---

## 3. 环境变量（对照抄）

先看 SS 模板：`C:\Users\fansu\git\StartUpSense\.env.example`（Tier 1 Supabase + Auth + Google）。

写入 FR: `apps/web/.env.example`（及本地 `.env.local`）：

```bash
# 与 StartUpSense 同名，便于对照
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
JWT_SECRET=
JWT_EXPIRES_IN=15m
# REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRES_IN=30d
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Fangrush 已有
NEXT_PUBLIC_APP_SHELL=standalone
NEXT_PUBLIC_SITE_URL=http://localhost:5000
```

Google Cloud Console：

1. 建 OAuth 客户端（Web）  
2. **Authorized JavaScript origins** 加：`http://localhost:5000`、正式站域名  
3. 本方案用 popup `access_token`，一般**不需要** Client Secret  
4. 详细步骤打开：`C:\Users\fansu\git\StartUpSense\docs\系统账号\google-oauth账号\Google-OAuth配置说明.md`

未设 `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 时：隐藏 Google 按钮（SS 行为，建议照做）。

---

## 4. 数据库（对照 SS 表 + Fangrush 增一表）

### 4.1 从 SS 抄结构

打开：`C:\Users\fansu\git\StartUpSense\supabase\migrations\001_startupsense_bootstrap.sql`

- `startupsense.users`（约 L7–）：Fangrush 可建 schema `fangrush`，字段首期够用：`id, email, display_name, avatar_url, created_at, updated_at`（**可去掉** credits / role / reset_token 等，或先留 null）  
- `startupsense.auth_credentials`（约 L29–）：`user_id, provider, provider_id, provider_email`，`UNIQUE(provider, provider_id)`

### 4.2 Fangrush 新建（SS 没有）

```sql
-- 示意：整份 SaveGame JSON
CREATE TABLE fangrush.player_saves (
  user_id UUID PRIMARY KEY REFERENCES fangrush.users(id) ON DELETE CASCADE,
  save_json JSONB NOT NULL,
  schema_version INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`save_json` 形状 = FR `packages/game-core/src/content/save.ts` 的 `SaveGame`。

---

## 5. 云存档 API（SS 没有，按这个写）

| 方法 | 路径 | 行为 |
|------|------|------|
| GET | `/api/save` | `requireAuth` → 读 `player_saves`；无行则 404 或返回 null |
| PUT | `/api/save` | `requireAuth` → body 为 `SaveGame`；校验 `schemaVersion`；upsert |

前端：登录成功后：

1. `loadSave()` 读本地（FR `storage.ts`）  
2. `GET /api/save`  
3. `mergeSaveGames(local, cloud)`（见下节）  
4. 写回本地 + `PUT /api/save`  
5. 之后玩的时候照旧写本地，并 debounce `PUT`

---

## 6. 本地与云合并（定死，SS 没有）

建议 FR: `packages/game-core/src/content/merge-save.ts` + Vitest。

| 字段 | 规则 |
|------|------|
| `clearedLevels` / `unlockedSkinIds` / `unlockedChapters` | **并集** |
| `fragments.*` | 各数值 **max** |
| `equipped` / `settings` / `guide` | **云优先**；云空则本地 |
| `quests` | 进度 max；已领取 id 并集 |
| `buffs` / `lastPlayedLevelId` | 云优先，空则本地 |

之后日常：以云为真相；冲突用表列 `updated_at` 最后写入胜。  
首次合并可弹确认：「将合并本机与云进度」。

---

## 7. 渠道边界（别漏）

| 端 | 做账号？ |
|----|----------|
| 独立站 `standalone` | 是 |
| `pnpm build:portal` | **否**（无按钮、云 API 可拒） |
| 日后 App | **同一** users / player_saves；再加 Apple（后置） |

多渠道说明：FR `docs/技术设计/07-游戏架构总览.md` §3.3。

---

## 8. 傻瓜式实施顺序（打勾用）

### 阶段 A — 能 Google 登录（还不做云存档）

1. [ ] 读完本文 §1 表，在资源管理器收藏 `StartUpSense\lib\auth`  
2. [ ] Google Console 配 origins；`.env.local` 填 Client ID + `JWT_SECRET` + Supabase  
3. [ ] 建 `fangrush.users` + `auth_credentials`（对照 `001_startupsense_bootstrap.sql`）  
4. [ ] 按 §2 表从 SS **精简复制** auth 文件到 FR（去掉密码/积分）  
5. [ ] 设置页或页眉加 `GoogleLoginButton`（仅 standalone）  
6. [ ] 冒烟：点登录 → Network 见 `POST /api/auth/google` 200 → `localStorage` 有 `fangrush:token:v1` → `GET /api/auth/me` 有 user → 登出清空  

**对照打开**：  
`...\google-login-button.tsx` → `...\auth-provider.tsx` → `...\api\auth\google\route.ts` → `...\auth-service.ts` `loginWithGoogle`。

### 阶段 B — 云存档 + 合并

7. [ ] 建 `player_saves`；写 `player-save-dao` + `/api/save`  
8. [ ] 写 `mergeSaveGames` + 单测  
9. [ ] 登录成功钩子：拉云 → 合并 → 写本地+云  
10. [ ] 冒烟：浏览器 A 通关 → 登录；浏览器 B 登录同一 Google → 进度在；两机不同进度 → 并集/max 符合 §6  

### 阶段 C — 壳与后置

11. [ ] `build:portal` 无登录入口  
12. [ ]（后）Apple：新 provider，仍绑同一 `users.id`  
13. [ ]（后）Capacitor 同一套 API  

---

## 9. 依赖包（与 SS 对齐的最小集）

```bash
# 在 apps/web
pnpm add @react-oauth/google jsonwebtoken @supabase/supabase-js
pnpm add -D @types/jsonwebtoken
```

首期**不要**为登录装 NextAuth / Supabase Auth SDK（除非你改方案）。

---

## 10. 常见坑（SS 踩过的 / 文档里写过的）

| 现象 | 检查 |
|------|------|
| 没有 Google 按钮 | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 是否进了 **web** 的 env；是否 portal 壳 |
| popup 失败 / origin 错 | Console 的 JavaScript origins 是否含当前端口（FR 默认 **5000**） |
| token audience mismatch | `google.ts` 里 audience 必须等于 Client ID |
| 刷新丢登录 | refresh cookie path 是否 `/api/auth`；是否 `credentials: 'include'` |
| service role 泄漏 | 禁止 `NEXT_PUBLIC_` 前缀；只在 Route Handler 用 |
| 门户也出现登录 | UI 与 `APP_SHELL` 双保险；portal 构建勿带 Client ID 也行 |

---

## 11. 验收清单（首期 A+B）

1. 未登录可玩，进度在本地。  
2. Google 登录成功，me 有用户。  
3. PUT/GET save 往返一致。  
4. 第二浏览器同账号进度一致。  
5. 合并规则符合 §6（写 fixture）。  
6. portal 包无登录。  
7. `pnpm test` 通过。

---

## 12. 一句话导航

> 实现 Google 登录时：资源管理器打开 `C:\Users\fansu\git\StartUpSense\lib\auth` 与 `...\components\auth\google-login-button.tsx`，按本文 §1.1 表逐个对照；云存档与合并是 Fangrush 增量，按 §5–§6 新写，SS 里没有现成文件。
