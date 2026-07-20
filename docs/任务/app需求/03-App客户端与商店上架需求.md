# Fangrush Android / iOS App 客户端与商店上架需求

> 范围：在不增加核心玩法的前提下，把现有玩家产品做成可安装、可离线、可恢复、可审核、可监控和可持续更新的 Android/iOS App。

## 1. 产品定位

App 不是把线上网页放进一个 WebView 地址，而是把经过静态构建的玩家运行时和资源打包进安装包，通过 Capacitor 连接原生生命周期、账号、安全存储、广告、支付和监控。

首版 App 的完整基础体验：

- 安装后无需登录即可离线进入游戏。
- 规则、AI、24 关、奖励和皮肤与 H5 同源。
- 支持本地存档、升级迁移、异常恢复。
- 可选登录，登录后用 Fangrush Cloud 跨设备恢复。
- 正确处理前后台、系统返回、音频焦点、来电/中断和安全区。
- 具备隐私、删除账号、崩溃监控、商店素材和审核说明。
- 广告/IAP 可作为第二发布里程碑接入，不阻塞首个无广告内部测试包。

## 2. 技术路线

### 2.1 客户端结构

```text
packages/game-core
packages/web-shared / platform-capabilities
          |
静态 player bundle
          |
apps/mobile (Capacitor)
  +-- Android native project
  +-- iOS native project
  +-- identity / secure storage / ads / purchase / lifecycle plugins
```

要求：

- App 只引用玩家运行时，不包含 Admin、Next 服务端页面、门户 SDK 或门户素材。
- 账号、存档、广告、购买通过能力接口；React 组件不得直接调用原生 SDK 全局对象。
- 静态资源随 App 打包，核心游戏不依赖首页网络请求才能启动。
- API、隐私页、支持页可以走 HTTPS；网络不可用时给出可恢复状态。
- 原生项目纳入版本控制；签名文件、证书、API 私钥和商店凭证不入 Git。

### 2.2 Capacitor 采用条件

开发正式功能前先完成真机技术样机，以下全部通过才冻结路线：

- 中低端 Android 和当前支持的 iPhone 上启动、棋盘拖/点、动画和音频无明显卡顿。
- 连续游玩、切后台、锁屏和恢复不丢当前对局/存档。
- WebView 内存、应用体积和冷启动在可接受范围。
- 原生登录、Keychain/Keystore、广告和 IAP 至少各完成一个沙盒调用样例。

若只有个别插件不可用，优先写受控原生插件；只有玩家运行时本身出现不可解决的性能/交互问题才评估 React Native、Flutter 或原生重写。

## 3. App 公共功能需求

### APP-COMMON-001 启动与离线

- 冷启动展示正式启动图，不出现白屏、Next 错误页或浏览器地址。
- 首次启动无需网络和账号即可进入核心游戏。
- 资源加载失败有重试和诊断，不无限 loading。
- API 不可用时仅关闭登录/云同步/购买校验等联网能力。

### APP-COMMON-002 生命周期

- 进入后台、失去焦点、系统中断：暂停输入、AI 计时和音频，保存可恢复状态。
- 返回前台：重新确认会话、广告/购买状态和音频焦点，再恢复。
- 生命周期调用幂等，重复事件不重复结算、发奖或写坏存档。
- App 进程被系统终止后，可从最后稳定存档恢复，不依赖内存状态。

### APP-COMMON-003 导航与系统行为

- Android 返回键优先关闭弹窗/返回上层；首页再次返回按平台惯例退出，不出现浏览器历史死循环。
- iOS 不伪造 Android 返回控件；手势和导航符合现有 App 交互。
- 外部隐私/支持链接使用系统浏览器，返回 App 后状态正常。
- 禁止任意 Web 页面导航进入 App WebView；设置 URL allowlist。

### APP-COMMON-004 适配

- 支持商店声明的手机与平板方向和尺寸；若锁定方向，在商店和审核中保持一致。
- 处理刘海、Dynamic Island、状态栏、导航栏、Android edge-to-edge 和键盘安全区。
- 文本、棋盘、按钮和弹窗在最小/最大支持尺寸不重叠、不截断。
- 系统字体放大、减少动态效果、静音和深色系统设置至少不破坏使用。

### APP-COMMON-005 本地存储与升级

