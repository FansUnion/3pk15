# App主线与多渠道基础能力需求理解

> **文档状态：研究稿，已被正式需求文档集替代。**  
> 正式入口见 [00-需求总纲与决策记录.md](./00-需求总纲与决策记录.md)，产品与渠道方案见 `01` 至 `05`，开发级底层架构、Supabase/API 设计和任务依赖见 `06` 至 `08`。本文保留用于追溯早期分析，不再作为执行依据。

> 本文是对 `app需求.md` 的结构化理解稿，用于后续整理正式需求文档。它不替代现有产品、架构和渠道文档；若进入执行，应再拆入需求池、任务清单和具体技术设计。

## 1. 背景校准

当前讨论的重点不是 Fangrush 当前 H5 首发缺什么，也不是单独给某个渠道补一个账号按钮。用户的真实意图是：以 Google Play / App Store 的 App 版本为主线，提前规划 App 必需或高价值的基础能力，同时兼顾 H5 独立站、Poki、CrazyGames 等渠道，避免账号、存档、广告、支付和平台生命周期在不同端重复建设。

仓库现有长期边界已经明确：

- 所有载体共享同一 `packages/game-core`，平台差异只能进入应用外壳或平台适配层。
- 独立站、H5 平台和未来 App 共享同一规则、AI 和 24 关配置。
- 广告、生命周期、分享、支付、登录和云存档必须通过能力接口接入，不支持时隐藏或降级。
- 任一渠道的基础对局、基础奖励和本地恢复不能依赖广告填充、支付成功或账号登录。

这次需求设计应在上述边界内推进，但口径要从“账号不是硬前置”升级为“App 主线需要统一设计这些能力，分阶段落地”。

## 2. 总体目标

最终要形成一套可复用的多渠道基础能力体系：

```text
同一 game-core
  -> 同一 SaveGame / 奖励 / 进度模型
  -> 同一云存档合并规则
  -> 同一账号与平台身份抽象
  -> 同一广告与支付能力抽象
  -> 多个渠道适配器
```

目标不是所有渠道使用完全相同的登录方式，而是让每个渠道接入后都能归一到相同的产品语义：

- 玩家是谁；
- 进度保存在哪里；
- 本地与云端如何合并；
- 广告什么时候可用、失败如何降级；
- 购买如何恢复和验证；
- 渠道不允许的能力如何关闭。

## 3. 平台分层

### 3.0 核心结论

#### 结论一：App 端账号与独立站 H5 账号应统一到同一套自有服务端，但登录入口可以不同

App 与独立站都属于自有渠道，应该共享一套后端身份、云存档、权益和运营数据模型。否则会出现 Android 一套进度、iOS 一套进度、独立站一套进度、付费权益无法恢复、客服无法定位用户的问题。

推荐目标结构：

```text
Fangrush Account Server
  users
  auth_identities
  player_saves
  entitlements
  purchases
  devices / sessions

独立站 H5
  -> Google 登录
  -> Fangrush JWT
  -> /api/save

Android App
  -> Google Play Games / Google 登录 / 未来 Google 身份桥接
  -> Fangrush JWT 或平台身份换自有 token
  -> /api/save 或平台云存档 + 自有同步

iOS App
  -> Apple 登录 / Game Center
  -> Fangrush JWT 或平台身份换自有 token
  -> /api/save 或 GameKit/iCloud + 自有同步
```

这里的“统一”指统一到同一个 `users.id`、同一个 `SaveGame`、同一套权益和同一套服务端 API，不要求所有端都显示同一个“Continue with Google”按钮。

#### 结论二：项目需要维护通用服务端，但应按能力模块拆分，而不是把所有平台强行接到一个实现

自有服务端是 App 主线和独立站长期能力的基础，建议建设。它至少承担：

- 自有用户身份；
- 多 provider 绑定；
- 云存档；
- 本地与云端合并；
- 去广告和皮肤等权益；
- App 购买凭证校验；
- 删除账号和数据导出/删除；
- 最小运营和客服恢复。

但 Poki / CrazyGames 这类 H5 门户不一定直接使用自有登录和自有云存档。它们应通过平台允许的方式接入。通用服务端要能支持“平台身份映射”，但不能假设每个平台包都能显示自有登录。

#### 结论三：Poki / CrazyGames 不应使用我们的外部登录；云存档优先用平台能力，必要时再按平台授权链接自有后端

