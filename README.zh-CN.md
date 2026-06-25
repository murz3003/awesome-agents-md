# awesome-agents-md

> 精选的通用上下文规则集合 —— 按领域与任务组织的 `agents.md` 模式。兼容 Cursor、Claude Code、OpenCode 以及任何支持结构化上下文的智能体框架。

**[English](./README.md)** | 简体中文

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Domains](https://img.shields.io/badge/Domains-11-blue.svg)](#-领域)
[![Rules](https://img.shields.io/badge/Rules-45-green.svg)](#-领域)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.zh-CN.md)

---

## 📖 目录

- [这是什么？](#-这是什么)
- [为什么用 agents.md？](#-为什么用-agentsmd)
- [快速开始](#-快速开始)
- [项目结构](#-项目结构)
- [领域](#-领域)
- [用法](#-用法)
- [路线图](#-路线图)
- [贡献](#-贡献)
- [许可证](#-许可证)

---

## ✨ 这是什么？

**awesome-agents-md** 是一个精心整理、开放的**通用上下文规则**集合，以 `agents.md` 文件的形式编写。每条规则都遵循 [OpenContext](./spec/opencontext.md) 规范 —— 一种与工具无关的格式，用于为 AI 智能体提供一致、高质量的指引。

与其绑定到单一工具的格式（`.cursor/rules/*.mdc`、`CLAUDE.md` 等），本项目将规则保存在**单一事实来源**中，并提供转换器按需生成面向特定工具的文件。

**核心原则：**

- 🌐 **通用** —— 一种格式，到处可用
- 🧩 **模块化** —— 规则按「领域 → 任务」组织
- 🔄 **可转换** —— 从单一来源生成 Cursor、Claude 或 OpenCode 文件
- 📚 **实用** —— 每条规则都遵循一致、经过验证的结构

---

## 🤔 为什么用 agents.md？

每个 AI 编程助手都有自己消费上下文规则的方式：

| 工具 | 原生格式 | 位置 |
|------|----------|------|
| Cursor | `.mdc` 文件 | `.cursor/rules/` |
| Claude Code | `CLAUDE.md` | 项目根目录 |
| OpenCode | `OpenCode.md` + commands | `.opencode/` |

这种碎片化带来了一些问题：

- ❌ 在 3 种以上的格式中维护同一条规则，极易出错
- ❌ 规则在不同工具之间逐渐不同步
- ❌ 切换工具意味着要重写一切

**`agents.md` 解决了这个问题** —— 作为权威来源。你只需编写一次，即可转换到任何目标。

---

## 🚀 快速开始

### 方式 A：直接复制一条规则

浏览 [`rules/`](./rules) 目录，找到你需要的领域与任务，将 Markdown 内容复制到你所用工具的规则文件中。

### 方式 B：构建产物

所有模板目录（`agents-templates/`、`mdc-templates/`、`claude-templates/`、`skills-templates/`）都是**声明式骨架** —— 它们通过正文里自包含的标记拉取 `rules/`，由构建器具象化到 `dist/`。每个标记都声明了*哪条*规则、*怎么用*（内联还是引用）、*放哪里*：

- `{{ INLINE:<规则键>:<段名> }}` —— 把规则某段拼接进正文（自包含）。
- `{{ REF:<路径>:<规则键> }}` —— 把规则复制到 `<路径>`，此处留一个指针（按需读取）。

任意模板类型都可使用这两种模式。

```bash
git clone https://github.com/your-username/awesome-agents-md.git
cd awesome-agents-md
pnpm install

pnpm build            # 构建全部 → dist/
pnpm build:agents     # 项目级 agents.md 脚手架 → dist/agents/<name>/agents.md
pnpm build:mdc        # Cursor .mdc 规则          → dist/cursor/<name>.mdc
pnpm build:claude     # CLAUDE.md 配置            → dist/claude/<name>/CLAUDE.md
pnpm build:skills     # skills                    → dist/skills/<name>/SKILL.md
pnpm build "agents:product-*"                  # 只构建一部分（target:pattern，* 为前缀通配）
```

输出布局：

```
dist/
├── agents/<name>/agents.md            # 可直接放入的 项目上下文
├── cursor/<name>.mdc                  # 放入 .cursor/rules/
├── claude/<name>/CLAUDE.md            # 放入项目根目录
└── skills/<name>/{SKILL.md, references/}   # 可触发的 skill（引用按需复制）
```

一个 skill 通常**内联**其表达基调（`general/communication/*`），**引用**较重的领域知识手册（按需读取）。

每个产物还附带一份 `README.md`（给人看的），记录它是如何组装的。构建架构与标记契约请见 [`tools/converter/README.md`](./tools/converter/README.md)。

---

## 🗂️ 项目结构

```
awesome-agents-md/
├── rules/                       # 事实来源 —— 按领域组织的原子规则（与角色无关的知识/模式）
│   ├── general/                 # 与 AI 智能体协作、以及智能体如何表达自身的元规则
│   │   └── communication/      # 智能体的声音、人格、回复形态（表达基调）
│   ├── software-engineering/
│   ├── data-ai-engineering/
│   ├── product-management/
│   ├── writing/                 # 纯粹的写作技法（清晰、结构、事实核查）
│   ├── writing-subjects/          # 面向特定题材的写作（新闻、技术博客、文案）
│   ├── content-operations/      # 把内容当作一项职能（策略、受众、平台、品牌）
│   ├── hardware-engineering/
│   ├── legal-compliance/
│   ├── learning/
│   └── relationship/
│
├── agents-templates/            # 项目级 agents.md 脚手架（放入项目根目录）
├── mdc-templates/               # Cursor .mdc 规则骨架（扁平的规则文件）
├── claude-templates/            # CLAUDE.md 配置骨架（项目根目录上下文）
├── skills-templates/            # SKILL.md 骨架（角色 + 立场 + SOP）；规则经 inline/ref 标记拉取
├── examples/                    # 真实使用示例
├── spec/                        # OpenContext 规范
├── docs/                        # 文档与使用指南
├── tools/                       # 转换与校验工具
│   └── converter/               # pnpm workspace 包（TypeScript）
│
├── dist/                        # 生成的面向工具的文件（已 gitignore）
├── CONTRIBUTING.md
├── CONTRIBUTING.zh-CN.md
├── README.md
└── README.zh-CN.md
```

---

## 📂 领域

本集合目前覆盖 **11 个领域**、**45 条规则**。每个领域是一个目录；每个任务是一个独立的 `agents.md` 文件。

### `general/` — 元规则 🧠
如何高效地*与* AI 智能体协作，以及智能体*如何表达自己*，适用于所有领域。

| 规则 | 描述 |
|------|------|
| [prompt-structure](./rules/general/prompt-structure.md) | 编写有效的提示词（CLEAR 框架） |
| [task-decomposition](./rules/general/task-decomposition.md) | 将复杂工作拆解为可执行的步骤 |
| [output-validation](./rules/general/output-validation.md) | 校验 AI 生成的输出 |
| [context-management](./rules/general/context-management.md) | 管理上下文窗口与对话流 |

#### `general/communication/` — 智能体表达 💬
*智能体如何说话 —— 声音、人格、回复形态。它们可组合进 skills / agents.md / CLAUDE.md，作为共享的表达基调。*

| 规则 | 描述 |
|------|------|
| [human-voice](./rules/general/communication/human-voice.md) | 像能干的人类那样说话，而非机器腔（去 AI 味） |
| [persona-coherence](./rules/general/communication/persona-coherence.md) | 从持久的立场出发，构建稳定、可信的人格 |
| [reply-discipline](./rules/general/communication/reply-discipline.md) | 先回答问题 —— 以结论为先、切题的回复 |

### `software-engineering/` — 软件工程 💻
| 规则 | 描述 |
|------|------|
| [api-design](./rules/software-engineering/api-design.md) | RESTful API 设计最佳实践 |
| [code-review](./rules/software-engineering/code-review.md) | 建设性的代码评审准则 |
| [testing](./rules/software-engineering/testing.md) | 测试策略（测试金字塔、AAA 模式） |
| [architecture](./rules/software-engineering/architecture.md) | 架构模式与权衡 |
| [git-workflow](./rules/software-engineering/git-workflow.md) | 分支策略与提交规范 |

### `data-ai-engineering/` — 数据与 AI 工程 📊
| 规则 | 描述 |
|------|------|
| [data-pipeline](./rules/data-ai-engineering/data-pipeline.md) | ETL/ELT 管道设计与可靠性 |
| [ml-model-development](./rules/data-ai-engineering/ml-model-development.md) | 端到端 ML 生命周期与 MLOps |
| [data-analysis](./rules/data-ai-engineering/data-analysis.md) | 探索性分析、统计与洞见表达 |
| [prompt-engineering](./rules/data-ai-engineering/prompt-engineering.md) | 设计有效的 LLM 提示词 |

### `writing/` — 写作技法 ✍️
纯粹的、与载体无关的写作技巧 —— 适用于任何主题。
| 规则 | 描述 |
|------|------|
| [clear-and-concise](./rules/writing/clear-and-concise.md) | 删繁就简、主动语态、省略多余的字 |
| [structure-and-flow](./rules/writing/structure-and-flow.md) | 开门见山、段落与句子流畅度 |
| [fact-checking](./rules/writing/fact-checking.md) | 系统化的核查与准确性，适用于任何写作 |

### `writing-subjects/` — 写作题材 📑
将写作技法应用于特定题材与受众。
| 规则 | 描述 |
|------|------|
| [news-writing](./rules/writing-subjects/news-writing.md) | 新闻结构、导语与 AP 体例 |
| [technical-blog](./rules/writing-subjects/technical-blog.md) | 从业者爱看的技术文章 |
| [product-copywriting](./rules/writing-subjects/product-copywriting.md) | 落地页、CTA、以利益为导向的营销文案 |

### `content-operations/` — 内容运营 📣
把内容当作一项职能 —— 策略、受众、平台、品牌（而非写作本身）。
| 规则 | 描述 |
|------|------|
| [content-strategy](./rules/content-operations/content-strategy.md) | 内容规划与平台策略 |
| [audience-engagement](./rules/content-operations/audience-engagement.md) | 建立并经营社区 |
| [platform-optimization](./rules/content-operations/platform-optimization.md) | 理解算法的平台策略 |
| [personal-branding](./rules/content-operations/personal-branding.md) | 真实可信的个人品牌建设 |

### `product-management/` — 产品管理 🎯
| 规则 | 描述 |
|------|------|
| [requirement-writing](./rules/product-management/requirement-writing.md) | 将业务想法转化为以价值驱动、可敏捷交付的需求 |

### `hardware-engineering/` — 硬件工程 🔌
| 规则 | 描述 |
|------|------|
| [circuit-design](./rules/hardware-engineering/circuit-design.md) | 从概念到量产的电路设计 |
| [pcb-layout](./rules/hardware-engineering/pcb-layout.md) | PCB 布局、信号完整性与可制造性设计 |
| [hardware-testing](./rules/hardware-engineering/hardware-testing.md) | 验证、可靠性与合规性 |
| [component-selection](./rules/hardware-engineering/component-selection.md) | 平衡性能、成本与可得性 |

### `legal-compliance/` — 法律与合规 ⚖️
| 规则 | 描述 |
|------|------|
| [contract-review](./rules/legal-compliance/contract-review.md) | 识别风险与危险信号 |
| [data-privacy](./rules/legal-compliance/data-privacy.md) | GDPR、CCPA/CPRA 合规实践 |
| [regulatory-compliance](./rules/legal-compliance/regulatory-compliance.md) | 合规项目框架 |
| [ip-protection](./rules/legal-compliance/ip-protection.md) | 专利、商标、版权与商业秘密 |

### `learning/` — 学习 📚
| 规则 | 描述 |
|------|------|
| [learning-strategy](./rules/learning/learning-strategy.md) | 个性化学习计划与阶段 |
| [note-taking](./rules/learning/note-taking.md) | 康奈尔、卡片盒与数字化方法 |
| [spaced-repetition](./rules/learning/spaced-repetition.md) | 长期记忆保持系统 |
| [reading-comprehension](./rules/learning/reading-comprehension.md) | 主动阅读与 SQ3R 方法 |
| [knowledge-mapping](./rules/learning/knowledge-mapping.md) | 概念图与知识图谱 |

### `relationship/` — 人际关系 ❤️
| 规则 | 描述 |
|------|------|
| [communication](./rules/relationship/communication.md) | 积极倾听与健康的对话 |
| [conflict-resolution](./rules/relationship/conflict-resolution.md) | 建设性地处理分歧 |
| [emotional-intelligence](./rules/relationship/emotional-intelligence.md) | 自我觉察与共情 |
| [family-dynamics](./rules/relationship/family-dynamics.md) | 家庭系统与代际模式 |
| [relationship-maintenance](./rules/relationship/relationship-maintenance.md) | 维系连结的实践 |

---

## 🔧 用法

### 规则结构

每条规则都遵循与 OpenContext 规范兼容的一致格式：

```markdown
# 任务名称

## Role（角色）
[智能体应当扮演谁]

## Instructions（指引）
[核心指导与最佳实践]

## Output（输出）
[预期的输出结构]
```

### 在你的工具中使用一条规则

**Cursor：** 将规则内容复制到 `.cursor/rules/<name>.mdc`
**Claude Code：** 将规则追加到你的 `CLAUDE.md`
**OpenCode：** 以命令文件的形式复制到 `.opencode/`

### 构建模板与 Skills

`tools/converter` 包将权威来源构建为开箱即用的产物：

```bash
pnpm build            # 构建 agents 脚手架 + skills → dist/
pnpm build:agents     # agents-templates → dist/agents/<name>/agents.md
pnpm build:skills     # skills-templates（注入规则）→ dist/skills/<name>/SKILL.md
```

生成的文件落在 `dist/`：

```
dist/
├── agents/<scaffold>/agents.md   # 可直接放入的项目上下文
└── skills/<skill>/{SKILL.md,README.md}   # 可触发的 skill
```

面向特定工具的格式转换（Cursor `.mdc`、Claude `CLAUDE.md`、OpenCode）计划作为额外的构建目标 —— 见[路线图](#-路线图)。

详情请见[使用指南](./docs/usage-guide.md)和 [`tools/converter/README.md`](./tools/converter/README.md)。

---

## 🗺️ 路线图

- [x] 核心领域结构（11 个领域）
- [x] 45 条基础规则
- [x] 一致的 agents.md 格式
- [ ] [OpenContext 规范](./spec/opencontext.md) 文档
- [x] [转换器工具](./tools/converter/)（TypeScript，pnpm workspace）
  - [x] 构建 agents 脚手架 → `dist/agents/<name>/agents.md`
  - [x] 构建 Cursor 规则 → `dist/cursor/<name>.mdc`
  - [x] 构建 CLAUDE.md 配置 → `dist/claude/<name>/CLAUDE.md`
  - [x] 构建 skills → `dist/skills/<name>/`（规则经 inline/ref 标记拉取）
  - [ ] OpenCode 输出
- [x] `agents-templates/` 中的项目脚手架（`minimal.md`、`software-engineering-expert.md`、`product-expert.md`）
- [x] `mdc-templates/` 中的 Cursor 规则骨架
- [x] `claude-templates/` 中的 CLAUDE.md 配置骨架
- [x] `skills-templates/` 中的 Skill 骨架（SKILL.md 格式，规则被引用）
- [ ] 真实使用示例
- [ ] 校验器工具
- [x] [贡献指南](./CONTRIBUTING.zh-CN.md)

---

## 🤝 贡献

欢迎贡献！无论是新增一条规则、一个领域，改进现有内容，还是构建工具，我们都非常欢迎你的帮助。

请见 **[CONTRIBUTING.zh-CN.md](./CONTRIBUTING.zh-CN.md)**，了解以下方面的指引：

- 📝 规则结构与风格约定
- 🆕 提议新领域或任务
- 🔧 构建与测试转换器工具
- ✅ 评审流程

### 简要准则

- 每条规则都是对应领域下的**单个 `.md` 文件**
- 遵循既定的 `## Role` / `## Instructions` / `## Output` 结构
- 使用清晰、实用、可操作的语言
- 在有帮助的地方提供具体示例
- 对于法律/医疗/金融内容，**务必包含免责声明**

---

## 📄 许可证

[MIT](./LICENSE) © awesome-agents-md 贡献者

---

<p align="center">
  <sub>为 AI 智能体社区用心打造。</sub><br>
  <sub>如果这个项目对你有帮助，欢迎点个 Star ⭐！</sub>
</p>