- 使用受控本地存储 adapter，不假定 WebView localStorage 永久可靠。
- App 数据升级执行 `SaveGame` schema migration；失败保留旧数据副本并提示恢复。
- 清缓存、卸载、换机的恢复边界向玩家说明；登录用户可从云恢复。
- 当前对局临时状态与长期玩家存档分开，避免半步状态污染长期进度。

### APP-COMMON-006 账号与云

- 按 `02-账号身份与云存档需求.md` 实现游客、登录、合并、离线、冲突、登出和删除。
- 登录 UI 在设置/云存档入口，首局不强制。
- 云同步状态简洁可见：已同步、等待网络、冲突/失败可重试。
- App 凭证进入系统安全存储。

### APP-COMMON-007 版本标识

- 同时记录商店版本、原生 build number、Web bundle revision、`SaveGame` schema 和 API 版本。
- 崩溃、支持导出和审核包都能定位上述版本。
- 服务端可拒绝不兼容旧客户端写入，并返回明确升级要求。

## 4. Android 专项

### 4.1 工程与发行

- 确定长期不变的 application ID、应用名和签名所有权。
- 使用 Google Play 要求的 AAB、目标 API、签名和完整性配置；具体版本按提交时政策核对。
- 配置 Play App Signing，离线备份上传密钥和恢复资料。
- 建内部测试、封闭/开放测试和生产轨道；个人开发者账号若受测试门槛约束，按当期 Play Console 要求执行。
- 构建至少区分 `debug`、`internal`、`production`，测试环境不得请求生产广告或生产购买。

### 4.2 Android 身份

- Google 游戏内登录与 PGS v2 平台认证分层。
- Fangrush 主账号使用服务端可验证的 Google 身份；PGS Player ID 不直接作为跨 Web/iOS 主用户 ID。
- 无 Google Play Services 的设备按发行范围明确支持或不支持，不能无限登录等待。

### 4.3 Android 系统适配

- 处理物理/手势返回、前后台、音频焦点、低内存和进程重建。
- 适配当前 Play 要求的 edge-to-edge、权限和通知边界；首版没有明确通知价值时不请求通知权限。
- 不申请与功能无关的通讯录、位置、相机、麦克风和存储权限。

### 4.4 Play Console 工作

- 应用类别、游戏声明、目标受众、内容分级、广告声明。
- Data safety 与隐私政策，覆盖 Google 登录、云存档、广告、分析、崩溃和购买 SDK。
- 若可建账号：App 内删除入口 + 可公开访问的 Web 删除入口。
- 商店描述、图标、Feature Graphic、手机/平板截图、支持邮箱、隐私和支持 URL。
- IAP 商品、许可证测试员、测试账号和审核说明。

## 5. iOS 专项

### 5.1 工程与发行

- 确定长期不变的 bundle ID、团队、证书、profiles 和 App Store Connect 所有权。
- 建开发、TestFlight、生产配置；build number 单调递增。
- 配置支持的 iPhone/iPad、方向、设备能力和最低系统版本；以所用 Capacitor 稳定版要求为基线。
- 归档、符号文件和 source map 有受控上传与保留流程。

### 5.2 Apple 身份与账号

- 提供 Sign in with Apple；若提供 Google 社交登录，Apple 登录保持等价可见。
- 支持 Apple token 撤销、账号删除和隐藏邮箱场景。
- Game Center 是平台游戏身份，可后置用于成就/排行/平台资料，不代替 Fangrush 主账号。

### 5.3 iOS 系统适配

- 处理 active/inactive/background、音频中断、锁屏、内存警告和 WebView 进程恢复。
- 正确处理 safe area、状态栏、Home Indicator 和 iPad 多尺寸。
- 若请求 ATT，先在上下文中解释用途；用户拒绝后仍可继续游戏和非跟踪路径。
- 核对所有第三方 SDK 的 privacy manifest、required reason API 和签名要求。

### 5.4 App Store Connect 工作

- App Privacy 披露必须覆盖开发者和第三方 SDK 实际收集的数据。
- 完成年龄分级、广告/IAP 声明、内容权利、出口合规和审核联系信息。
- 有账号时在 App 内提供删除入口。
- 提供完整审核路径、测试账号或可用游客模式；后台服务在审核期保持可用。
- IAP 商品随首次使用版本提交审核，审核说明指出入口、商品效果和恢复购买。
- 图标、iPhone/iPad 截图、预览、描述、副标题、关键词、支持 URL、隐私 URL 完整。

## 6. App 广告需求

### 6.1 方案

首版推荐 AdMob 单一网络；不在第一版引入 mediation 和多家竞价。广告通过原生 SDK/插件展示，不在 WebView 加载 H5 广告代码。