Poki 官方 External Resources 明确禁止要求邮箱、Google、Facebook 等外部账号登录。Poki SDK 文档同时提供平台账号和 Cloud Gamesaves：用户登录 Poki 后，SDK 可自动把游戏存档同步到云端。

CrazyGames 官方 Requirements 明确账号集成适用时应无外部登录选项，进度绑定 CrazyGames Account，并使用 CrazyGames 用户名和头像。CrazyGames Account Integration 推荐优先用 Data module 保存进度；如果游戏已有自有后端，可以用 User module 把自有后端数据链接到 CrazyGames 账号。

所以准确结论是：

- Poki / CrazyGames 平台包不显示 Fangrush 自有 Google 登录；
- 平台玩家无需注册 Fangrush 账号才能玩；
- 平台内进度优先用平台账号/平台云存档；
- 如未来确实需要跨平台统一，可在平台允许范围内使用平台 token / User module 映射到自有后端；
- 不允许绕过平台政策，让玩家在门户包里输入邮箱或跳 Google 登录。

#### 结论四：公共的是产品数据和能力接口，差异的是身份 provider、云存档 provider、广告 SDK、支付 SDK

公共层：

- `game-core`；
- `SaveGame`；
- 合并规则；
- 奖励和权益模型；
- 账号身份抽象；
- 云存档抽象；
- 广告抽象；
- 支付权益抽象；
- 合规数据定义。

平台差异层：

- 独立站 Google OAuth；
- Android Google Play Games / Google Play Billing / AdMob；
- iOS Apple 登录 / Game Center / StoreKit；
- Poki SDK；
- CrazyGames SDK；
- 各渠道构建、审核、隐私披露和素材。

### 3.1 App 主线

App 是本轮规划主线，面向 Google Play 和 App Store。它需要完整考虑移动壳、原生生命周期、商店合规、广告、IAP、账号、云存档、崩溃监控和版本升级。

推荐技术方向继续沿用现有架构判断：优先使用 Capacitor + 独立移动外壳，最大化复用 React UI 和纯 `game-core`。只有出现明确性能、复杂原生交互或商店能力瓶颈时，再评估 React Native、Flutter 或原生重写。

App 首版可以本地存档上线，但本次需求设计必须把账号和云存档纳入总体方案，因为 App 的去广告、付费皮肤、恢复购买、跨设备恢复和客服处理都会天然要求稳定身份与可恢复进度。

### 3.2 H5 独立站

独立站是自有账号和云存档最合适的 Web 试验场。它可以使用 Google 登录和自有后端存档，并复用 `StartUpSense` 已有 Google OAuth、JWT、Supabase 代码。

独立站应服务两类目标：

- 作为 App 主线账号/云存档能力的 Web 先行版本；
- 作为不依赖 H5 门户政策的自有玩家入口和进度恢复入口。

独立站不应把 H5 平台广告 SDK、平台用户体系或 App 原生支付混入自身主流程。

### 3.3 Poki / CrazyGames

两个 H5 平台应优先按平台政策接入广告、生命周期、静音、暂停、加载事件、分享和平台数据能力。账号与云端策略必须按平台规则处理，不能简单塞入自有 Google 登录。

当前本地合规文档和官方资料显示：

- Poki 支持可选平台账号与 Cloud Gamesaves。用户登录时，Poki SDK 可自动把游戏存档同步到云端；存档需注意体积和本地键边界。
- CrazyGames 明确区分游客和平台登录用户；其 Data 模块可保存登录用户数据并跨设备同步，游客通常落到本地存储；若游戏有自有后端，也应通过平台 User 模块与 CrazyGames 账号集成。CrazyGames 对外部登录有限制，基本不允许在其平台包内直接提供 Google、Facebook、邮箱等外部登录作为主路径。

因此 H5 平台包默认原则应是：

- 不显示自有 Google 登录；
- 不要求注册自有账号才能玩；
- 优先使用平台账号和平台云存档；
- 平台无账号或玩家未登录时保持本地存档；
- 如果后续需要把平台身份映射到自有后端，必须通过平台允许的 User / Data / APS 能力完成。

## 4. 共性能力清单

### 4.0 各端功能矩阵

