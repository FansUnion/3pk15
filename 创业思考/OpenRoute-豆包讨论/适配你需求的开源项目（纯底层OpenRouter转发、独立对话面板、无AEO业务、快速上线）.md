# 适配你需求的开源项目（纯底层OpenRouter转发、独立对话面板、无AEO业务、快速上线）

分两大类：**1\. 带前端聊天界面（开箱即用，你优先选）**、**2\. 纯后端网关（只做密钥转发，无 UI）**
全部原生支持 OpenRouter（OpenAI 兼容接口）、BYOK 用户自有 Key、Next\.js/Vercel 一键部署 / Docker 部署，无多余跨境 AEO、检测功能。

## 一、带完整聊天前端面板（最贴合你的需求，直接上线）

### 1\. Vercel 官方 Chatbot（首选，Next\.js\+AI SDK，极简干净）

仓库：vercel/chatbot

- 技术栈：Next\.js 15 App Router、shadcn/ui、Vercel AI SDK

- 核心适配点：

    1. 原生兼容所有 OpenAI 协议接口，直接填入 OpenRouter base\_url：`https://openrouter.ai/api/v1`

    2. 支持用户输入自有 OpenRouter Key（BYOK），后端中转转发，密钥不上传前端明文

    3. 纯对话功能：流式聊天、对话历史、模型切换、参数调节（温度 / Max Token），**无任何 AEO / 文案检测冗余功能**

    4. Vercel 一键部署，5 分钟上线；支持 PostgreSQL 存储聊天记录

- 适合：只想做极简 AI 对话操作台，轻量化、代码干净，二次开发成本极低

### 2\. HiveChat（国内星标最高，完整多模型聚合面板）

仓库：HiveChat/hive\-chat

- 技术栈：Next\.js \+ Prisma \+ Docker

- 核心适配点：

    1. 内置「自定义 OpenAI 兼容服务商」，直接新增 OpenRouter 渠道，批量拉取 OpenRouter 全量模型列表

    2. 双模式：管理员后台填全局 OpenRouter 密钥；普通用户可填入自己的 OpenRouter sk\-or 密钥（BYOK）

    3. 完整聊天 UI：多对话窗口、多模型并行对比、提示词模板、用量统计

    4. Docker 一键启动，也支持 Vercel 部署；无电商、无 AEO、无外链检测功能，纯粹模型对话工具

- 优势：成品完成度极高，后台管理、用户权限、用量统计全部写好，拿来就能运营

### 3\. Nexior（轻量化独立 SaaS 面板，纯 AI 工具）

仓库：AceDataCloud/Nexior

- 特点：独立站点，仅聊天 \+ 文生图，无垂直行业绑定；支持接入 OpenRouter 作为上游服务商，用户自带 Key；自带简易会员额度系统，适合你做独立收费平台。

## 二、纯后端网关（只做 API 密钥转发，无前端聊天页面）

如果你只想做底层中转服务，前端自己写 / 套上面的聊天面板，选这几个：

### 1\. LiteLLM（行业标准开源 LLM 网关）

仓库：BerriAI/litellm

- 核心：统一兼容 OpenRouter、OpenAI、Claude 等所有服务商，一行配置接入 OpenRouter 上游；支持用户 BYOK、用量日志、限流、密钥加密转发。

- 定位：纯后端 API 网关，**无前端界面**，需要搭配上面的聊天面板使用。

### 2\. GoModel（Go 语言高性能网关，Docker 秒启）

仓库：everydev\-ai/gomodel

- 原生支持 OpenRouter 作为上游渠道，统一 OpenAI 协议转发，自带请求日志、缓存、故障自动切换；轻量无依赖，适合服务器独立部署。

### 3\. FreeLLMAPI（Node\.js 轻量代理网关）

仓库：justjavac/FreeLLMAPI

- 专门聚合各类 LLM 接口，内置 OpenRouter 接入配置；对外暴露统一`/v1/chat/completions`端点，加密存储用户 OpenRouter 密钥，支持用量统计。

## 三、最优落地组合方案（推荐你直接这么搭）

### 方案 A（最快上线，零额外开发）

Vercel Chatbot 前端面板 \+ 内置 AI SDK 直接对接 OpenRouter

1. Fork 官方仓库，修改模型配置文件，新增 OpenRouter 服务商

2. 开启 BYOK 功能，用户在页面输入自己的 OpenRouter sk\-or 密钥

3. Vercel 一键部署，10 分钟完成可访问网站

4. 仅保留对话、模型选择、参数调节，删除不需要的多媒体功能

### 方案 B（商用完整版，带用户管理 / 额度）

HiveChat 完整项目 Docker 部署

1. Docker 拉取镜像启动，后台新增 OpenRouter 接口渠道

2. 开启「用户自带 API 密钥」功能，支持个人 OpenRouter Key 登录使用

3. 自带管理员后台查看全部用户调用记录、限流风控，直接商用

## 四、关键筛选标准（避开带 AEO / 跨境业务的项目）

1. 不选包含独立站、SEO、AEO、页面检测、文案复测功能的项目

2. 优先 Next\.js 架构、Vercel 一键部署，适配海外用户访问

3. 必须支持两个核心能力：

    - 接入 OpenRouter base\_url 做上游转发

    - BYOK（用户自行填入 OpenRouter 密钥，平台不垫资 token 成本）

4. 基础功能：流式对话、多模型切换、对话历史、参数调节（温度、上下文长度）

> （注：部分内容可能由 AI 生成）
