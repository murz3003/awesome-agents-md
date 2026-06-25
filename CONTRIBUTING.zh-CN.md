# 向 awesome-agents-md 贡献

> 欢迎任何规模的贡献 —— 一处措辞修订、一条新规则、一个新领域、一个新模板，或是转换器工具。本指南会告诉你项目的结构，以及怎样才算一个可合并的改动。

初次到来？建议先浏览 README 中的[项目结构](./README.zh-CN.md#-项目结构)与[领域列表](./README.zh-CN.md#-领域)，了解各部分如何衔接。

**[English](./CONTRIBUTING.md)** | 简体中文 (zh-CN)

---

## 📖 目录

- [总体架构](#-总体架构)
- [前置要求](#-前置要求)
- [可以贡献什么](#-可以贡献什么)
- [编写或修订一条规则](#-编写或修订一条规则)
- [新增领域或任务](#-新增领域或任务)
- [新增模板（agents / mdc / claude / skills）](#-新增模板agents--mdc--claude--skills)
- [使用转换器](#-使用转换器)
- [自检清单](#-自检清单)
- [Pull Request 流程](#-pull-request-流程)
- [评审标准](#-评审标准)
- [风格与语气](#-风格与语气)
- [许可证与署名](#-许可证与署名)

---

## 🧭 总体架构

本项目基于**一个原则**：`rules/` 是唯一事实来源。其余一切都要么*是*规则，要么*拉取*规则。

```
rules/            ← 原子的、与角色无关的知识（规则正文只存在于此）
      │
      ▼  正文标记（{{ INLINE:... }} / {{ REF:... }}）；模板从不自带规则正文
agents-templates/  mdc-templates/  claude-templates/  skills-templates/
      │
      ▼  pnpm build
dist/             ← 生成的产物（已 gitignore；切勿手改）
```

三条推论可以避免绝大多数错误：

1. **规则与角色无关。** 规则教的是*如何把一件事做好*，而不是*做这件事时你是谁*。角色/立场/SOP 属于 skill 模板，不属于规则。
2. **模板从不自带规则正文。** 它们通过正文标记（`{{ INLINE:... }}` / `{{ REF:... }}`）拉取规则。如果你发现自己在把规则正文粘贴进模板，请停下 —— 改用指向。
3. **`dist/` 是生成物。** 切勿手工编辑它；运行构建器即可。

---

## 🔧 前置要求

- [Node.js](https://nodejs.org/) ≥ 20
- [pnpm](https://pnpm.io/) ≥ 10（仓库通过 `packageManager` 锁定了 `pnpm@10.32.1`）
- Git

```bash
git clone https://github.com/<your-fork>/awesome-agents-md.git
cd awesome-agents-md
pnpm install
```

---

## 🙌 可以贡献什么

| 你想要… | 放在哪里 | 阅读本节 |
|---|---|---|
| 修订措辞或改进已有规则 | `rules/<domain>/<task>.md` | [编写或修订一条规则](#-编写或修订一条规则) |
| 在已有领域内新增任务 | `rules/<domain>/` 下新文件 | [新增领域或任务](#-新增领域或任务) |
| 开启一个全新领域 | 新建目录 `rules/<domain>/` | [新增领域或任务](#-新增领域或任务) |
| 交付开箱即用的项目配置 / Cursor 规则 / CLAUDE.md / skill | `*-templates/` | [新增模板](#-新增模板agents--mdc--claude--skills) |
| 改进构建工具 | `tools/converter/` | [使用转换器](#-使用转换器) |
| 修订文档 | `README.md`、本文件 | — |

---

## ✍️ 编写或修订一条规则

### 文件位置与命名

- 位于 `rules/<domain>/<task>.md`。
- 文件名采用 `kebab-case`，一文件一任务。
- 任务名应是**描述活动的动词或名词短语**（`api-design`、`code-review`、`fact-checking`），而非角色或职位。

### 必备结构

每条规则都遵循相同的三段式格式（与 [OpenContext](./spec/opencontext.md) 规范兼容）：

```markdown
# 任务名称

## Role（角色）

<一到两句。针对“本任务”智能体应扮演谁。保持任务专属，
不要写“通用专家”这种泛化表述。>

## Instructions（指引）

<核心指导与最佳实践。用 ### 子标题、项目符号、具体示例。
这是规则的主体。>

## Output（输出）

<智能体应当产出什么，以及什么结构。用编号列表列出预期的输出要素。>
```

### 好的规则应当…

- **原子化** —— 一文件一任务。如果一条规则在做两件不同的事，就拆开。
- **与角色无关** —— 教的是*手艺*，不是*人设*。“如何把代码评审做好”，而不是“你是一位名叫…的资深工程师”。
- **可操作** —— 具体的步骤与检查点，而非抽象原则。“拆分超过约 25 词的句子”胜过“写得简练些”。
- **示例丰富** —— 在能澄清的地方用 ✅/❌ 配对展示。模式参考 [`rules/software-engineering/code-review.md`](./rules/software-engineering/code-review.md)。
- **自包含** —— 读者（或模型）无需外部上下文即可应用。

### 免责声明规则（重要）

对于**法律、医疗或金融**领域，规则**必须**在 `## Instructions` 开头放置清晰的免责声明，说明本内容不构成专业建议，并引导用户咨询合格的专业人士。沿用 [`rules/legal-compliance/contract-review.md`](./rules/legal-compliance/contract-review.md) 的措辞 —— 遵照该模式。这类规则只为辅助理解，绝不给出有约束力的建议。

### 修订已有规则

保持改动外科手术般精准。如果你是在改进清晰度，请保留既有的结构与章节标题 —— 模板可能 `compose` 这些规则，并依赖构建器所做的 `## 标题` 切片（见[转换器](./tools/converter/README.md)）。重命名一个 `## 标题` 可能会悄悄破坏组合，因此先确认是否有引用：

```bash
rg "domain/task-name" *-templates/
```

---

## 🆕 新增领域或任务

### 在已有领域内新增任务

1. 按[规则结构](#-编写或修订一条规则)创建 `rules/<domain>/<new-task>.md`。
2. 在 [`README.md`](./README.md#-domains)（以及 [`README.zh-CN.md`](./README.zh-CN.md#-领域)，若你翻译了描述）的该领域表格中新增一行。
3. 把两个 README 中的徽章规则计数（`Rules-46` → `Rules-47`）以及正文中“46 条规则”的描述同步更新。

### 新增领域

1. 创建目录 `rules/<domain>/`，其中至少包含一条规则。
2. 在两个 README 的 [领域](./README.zh-CN.md#-领域)章节中，新增一个 `### \`<domain>/\` — <标题> <emoji>` 子节，配一行描述与规则表格。
3. 把该目录加入[项目结构](./README.zh-CN.md#-项目结构)树。
4. 同步更新两个 README 中的领域计数（`Domains-11` → `Domains-12`）、徽章，以及“11 个领域”的描述行。
5. 若你的领域有合规含义（法律/健康/金融），对该领域下的每一条规则应用[免责声明规则](#免责声明规则重要)。

> **领域命名：** 使用小写 `kebab-case` 名词短语（`data-ai-engineering`、`content-operations`）。目录名会被模板的 `compose` 键逐字引用，一旦发布就要保持稳定。

---

## 🧩 新增模板（agents / mdc / claude / skills）

模板是拉取规则的**声明式骨架**。按你的目标选择对应产物：

| 模板目录 | 产出 | 典型用法 |
|---|---|---|
| `agents-templates/` | 项目根 `agents.md` | 项目上下文（常内联） |
| `mdc-templates/` | Cursor `.mdc` 规则文件 | Cursor 规则（内联；引用因扁平文件不便） |
| `claude-templates/` | `CLAUDE.md` 配置 | 项目根上下文（常内联） |
| `skills-templates/` | `SKILL.md` + `references/...` | 角色 + 立场 + SOP；表达基调内联、重型手册引用 |

**任意模板都可使用两种模式。** 组合声明在*正文*里，不在 frontmatter。

### 两种标记

```markdown
{{ INLINE:<规则键> }}              把规则整篇正文拼接至此处
{{ INLINE:<规则键>:<段名> }}        只拼接某个 `## <段名>`（如 :Instructions）
{{ REF:<目标路径>:<规则键> }}       把规则复制到 <目标路径>，此处留一个指针
```

- `<规则键>` 是 `rules/` 下的路径，**不带** `.md`（结尾带 `.md` 会被容忍）；可嵌套（`general/communication/human-voice`）。
- REF 中的 `<目标路径>` 相对于产物的输出目录。

### 步骤

1. **复制对应的骨架。** 每个模板目录都有一个 `_*-skeleton.*` 编写指南（如 [`agents-templates/_agents-skeleton.md`](./agents-templates/_agents-skeleton.md)）。以下划线 `_` 开头的文件会被构建器跳过，因此请去掉下划线重命名你的副本。

2. **填写 frontmatter** —— 仅产物元数据（`name`/`description`，mdc 另加 `globs`/`alwaysApply`）。**没有** `compose` 字段。

3. **编写正文**，把 `{{ INLINE:... }}` / `{{ REF:... }}` 标记放在规则内容应当出现的确切位置。
   - skill 的常见形态：**内联**表达基调（`general/communication/*`），**引用**重型领域手册。参见 [`skills-templates/_skill-skeleton.md`](./skills-templates/_skill-skeleton.md)。

4. **切勿把规则正文粘贴进模板。** 若你想粘贴，请改用标记指向它。这是单一来源原则。

5. **构建并校验** —— 见下一节。

关于标记以及构建器剥离/保留哪些内容，详见 [`tools/converter/README.md`](./tools/converter/README.md)。

---

## ⚙️ 使用转换器

构建器（`tools/converter/`，一个 pnpm workspace 风格的 TS 包）把声明式模板转换为 `dist/`。

### 日常命令

```bash
pnpm build            # 构建全部四种目标 → dist/
pnpm build:agents     # agents 脚手架       → dist/agents/<name>/agents.md
pnpm build:mdc        # Cursor .mdc 规则    → dist/cursor/<name>.mdc
pnpm build:claude     # CLAUDE.md 配置      → dist/claude/<name>/CLAUDE.md
pnpm build:skills     # skills              → dist/skills/<name>/SKILL.md
pnpm typecheck        # tsc --noEmit
pnpm clean            # 清空 dist/
```

### 它会替你校验什么

构建器对常见错误会**大声报错**，因此一次绿色的构建就是真正的校验：

- ❌ 某个 `{{ INLINE:... }}` 标记指向不存在（或缺少 `## 段名`）的规则 → 缺失规则错误。
- ❌ 某个 `{{ REF:... }}` 标记指向不存在的规则 → 缺失规则错误。
- ❌ 以 `_` 开头的文件 —— 被静默跳过（它是编写骨架），所以别指望它出现在 `dist/` 里。

### 改动工具本身

- 代码库小而模块化 —— 文件清单见 [Modules 列表](./tools/converter/README.md#modules)（`paths.ts`、`frontmatter.ts`、`rules.ts`、`markers.ts`、`template.ts`、`provenance.ts`、`build/*.ts`）。
- 构建是增量的（`writeIfChanged`），因此重复运行不会搅动未变更输出的修改时间。
- 任何改动后，从干净的 `dist/` 运行 `pnpm typecheck` 与完整的 `pnpm build`（`pnpm clean && pnpm build`）。

---

## ✅ 自检清单

在开 PR 前，逐项核对：

- [ ] `pnpm install` 成功，无 lockfile 漂移。
- [ ] `pnpm typecheck` 通过（若你改动了 `tools/`）。
- [ ] `pnpm clean && pnpm build` 成功，**没有**未解析标记或缺失规则错误。
- [ ] 你的改动所生成的 `dist/` 产物看起来正确（打开相关文件读一遍）。
- [ ] 若新增了**规则**：遵循 `## Role` / `## Instructions` / `## Output` 结构。
- [ ] 若新增了**法律/医疗/金融规则**：带有免责声明块。
- [ ] 若新增了**领域或任务**：两个 README（领域表格、项目结构树，以及领域/规则**计数**）都已更新且一致。
- [ ] 若新增了**模板**：通过 `{{ INLINE:... }}` / `{{ REF:... }}` 正文标记拉取规则，且**不含**任何粘贴的规则正文。
- [ ] 没有对 `dist/` 的手改（它已被 gitignore，但再确认一下别有东西漏进去）。

---

## 🔀 Pull Request 流程

1. **从 `main` 切出**一个有描述性的分支：`feat/rules-api-design`、`fix/copywriting-cta`、`chore/converter-<thing>`。
2. **以聚焦、可评审的单元提交。** 建议的消息风格（仓库已使用 [Conventional Commits](https://www.conventionalcommits.org/)）：

   ```
   feat(rules): add api-versioning task under software-engineering
   docs(readme): bump rule count and add domain row
   ```

3. **尽量一个 PR 只做一件事。** 一条新规则连同其 README 行可以一起走；转换器重构则是单独的 PR。
4. **针对 `main` 开 PR**，填写 PR 模板（改了什么、为什么、如何校验）。关联相关 issue。
5. **以新的提交回应评审意见**（除非被要求，否则不要对已评审的提交强制推送）。

首次贡献者：小的 PR 远比一个大的容易落地。一条格式良好的规则就是很棒的首次贡献。

---

## 🔍 评审标准

评审者会关注：

- **单一来源完整性** —— 没有规则正文被复制进模板；标记使用正确。
- **规则质量** —— 原子化、与角色无关、可操作、示例丰富、遵循章节结构。
- **免责声明合规** —— 每条法律/医疗/金融规则都带声明。
- **文档一致性** —— README 计数与表格与实际文件相符；相关处两种语言都已更新。
- **构建健康** —— `pnpm build` 干净；`dist/` 产物正确。
- **命名与位置** —— kebab-case、领域正确、标识符稳定。

---

## 🎨 风格与语气

- **Markdown：** 句首大写的标题、规则内用 `###` 子节、列举用项目符号。
- **规则的语气：** 直接且实用；偏好具体阈值而非含糊建议（“拆分超过约 25 词的句子”，而非“简练些”）。
- **示例：** 用 `✅`/`❌` 配对让“好 vs 坏”一目了然（见 `code-review.md`）。
- **Emoji：** 仅在文档中作为章节锚点少量使用（与 README 一致），**规则正文内不用**。
- **代码块：** 用语言标签围起（```bash、```yaml、```markdown）。

---

## 📄 许可证与署名

通过贡献，你同意你的贡献按项目的 [MIT 许可证](./LICENSE)授权，且你有权如此授权。本项目 © awesome-agents-md 贡献者（见 `LICENSE`）。

如果你贡献了大量内容并希望署名，欢迎在后续补丁中把自己加入贡献者名单 —— 但署名从来不是贡献的前提。

---

<p align="center">
  <sub>感谢你让 AI 智能体生态更好。🙏</sub>
</p>