| 能力 | 独立站 H5 | Android App | iOS App | Poki | CrazyGames | 公共/差异判断 |
|---|---|---|---|---|---|---|
| 核心规则、AI、关卡 | 完整 | 完整 | 完整 | 完整 | 完整 | 公共，来自 `game-core` |
| 本地存档 | 必须 | 必须 | 必须 | 必须 | 必须 | 公共语义，端侧实现不同 |
| 自有账号 | Google 登录 | Google/PGS 映射候选 | Apple/Game Center 映射候选 | 不显示 | 不显示 | 自有渠道可用，门户禁用 |
| 平台账号 | 不适用 | Google Play Games 候选 | Game Center 候选 | Poki User | CrazyGames User | 差异 provider |
| 自有云存档 | 首期候选 | 推荐支持 | 推荐支持 | 默认不直连 | 仅平台允许时链接 | 公共 API，门户谨慎 |
| 平台云存档 | 不适用 | PGS Saved Games 候选 | GameKit/iCloud 候选 | Cloud Gamesaves | Data / APS | 差异 provider |
| 广告 | 默认关闭/后置 | AdMob | AdMob 或 iOS 广告网络 | Poki SDK | CrazyGames SDK | 公共时机，差异 SDK |
| 去广告 | 后置 | IAP 候选 | IAP 候选 | 不做自建 IAP | 不做自建 IAP | App 优先 |
| 付费皮肤 | 后置 | IAP 候选 | IAP 候选 | 不做自建 IAP | 通常受邀/后置 | App 优先 |
| 恢复购买 | 不适用或后置 | 必须 | 必须 | 不适用 | 不适用 | App 差异实现，权益公共 |
| 删除账号/数据 | 必须 | 必须 | 必须 | 平台处理为主 | 平台处理为主 | 自有服务端必须支持 |
| 崩溃监控 | Web 可后置 | 必须 | 必须 | 平台/轻量 | 平台/轻量 | App 优先 |
| 商店/平台合规 | 隐私、Cookie | Google Play | App Store | Poki 规则 | CrazyGames 规则 | 差异文档，事实统一 |

#### 4.0.1 账号统一场景

推荐支持：

```text
同一玩家：
  独立站 Google 登录
  Android App Google Play / Google 登录
  iOS App Apple 登录
  -> 都可绑定到同一个 Fangrush users.id
  -> 共享云存档与去广告/皮肤权益
```

需要特别处理：

- 同一邮箱不能简单等于同一用户，Apple 可能隐藏邮箱，Game Center 和 Google Play Games 也不等同于邮箱账号；
- App 商店购买身份不等于游戏账号身份，必须有 entitlement 同步和恢复购买流程；
- 用户可以先本地游客游玩，再登录，需要合并而不是覆盖；
- 用户可能在不同设备产生不同本地进度，需要明确冲突策略；
- 用户可能登出，登出后仍要本地可玩；
- 用户可能删除账号，服务端存档和身份绑定必须可删除。

#### 4.0.2 H5 平台账号场景

Poki：

```text
游客/未登录 Poki
  -> 本地存档

登录 Poki 用户
  -> Poki Cloud Gamesaves 自动云同步
  -> 不显示 Fangrush Google 登录
```

CrazyGames：

```text
游客 CrazyGames 用户
  -> LocalStorage / 平台本地保存

登录 CrazyGames 用户
  -> Data module / APS 同步到 CrazyGames 账号
  -> 不显示 Fangrush Google 登录

如使用自有后端
  -> 通过 CrazyGames User module 链接平台用户
  -> 不要求玩家输入外部邮箱或 Google 登录
```

平台包里的目标是“在平台生态内稳定保存和恢复”，不是强制把所有门户玩家转成 Fangrush 自有账号。

#### 4.0.3 App 云存档实现选择

App 有两条路线：

**路线 A：自有后端为主**

- Android/iOS/独立站全部读写 `/api/save`；
- 登录 provider 不同，但服务端 `users.id` 统一；
- 跨 Android、iOS、Web 最容易统一；
- 需要长期维护后端、安全、隐私、服务可用性和合规。

**路线 B：平台云存档为主**

- Android 用 Google Play Games Saved Games；
- iOS 用 GameKit/iCloud Saved Games；
- 平台体验原生，跨同生态设备自然；
- Android 与 iOS 之间、App 与独立站之间不天然互通；
- 付费权益和客服恢复仍可能需要自有后端。

**推荐判断：**

