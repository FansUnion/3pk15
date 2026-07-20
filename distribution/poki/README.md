# Poki 发行入口

> 最近核对：2026-07-19。政策以 [Poki 官方文档](https://sdk.poki.com/) 英文原文为准。
> 逐条状态与证据见 [`compliance.yaml`](./compliance.yaml)，不要在本文维护第二套长清单。

## 当前资料

| 资料 | 用途 |
|------|------|
| [`compliance.yaml`](./compliance.yaml) | AI / 验收：要求 ID、状态、证据、缺口 |
| [`early-access-form.md`](./early-access-form.md) | 准入目的、字段口径、粘贴文案和提交检查 |
| [`assets/`](./assets/README.md) | 静态与动画缩略图候选及源稿 |

## 当前阶段

1. **准入**：按 [早期准入申请](early-access-form.md) 提交 [Request early access](https://developers.poki.com/share)。
2. **理解规则**：执行前核对官方要求，对照 `compliance.yaml` 的 `missing/partial`。
3. **工程接入（T-017）**：真实 SDK、生命周期、广告、16:9 门户包、Inspector。  
4. **素材**：`assets/` 已包含一套静态和动画候选，待用户审美确认；不表示 Web Fit 或全球发布已通过。

## 主要阻塞（来自 compliance.yaml）

- 无真实 Poki SDK / 生命周期 / `commercialBreak` / `rewardedBreak`
- 无平台 16:9 画布与防父页滚动
- 已有独立玩家构建、包体统计和边界审计；仍无可直接上传的静态门户 ZIP
- 静态/动画缩略图已有候选，尚未由用户选定或上传
- 无 Inspector 通过证据
- 独家年限（5 年 / 7 年）待合同与官网核对

## 建议执行顺序

1. 提交 early access（人）  
2. 重新核对官方 Requirements、SDK 和 External Resources
3. 按 `compliance.yaml` 中 `status: missing` 实现并补证据  
4. 产出缩略图与上传包 → Inspector → 提审  

## 官方快链

- [Working With Poki](https://sdk.poki.com/)
- [Requirements](https://sdk.poki.com/new-requirements.html)
- [HTML5 SDK](https://sdk.poki.com/html5.html)
- [External Resources](https://sdk.poki.com/external-resources.html)
- [Poki Inspector](https://sdk.poki.com/poki-inspector.html)
- [Quality Guidelines](https://sdk.poki.com/poki-quality-guidelines.html)