### 6.2 广告形式与位置

| 形式 | 首版 | 允许位置 | 禁止位置 |
|---|---|---|---|
| 激励广告 | 是 | 玩家主动点击碎片补充等明确奖励入口 | 自动弹出、基础奖励必经、未完成广告也发奖 |
| 插屏 | 低频试验 | 完整对局结束并进入稳定结算后 | 首次教学、首局、棋子移动/捕食/AI、中途暂停、连续失败 |
| Banner | 否 | 后续有真实布局和收益数据再评估 | 棋盘、操作区、遮挡内容 |

### 6.3 生命周期与幂等

- 广告真正开始时暂停输入、AI、音频；结束、失败、取消、无填充都恢复。
- 激励只在 SDK 明确完成回调后授予，使用一次性 `rewardGrantId` 防重复。
- 页面卸载、后台切换、重复回调、超时不能重复授予或卡死 UI。
- 广告不可用时隐藏入口或返回普通路径，不能阻断下一关。
- 使用官方测试广告 ID 和测试设备；生产包禁止调试面板和固定成功 Mock。

### 6.4 隐私

- 启动时更新 UMP 同意状态，只有 `canRequestAds` 后才请求广告。
- 设置中按要求提供隐私选项入口。
- iOS ATT 与广告同意是不同层次，分别按实际 SDK 行为处理。
- 儿童/未达同意年龄、内容分级和最大广告内容评级按目标受众决定；不得默认猜测。

## 7. IAP 与权益需求

### 7.1 首版商品

- 非消耗型去广告。
- 少量不影响胜负的皮肤或皮肤包，可后于去广告上线。
- 不做订阅、付费跳关、战力、必胜提示和可购买主线货币。

### 7.2 购买流程

```text
客户端拉取商店商品
  -> 用户确认购买
  -> 商店返回交易
  -> 服务端向 Google/Apple 校验
  -> purchases 幂等落库
  -> entitlements 生效
  -> 客户端刷新权益并完成交易
```

要求：

- Android 使用 Google Play Billing；iOS 使用 StoreKit。
- `transactionId/originalTransactionId` 唯一，重复回调幂等。
- 支持 pending、cancelled、failed、refunded/revoked 状态。
- 有“恢复购买”入口；同商店账号恢复不依赖玩家记住 Fangrush 密码。
- 服务端周期校验或接收商店服务端通知，处理退款/撤销。
- 去广告只关闭强制/插屏广告；是否保留玩家主动激励入口必须在商品说明中写清楚。推荐去广告后仍可自愿使用激励入口，但文案不得误导。

### 7.3 跨端权益

- 商店是交易真相，Fangrush `entitlements` 是已验证权益的跨自有渠道投影。
- 未登录购买也必须能通过原商店“恢复购买”恢复。
- 登录后可把已验证权益绑定 Fangrush 用户；是否跨 Android/iOS 共享，在发布前再次核对两家当期政策并在商品说明中保持一致。
- 不把购买标记写进可被客户端任意修改的 `SaveGame`。

## 8. 监控与最小分析

### 8.1 崩溃与错误

- 捕获 Android/iOS 原生崩溃、ANR/卡顿线索和 WebView JavaScript 未处理错误。
- 报告包含 app/build/web revision、设备/系统、最近页面和脱敏 breadcrumbs。
- source map 和符号文件私有上传，不随公开包暴露。
- 登录、存档、广告、购买失败使用结构化错误码，不能只写自由文本。

### 8.2 产品事件

最小事件：首次可玩、关卡开始/结束、重试、章节完成、会话、登录结果、云同步结果、广告请求/展示/完成、购买结果、版本迁移结果。

事件不记录完整棋局、token、email、购买凭证或完整存档。事件名和字段在 Android/iOS 保持一致。

## 9. 合规与支持页面

上线前必须有：

- 隐私政策。
- 服务条款或最小使用条款。
- 支持/联系页面。
- 账号删除 Web 页面和 App 内入口。
- 数据导出/删除的处理流程与响应记录。
- 第三方 SDK 清单、数据用途和版本负责人。
- 商店 Data safety / App Privacy 与实际行为对账表。
- 面向审核员的账号、广告、IAP、离线和云同步说明。

这些页面必须公开、HTTPS、长期可访问，不能只是仓库 Markdown。

## 10. 商店素材与运营准备