如果目标明确包含独立站 H5、Android、iOS 三端进度互通和去广告/皮肤权益恢复，应以自有后端为主，平台云存档作为补充或后置；如果 App 首版只追求商店上线、本地体验和同生态恢复，可以先本地 + 平台云存档，后续再接自有后端。

鉴于本轮需求目标是“不重复工作、统一规划”，建议设计上采用路线 A 的统一服务端模型，同时在架构上保留平台云存档 provider，不把 PGS/GameKit 写死为唯一真相。

### 4.1 统一存档模型

这是所有渠道的基础。现有 `SaveGame` 应继续作为唯一玩家进度模型，不因 App、独立站或 H5 平台拆出多套结构。

应统一覆盖：

- 已通关关卡；
- 已解锁章节；
- 皮肤、棋盘、装备状态；
- 碎片和奖励；
- 任务进度与领取状态；
- 设置；
- 最近关卡与继续游戏状态；
- 未来付费去广告或付费皮肤权利。

需要新增或确认：

- `SaveGame` schema version；
- 本地与云端合并规则；
- 首次登录合并提示；
- 多设备冲突处理；
- 渠道存档大小上限；
- 存档损坏、旧版本迁移和离线写入策略。

### 4.2 账号与身份抽象

不能把“Google 登录”等同于“账号系统”。账号系统应抽象为：

```text
IdentityProvider
  - standalone-google
  - app-google-play
  - app-apple
  - poki-user
  - crazygames-user
  - guest-local
```

不同渠道的登录方式不同，但内部应归一到：

- `userId`；
- `provider`；
- `providerUserId`；
- display name / avatar；
- 是否游客；
- 是否可云同步；
- 是否可购买恢复；
- 是否允许绑定或迁移。

独立站首期可复用 `StartUpSense` 的 Google 登录、JWT 和 Supabase 表结构。App 端要同时考虑 Google Play Games / Google 登录、Apple 登录、商店支付身份和未来自有后端账号之间的关系。H5 平台端不能默认使用独立站 Google 登录。

### 4.3 云存档接口

云存档不是单一实现，而是统一接口下的多种后端：

```text
CloudSaveProvider
  - own-backend: 独立站 / 未来自有 App 后端
  - google-play-games: Android 平台云存档候选
  - apple-gamekit-icloud: iOS 平台云存档候选
  - poki-cloud-gamesaves: Poki 平台云存档
  - crazygames-data-or-aps: CrazyGames 平台云存档
  - unavailable: 本地存档降级
```

主流平台做法说明：

- Google Play Games Services 提供 Saved Games / Snapshots 云存档，强调跨设备恢复、离线读写后同步、冲突解决，单个存档 blob 有大小限制。
- Apple GameKit 可把游戏数据保存到玩家 iCloud 账号，`GKSavedGame` 表示保存的游戏文件，也需要处理冲突和 iCloud 可用性。
- CrazyGames Data 模块面向登录 CrazyGames 用户保存并跨设备同步；未登录时可落本地，登录后按平台机制同步。
- Poki Cloud Gamesaves 对登录用户自动云同步，接入时要遵守平台存档体积和本地键规则。

因此需求设计不能先假设“所有端都打到同一个 `/api/save`”。正确做法是先设计统一存档适配层，再决定每个渠道的 provider。

### 4.4 广告能力抽象

广告应统一产品语义，而不是统一 SDK。

统一能力：

- 是否支持插屏；
- 是否支持激励；
- 是否支持 banner；
- 是否需要平台控制频控；
- 广告开始时暂停输入、AI、声音；
- 广告结束、失败、取消、无填充后的恢复；
- 激励成功后幂等发奖；
- 去广告状态是否生效。

渠道实现：

- App：AdMob 或单一成熟原生广告网络优先；
- Poki：Poki SDK 的 commercialBreak / rewardedBreak；
- CrazyGames：CrazyGames SDK midgame / rewarded；
- 独立站：默认关闭或后置，不混入 H5 门户广告 SDK；
- Admin：Mock 与故障注入。

广告不能出现在首次教学、移动、捕食、连吃、羊 AI 行动中，也不能阻断下一关、重试、基础奖励和存档。

### 4.5 支付与权益

App 主线必须考虑 IAP，但 H5 平台不应默认自建支付。

App 候选权益：

