# 四季 24 关设计卡

本目录是一关一文件的平衡台账。每张卡维护以下内容：

- 代码真实配置：开局、岩石、AI、`targetEaten`、`maxPlies` 和预期回合。
- 产品定义：关卡名称、名称含义、设计理念、前台中文文案和玩家体验目标。
- 设计意图：教学点、狼方计划、羊方防守、操作难度和失败后的复盘重点。
- 平衡证据：固定版本、固定种子、多策略结果、终局原因、首次捕食和关键棋谱。
- 验收状态：生产验收通过或待修订；用户试玩反馈作为生产后的独立确认项。

当前卡片中的“目标胜率”如果没有产品或玩家样本支持，统一写为“待定义/未确认”；代码里的 `difficulty` 不是胜率。每次修改 `LEVELS`、规则、AI 或模拟口径，都必须在对应卡片的变更记录中追加原因和验证命令。

卡片索引：

- [spring-01](spring-01.md) · [spring-02](spring-02.md) · [spring-03](spring-03.md) · [spring-04](spring-04.md) · [spring-05](spring-05.md) · [spring-06](spring-06.md)
- [summer-01](summer-01.md) · [summer-02](summer-02.md) · [summer-03](summer-03.md) · [summer-04](summer-04.md) · [summer-05](summer-05.md) · [summer-06](summer-06.md)
- [autumn-01](autumn-01.md) · [autumn-02](autumn-02.md) · [autumn-03](autumn-03.md) · [autumn-04](autumn-04.md) · [autumn-05](autumn-05.md) · [autumn-06](autumn-06.md)
- [winter-01](winter-01.md) · [winter-02](winter-02.md) · [winter-03](winter-03.md) · [winter-04](winter-04.md) · [winter-05](winter-05.md) · [winter-06](winter-06.md)

统一验收命令见 [平衡工作交接](../平衡工作交接-2026-07-17.md)。当前生产验收以配置合法、规则链路回归、固定种子双策略模拟和文档完整为门槛；用户试玩发现问题后，对应关卡退回“待修订”。