| 类别 | Android | iOS |
|---|---|---|
| 品牌 | 高分辨率图标、Feature Graphic | App Icon 全套 |
| 截图 | 手机；如声明平板则含平板 | 所有要求的设备族截图 |
| 视频 | 可选，必须真实玩法 | 可选 App Preview，遵守格式 |
| 文案 | 名称、短/长描述 | 名称、副标题、描述、关键词 |
| URL | 隐私、支持、删除账号 | 隐私、支持、营销可选 |
| 审核 | 测试账号、IAP/广告说明 | 测试账号、Review Notes、IAP 入口 |
| 本地化 | 首版 en/zh，版面可扩展 | 首版 en/zh，版面可扩展 |

素材只展示真实游戏和真实功能，不伪造多人、排行榜、更多关卡或不存在的 App 特性。

## 11. 测试矩阵

### 11.1 必测环境

- Android：至少一台较低性能设备、一台主流设备、一台大屏/平板或模拟器。
- iOS：至少一台较旧支持机型、一台当前主流机型；声明 iPad 时真机或等价验证。
- Wi-Fi、移动网络、弱网、断网、网络切换。
- 新装、覆盖升级、后台长时间、进程被杀、卸载重装后登录恢复。

### 11.2 必测场景

1. 24 关基础旅程与 H5 结果一致。
2. 启动、暂停、锁屏、来电/音频中断、恢复。
3. 本地存档、schema 升级、损坏恢复、云冲突。
4. 登录取消、token 过期、服务端 4xx/5xx、账号删除。
5. 广告成功、取消、失败、无填充、冷却、后台切换和重复回调。
6. 购买成功、取消、pending、重复、恢复、退款/撤销和审核沙盒。
7. 隐私同意接受/拒绝/重新打开，iOS ATT 各状态。
8. 安全区、字体、语言、旋转/锁定方向和系统返回。
9. 生产包审计：无测试广告、Mock 支付、调试菜单、私钥、Admin 或门户 SDK。

## 12. 发布里程碑

| 里程碑 | 交付 | 放行条件 |
|---|---|---|
| M0 技术样机 | 静态玩家包 + Android/iOS 壳 + 生命周期样例 | 真机性能和恢复通过 |
| M1 基础内测 | 游客、离线、本地存档、错误监控 | 24 关与升级回归通过 |
| M2 账号云存档 | Android Google、iOS Apple、Fangrush Cloud | 跨浏览器/双 App 恢复通过 |
| M3 商店候选 | 合规页面、素材、签名、内测轨道 | Play 内测 + TestFlight 通过 |
| M4 商业化候选 | AdMob、UMP/ATT、去广告 IAP、恢复购买 | 广告/购买全故障矩阵通过 |
| M5 生产发布 | 分阶段放量、监控和回滚方案 | 无阻断缺陷，商店审核通过 |

Android 可先于 iOS 发布，但公共账号、存档和权益契约不得为 Android 写死。

## 13. App 完成定义

- 两个平台都由同一代码基线构建，核心规则测试与 H5 一致。
- 真机离线可完成游戏；升级、杀进程和后台恢复不丢稳定进度。
- 登录云同步、删除账号、广告、IAP 和监控按启用范围全部有证据。
- 商店披露与 SDK 实际行为一致，素材和审核说明完整。
- 可通过配置关闭账号、广告或购买并安全降级，不需要修改 `game-core`。
- 有版本回滚/暂停发布方案，但任何回滚都不允许把云存档 schema 降级覆盖。

## 14. 官方资料入口

- [Capacitor Android](https://capacitorjs.com/docs/android)、[Capacitor iOS](https://capacitorjs.com/docs/ios)
- [Google Play Games Services](https://developer.android.com/games/pgs/start)
- [Google Play Billing](https://developer.android.com/google/play/billing)
- [Google Play Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Google Play 账号删除](https://support.google.com/googleplay/android-developer/answer/13327111)
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Apple App Privacy](https://developer.apple.com/app-store/app-privacy-details/)
- [Apple 账号删除](https://developer.apple.com/support/offering-account-deletion-in-your-app)
- [StoreKit](https://developer.apple.com/storekit/)
- [Game Center](https://developer.apple.com/game-center/)
- [AdMob Android Privacy](https://developers.google.com/admob/android/privacy)
- [AdMob iOS Privacy](https://developers.google.com/admob/ios/privacy)
- [AdMob iOS IDFA/ATT](https://developers.google.com/admob/ios/privacy/idfa)