- 去广告；
- 少量高质量皮肤；
- 皮肤包；
- 未来独立挑战包。

禁止：

- 付费削弱羊 AI；
- 付费增加狼能力；
- 付费跳过主线学习；
- 付费购买必胜提示；
- 按付费状态暗中改变难度。

支付系统必须支持：

- Google Play Billing；
- Apple StoreKit；
- 恢复购买；
- 重复回调幂等；
- 退款/撤销后的权益处理；
- 审核沙盒；
- 与云存档或账号权益同步。

CrazyGames IAP 通常受邀或平台化，Poki / CrazyGames 包不应直接复用 App IAP UI。独立站付费可后置，除非未来确定自有支付与合规方案。

### 4.6 合规、隐私和数据安全

只要引入账号、云存档、广告或 IAP，就必须同步规划：

- 隐私政策；
- 数据安全披露；
- 年龄分级；
- 删除账号；
- 删除云存档；
- 广告 SDK 数据披露；
- 支付和交易记录；
- 儿童/未成年人适配边界；
- 平台审核说明；
- 崩溃日志和分析事件的最小化采集。

数据采集原则：只采集支持产品决策、客服恢复、交易校验和合规所需的最小数据。不能为了统计方便扩大个人数据面。

## 5. 优先级建议

### P0：统一模型与渠道边界

必须先完成，否则后续一定重复开发。

- 确认 `SaveGame` 是唯一进度模型；
- 补齐 schema version、迁移和合并规则；
- 定义平台能力接口：账号、云存档、广告、支付、分享、生命周期；
- 定义渠道能力矩阵；
- 明确 `game-core` 不包含浏览器、SDK、账号或支付逻辑；
- H5 平台包默认关闭自有登录和 IAP。

### P1：账号与云存档最小闭环

先以独立站和未来 App 自有后端为目标做最小闭环。

- Google 登录；
- 自有用户表与身份凭据表；
- `/api/auth/*`；
- `/api/save`；
- 本地与云端合并；
- 第二浏览器登录恢复进度；
- 登出后本地仍可玩；
- portal 构建不出现登录入口。

这里可参考 `P-ACCOUNT.md`，但要修正落点：它是独立站先行方案，不应直接套到 Poki / CrazyGames。

### P2：App 壳与商店基础

建立可运行的移动商店版本基础。

- Capacitor 移动壳；
- Android / iOS 构建；
- 原生生命周期；
- 离线与恢复；
- 版本升级与存档迁移；
- 崩溃监控；
- 商店素材、隐私、数据安全、年龄分级；
- Android 与 iOS 真机验收清单。

### P3：App 广告

广告应在 App 壳稳定后接入。

- AdMob 或单一成熟网络；
- 激励广告；
- 低频插屏；
- 失败和无填充降级；
- 广告期间暂停输入、AI、声音；
- 与去广告权益联动；
- 广告后继续率与留存观测。

### P4：App IAP 与权益

- 去广告；
- 付费皮肤或皮肤包；
- 恢复购买；
- 交易校验；
- 权益云同步；
- 审核沙盒；
- 退款处理。

### P5：H5 平台账号与云存档适配

在 H5 平台广告和生命周期 SDK 接入后，再按平台政策决定是否启用平台云存档。

- Poki：评估 Cloud Gamesaves 和账号能力；
- CrazyGames：评估 Data 模块、APS、User 模块；
- 明确存档体积；
- 确保游客可玩；
- 不显示外部登录；
- 必要时把平台身份安全映射到自有后端。

## 6. 不重复开发原则

### 6.0 推荐代码与技术架构

#### 6.0.1 包与应用结构

建议长期结构：

```text
packages/game-core
  规则、AI、关卡、SaveGame、奖励、存档合并纯函数

packages/platform-capabilities
  账号、云存档、广告、支付、生命周期的 TypeScript 接口与通用类型
  不包含具体 SDK 密钥和平台实现

apps/player-web
  独立站 H5
  portal builds: poki / crazygames
  Web 平台适配器

apps/mobile
  Capacitor App 壳
  Android/iOS 原生插件桥接
  App 平台适配器

apps/server 或 services/fangrush-api
  auth
  users
  player_saves
  entitlements
  purchases
  account deletion
  privacy/export

apps/admin
  诊断、配置、验收
```

如果短期不想新增包，也可以先把能力接口放在 `apps/player-web/lib/platform` 附近，但正式进入 App 主线前应抽到共享包，避免 `player-web` 反向成为 App 的隐性依赖。

#### 6.0.2 服务端数据模型

最低建议：

```text
users
  id
  created_at
  deleted_at

auth_identities
  user_id
  provider
  provider_user_id
  provider_email
  display_name
  avatar_url
  unique(provider, provider_user_id)

player_saves
  user_id
  save_json
  schema_version
  updated_at
  device_updated_at

entitlements
  user_id
  entitlement_key
  source
  active
  updated_at

purchases
  user_id
  platform
  product_id
  transaction_id
  original_transaction_id
  status
  raw_receipt_hash
  updated_at
```

后续可加：

- `devices`；
- `save_revisions`；
- `account_links`；
- `privacy_requests`；
- `support_recovery_events`。

#### 6.0.3 能力接口草案

```text
IdentityAdapter
  getCurrentUser()
  login()
  logout()
  getProviderToken()
  canUseExternalLogin

CloudSaveAdapter
  isAvailable()
  load()
  save()
  merge()
  getLimits()

AdAdapter
  isInterstitialAvailable()
  showInterstitial()
  isRewardedAvailable()
  showRewarded()
  onPauseRequired()

PurchaseAdapter
  listProducts()
  purchase()
  restore()
  verify()

LifecycleAdapter
  loadingFinished()
  gameplayStart()
  gameplayStop()
  pause()
  resume()
  muteChanged()
```

所有 UI 只能问能力接口，不直接问 `window.PokiSDK`、`CrazyGames.SDK`、AdMob 或 StoreKit。

#### 6.0.4 存档真相层级

推荐：

```text
未登录：
  local SaveGame 是真相

登录自有账号：
  local SaveGame + cloud SaveGame 合并
  合并后本地与云端都写回
  后续云端为恢复真相，本地为离线缓存

Poki / CrazyGames：
  平台存档能力可用时，平台云为该平台内恢复真相
  自有云只在平台明确允许并完成身份映射后使用

App：
  若自有后端启用，自有云为跨 Android/iOS/Web 真相
  平台云存档可作为同生态备份或后置，不与自有云争夺写入权
```

避免同时无序写多个云端。若同时启用自有云和平台云，需要明确一个 primary，一个 backup/cache。

#### 6.0.5 构建与能力开关

每个渠道构建必须显式声明能力：

```text
standalone:
  externalLogin: true
  ownCloudSave: true
  portalCloudSave: false
  ads: false
  iap: false

android:
  externalLogin: true
  ownCloudSave: true
  platformCloudSave: optional
  ads: admob
  iap: google-play-billing

ios:
  externalLogin: true
  ownCloudSave: true
  platformCloudSave: optional
  ads: admob-or-ios-network
  iap: storekit

poki:
  externalLogin: false
  ownCloudSave: false-by-default
  platformCloudSave: poki
  ads: poki
  iap: false

crazygames:
  externalLogin: false
  ownCloudSave: only-via-user-module-if-approved
  platformCloudSave: crazygames-data-or-aps
  ads: crazygames
  iap: false-by-default
```

这些开关应进入构建配置和运行时能力检测，不能只靠 UI 文案隐藏。

### 必须复用

- `packages/game-core`；
- `SaveGame` 类型和迁移；
- 本地存档读写语义；
- 云存档合并规则；
- 奖励和皮肤权益模型；
- 广告展示时机和奖励幂等原则；
- 平台能力接口；
- 合规材料的事实来源。

### 可以平台单独实现

- Google / Apple / Poki / CrazyGames 身份获取；
- 云存档 provider；
- 广告 SDK adapter；
- IAP adapter；
- 生命周期事件；
- 平台构建脚本；
- 商店素材与审核说明。

### 禁止重复

- 为 App 复制一份规则或 AI；
- 为 H5 平台复制一份 24 关配置；
- 为每个渠道发明一套进度结构；
- 让广告回调直接修改棋局核心状态；
- 在 H5 平台包里硬塞自有 Google 登录；
- 用付费或广告改变胜负条件。

## 7. 初步功能清单

| 模块 | 必做程度 | 首要渠道 | 说明 |
|---|---:|---|---|
| 统一 SaveGame 与合并 | P0 | 全渠道 | 多端复用根基 |
| 平台能力接口 | P0 | 全渠道 | 账号、广告、支付、云存档统一抽象 |
| Google 登录 | P1 | 独立站 / Android候选 | 独立站先行；App 需再结合平台身份 |
| Apple 登录 / Game Center / iCloud候选 | P1/P2 | iOS | App Store 路线必须预留 |
| 自有云存档 API | P1 | 独立站 / App候选 | 可与 `StartUpSense` 复用 |
| Capacitor App 壳 | P2 | App | 商店版本基础 |
| 崩溃监控与版本升级 | P2 | App | 商店运营基础 |
| AdMob 激励/插屏 | P3 | App | 去广告前需有广告 |
| 去广告 IAP | P4 | App | 与广告权益绑定 |
| 付费皮肤 IAP | P4 | App | 不影响胜负 |
| Poki 广告 SDK | H5专项 | Poki | 与另一工具下一批广告经验可复用接口思想 |
| CrazyGames 广告 SDK | H5专项 | CrazyGames | 注意 Basic / Full 差异 |
| Poki 平台云存档 | P5 | Poki | 平台允许后启用 |
| CrazyGames Data / APS | P5 | CrazyGames | 优先平台账号，不外部登录 |

## 8. 待确认问题

1. App 首版是否必须上线自有账号和云存档，还是先完成架构和独立站闭环？
2. Android/iOS 是否要求与独立站完全跨平台同步？如果是，自有后端应作为 primary cloud save。
3. 是否允许玩家在 App 内同时绑定 Google 与 Apple 到同一个 Fangrush 账号？
4. 去广告权益是否必须跨 Android/iOS 共享？如果共享，必须有自有 entitlement 服务。
5. 付费皮肤是否进入首版 App，还是只做去广告一个 IAP？
6. H5 平台云存档是否只在平台内闭环，还是未来要映射回自有后端？
7. Poki / CrazyGames 是否已经获得可用账号、Data、Cloud Save 权限？没有权限时必须本地降级。
8. 独立站是否仍保持无广告，还是未来要加入自有 Web 广告实验？
9. 另一个工具的 H5 广告接入是否要沉淀为共享设计模板，供 Fangrush 复用？

## 9. 推荐决策口径

建议把需求文档整理成三份：

1. **总体规划**：App 主线与多渠道基础能力路线，即本文后续正式版。
2. **账号与云存档详细方案**：从 `P-ACCOUNT.md` 扩展，区分独立站、自有后端、App 平台云存档、H5 平台云存档。
3. **广告与支付详细方案**：区分 App AdMob/IAP、Poki SDK、CrazyGames SDK 和独立站关闭/后置策略。

短期不应直接开写 App 或账号代码。先完成正式需求设计、能力矩阵、存档合并规则和平台政策确认，再拆任务。

## 10. 外部参考

- Google Play Games Services Saved Games：Android 官方说明强调跨设备恢复、离线同步、冲突解决和单存档大小限制。参考：https://developer.android.com/games/pgs/savedgames
- Apple GameKit Saved Games：Apple 官方提供 `GKSavedGame` / iCloud 保存游戏数据能力，需要处理 iCloud 可用性和冲突。参考：https://developer.apple.com/documentation/gamekit/gksavedgame
- Apple Game Center：Apple 官方说明 Game Center 可保存玩家游戏状态，让玩家在 Apple 设备间继续游戏。参考：https://developer.apple.com/game-center/
- Poki SDK Cloud Gamesaves：Poki 官方说明登录用户可自动云同步游戏存档。参考：https://sdk.poki.com/html5
- Poki External Resources：Poki 官方说明不允许收集个人信息的外部账号系统，包括 Google / Facebook 登录。参考：https://sdk.poki.com/external-resources.html
- CrazyGames Requirements：CrazyGames 官方说明账号集成适用时无外部登录选项，进度链接 CrazyGames Account。参考：https://docs.crazygames.com/requirements/intro/
- CrazyGames Account Integration：CrazyGames 官方推荐 Data module；如游戏有自有后端，可用 User module 链接 CrazyGames 账号。参考：https://docs.crazygames.com/requirements/account-integration/
- CrazyGames Data / APS：CrazyGames 官方说明 Data module 和 APS 可保存并同步登录用户进度，游客本地保存。参考：https://docs.crazygames.com/sdk/data/ 与 https://docs.crazygames.com/other/aps/
