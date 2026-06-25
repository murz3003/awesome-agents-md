# awesome-agents-md

> Curated collection of universal context rules — `agents.md` patterns organized by domain and task. Compatible with Cursor, Claude Code, OpenCode, and any agent framework supporting structured context.

English | **[简体中文](./README.zh-CN.md)**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Domains](https://img.shields.io/badge/Domains-11-blue.svg)](#domains)
[![Rules](https://img.shields.io/badge/Rules-45-green.svg)](#domains)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

---

## 📖 Table of Contents

- [What is This?](#-what-is-this)
- [Why agents.md?](#-why-agentsmd)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Domains](#-domains)
- [Usage](#-usage)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ What is This?

**awesome-agents-md** is a curated, open collection of **universal context rules** written as `agents.md` files. Each rule follows the [OpenContext](./spec/opencontext.md) specification — a tool-agnostic format for giving AI agents consistent, high-quality guidance.

Rather than locking into a single tool's format (`.cursor/rules/*.mdc`, `CLAUDE.md`, etc.), this project keeps rules in a **single source of truth** and provides converters to emit tool-specific files on demand.

**Key principles:**

- 🌐 **Universal** — One format, works everywhere
- 🧩 **Modular** — Rules organized by domain → task
- 🔄 **Convertible** — Generate Cursor, Claude, or OpenCode files from one source
- 📚 **Practical** — Each rule follows a consistent, proven structure

---

## 🤔 Why agents.md?

Every AI coding assistant has its own way of consuming context rules:

| Tool | Native Format | Location |
|------|--------------|----------|
| Cursor | `.mdc` files | `.cursor/rules/` |
| Claude Code | `CLAUDE.md` | Project root |
| OpenCode | `OpenCode.md` + commands | `.opencode/` |

This fragmentation creates problems:

- ❌ Maintaining the same rule across 3+ formats is error-prone
- ❌ Rules drift out of sync between tools
- ❌ Switching tools means rewriting everything

**`agents.md` solves this** by serving as the canonical source. You author once, convert to any target.

---

## 🚀 Quick Start

### Option A: Copy a rule directly

Browse the [`rules/`](./rules) directory, find the domain and task you need, and copy the markdown content into your tool's rule file.

### Option B: Build artifacts

All template directories (`agents-templates/`, `mdc-templates/`, `claude-templates/`, `skills-templates/`) are **declarative skeletons** — they pull in `rules/` via self-contained body markers, and the builder materializes them into `dist/`. Each marker declares *what* rule, *how* (inline vs reference), and *where*:

- `{{ INLINE:<rule-key>:<section> }}` — splice a rule section into the body (self-contained).
- `{{ REF:<path>:<rule-key> }}` — copy a rule to `<path>` and leave a pointer (loaded on demand).

Any template type can use either mode.

```bash
git clone https://github.com/your-username/awesome-agents-md.git
cd awesome-agents-md
pnpm install

pnpm build            # build everything → dist/
pnpm build:agents     # project agents.md scaffolds → dist/agents/<name>/agents.md
pnpm build:mdc        # Cursor .mdc rules       → dist/cursor/<name>.mdc
pnpm build:claude     # CLAUDE.md profiles      → dist/claude/<name>/CLAUDE.md
pnpm build:skills     # skills                  → dist/skills/<name>/SKILL.md
pnpm build "agents:product-*"                  # build a subset (target:pattern, * = prefix wildcard)
```

Output layout:

```
dist/
├── agents/<name>/agents.md            # drop-in project context
├── cursor/<name>.mdc                  # drop into .cursor/rules/
├── claude/<name>/CLAUDE.md            # drop into project root
└── skills/<name>/{SKILL.md, references/}   # triggerable skill (refs copied on demand)
```

A skill commonly **inlines** its voice baseline (`general/communication/*`) and **references** its heavy domain playbook (read on demand).

Each output also ships a `README.md` (for humans) recording how it was assembled. See [`tools/converter/README.md`](./tools/converter/README.md) for the build architecture and the marker contract.

---

## 🗂️ Project Structure

```
awesome-agents-md/
├── rules/                       # Source of truth — atomic rules (role-agnostic knowledge/patterns) by domain
│   ├── general/                 # Meta-rules for working with AI agents & how an agent expresses itself
│   │   └── communication/      # Agent voice, persona, reply shape (the expression baseline)
│   ├── software-engineering/
│   ├── data-ai-engineering/
│   ├── product-management/
│   ├── writing/                 # Pure writing craft (clarity, structure, fact-checking)
│   ├── writing-subjects/          # Writing for specific subjects (news, tech blog, copy)
│   ├── content-operations/      # Content as a function (strategy, audience, platform, brand)
│   ├── hardware-engineering/
│   ├── legal-compliance/
│   ├── learning/
│   └── relationship/
│
├── agents-templates/            # Project-level agents.md scaffolds (drop into project root)
├── mdc-templates/               # Cursor .mdc rule skeletons (flat rule files)
├── claude-templates/            # CLAUDE.md profile skeletons (project-root context)
├── skills-templates/            # SKILL.md skeletons (role + stance + SOP); rules via inline/ref markers
├── examples/                    # Real-world usage examples
├── spec/                        # OpenContext specification
├── docs/                        # Documentation & usage guide
├── tools/                       # Conversion & validation tooling
│   └── converter/               # pnpm workspace package (TypeScript)
│
├── dist/                        # Generated tool-specific files (gitignored)
├── CONTRIBUTING.md
├── CONTRIBUTING.zh-CN.md
├── README.md
└── README.zh-CN.md
```

---

## 📂 Domains

The collection currently spans **11 domains** with **45 rules**. Each domain is a directory; each task is a standalone `agents.md` file.

### `general/` — Meta-Rules 🧠
How to work *with* AI agents and how an agent *expresses itself*, applicable across all domains.

| Rule | Description |
|------|-------------|
| [prompt-structure](./rules/general/prompt-structure.md) | Crafting effective prompts (CLEAR framework) |
| [task-decomposition](./rules/general/task-decomposition.md) | Breaking complex work into actionable steps |
| [output-validation](./rules/general/output-validation.md) | Verifying AI-generated outputs |
| [context-management](./rules/general/context-management.md) | Managing context windows and conversation flow |

#### `general/communication/` — Agent Communication 💬
*How an agent talks — voice, persona, reply shape. These compose into skills/agents.md/CLAUDE.md as the shared expression baseline.*

| Rule | Description |
|------|-------------|
| [human-voice](./rules/general/communication/human-voice.md) | Sounding like a competent human, not a machine (de-AI tone) |
| [persona-coherence](./rules/general/communication/persona-coherence.md) | Building a stable, believable persona from durable stances |
| [reply-discipline](./rules/general/communication/reply-discipline.md) | Answering the question first — conclusion-led, on-point replies |

### `software-engineering/` — Software Engineering 💻
| Rule | Description |
|------|-------------|
| [api-design](./rules/software-engineering/api-design.md) | RESTful API design best practices |
| [code-review](./rules/software-engineering/code-review.md) | Constructive code review guidelines |
| [testing](./rules/software-engineering/testing.md) | Testing strategy (pyramid, AAA pattern) |
| [architecture](./rules/software-engineering/architecture.md) | Architecture patterns and trade-offs |
| [git-workflow](./rules/software-engineering/git-workflow.md) | Branching strategies and commit conventions |

### `data-ai-engineering/` — Data & AI Engineering 📊
| Rule | Description |
|------|-------------|
| [data-pipeline](./rules/data-ai-engineering/data-pipeline.md) | ETL/ELT pipeline design and reliability |
| [ml-model-development](./rules/data-ai-engineering/ml-model-development.md) | End-to-end ML lifecycle and MLOps |
| [data-analysis](./rules/data-ai-engineering/data-analysis.md) | EDA, statistics, and insight communication |
| [prompt-engineering](./rules/data-ai-engineering/prompt-engineering.md) | Designing effective LLM prompts |

### `writing/` — Writing Craft ✍️
Pure, medium-neutral writing technique — applies to any subject.
| Rule | Description |
|------|-------------|
| [clear-and-concise](./rules/writing/clear-and-concise.md) | Cutting wordiness, active voice, omitting needless words |
| [structure-and-flow](./rules/writing/structure-and-flow.md) | Leading with the point, paragraph and sentence flow |
| [fact-checking](./rules/writing/fact-checking.md) | Systematic verification and accuracy for any written work |

### `writing-subjects/` — Writing Subjects 📑
Writing craft applied to specific subjects and audiences.
| Rule | Description |
|------|-------------|
| [news-writing](./rules/writing-subjects/news-writing.md) | News structure, leads, and AP style |
| [technical-blog](./rules/writing-subjects/technical-blog.md) | Technical posts practitioners want to read |
| [product-copywriting](./rules/writing-subjects/product-copywriting.md) | Landing pages, CTAs, benefit-led marketing copy |

### `content-operations/` — Content Operations 📣
Content as a function — strategy, audience, platform, brand (not writing itself).
| Rule | Description |
|------|-------------|
| [content-strategy](./rules/content-operations/content-strategy.md) | Content planning and platform strategy |
| [audience-engagement](./rules/content-operations/audience-engagement.md) | Building and engaging communities |
| [platform-optimization](./rules/content-operations/platform-optimization.md) | Algorithm-aware platform tactics |
| [personal-branding](./rules/content-operations/personal-branding.md) | Authentic personal brand development |

### `product-management/` — Product Management 🎯
| Rule | Description |
|------|-------------|
| [requirement-writing](./rules/product-management/requirement-writing.md) | Translating business ideas into value-driven, agile-deliverable requirements |

### `hardware-engineering/` — Hardware Engineering 🔌
| Rule | Description |
|------|-------------|
| [circuit-design](./rules/hardware-engineering/circuit-design.md) | Circuit design from concept to production |
| [pcb-layout](./rules/hardware-engineering/pcb-layout.md) | PCB layout, signal integrity, and DFM |
| [hardware-testing](./rules/hardware-engineering/hardware-testing.md) | Validation, reliability, and compliance |
| [component-selection](./rules/hardware-engineering/component-selection.md) | Balancing performance, cost, availability |

### `legal-compliance/` — Legal & Compliance ⚖️
| Rule | Description |
|------|-------------|
| [contract-review](./rules/legal-compliance/contract-review.md) | Identifying risks and red flags |
| [data-privacy](./rules/legal-compliance/data-privacy.md) | GDPR, CCPA/CPRA compliance practices |
| [regulatory-compliance](./rules/legal-compliance/regulatory-compliance.md) | Compliance program frameworks |
| [ip-protection](./rules/legal-compliance/ip-protection.md) | Patents, trademarks, copyrights, trade secrets |

### `learning/` — Learning 📚
| Rule | Description |
|------|-------------|
| [learning-strategy](./rules/learning/learning-strategy.md) | Personalized learning plans and phases |
| [note-taking](./rules/learning/note-taking.md) | Cornell, Zettelkasten, and digital methods |
| [spaced-repetition](./rules/learning/spaced-repetition.md) | Long-term retention systems |
| [reading-comprehension](./rules/learning/reading-comprehension.md) | Active reading and SQ3R method |
| [knowledge-mapping](./rules/learning/knowledge-mapping.md) | Concept maps and knowledge graphs |

### `relationship/` — Relationships ❤️
| Rule | Description |
|------|-------------|
| [communication](./rules/relationship/communication.md) | Active listening and healthy dialogue |
| [conflict-resolution](./rules/relationship/conflict-resolution.md) | Navigating disagreements constructively |
| [emotional-intelligence](./rules/relationship/emotional-intelligence.md) | Self-awareness and empathy |
| [family-dynamics](./rules/relationship/family-dynamics.md) | Family systems and generational patterns |
| [relationship-maintenance](./rules/relationship/relationship-maintenance.md) | Practices that sustain connection |

---

## 🔧 Usage

### Rule Structure

Every rule follows a consistent format compatible with the OpenContext specification:

```markdown
# Task Name

## Role
[Who the agent should act as]

## Instructions
[Core guidance and best practices]

## Output
[Expected output structure]
```

### Using a Rule with Your Tool

**Cursor:** Copy the rule content into `.cursor/rules/<name>.mdc`
**Claude Code:** Append the rule to your `CLAUDE.md`
**OpenCode:** Copy into `.opencode/` as a command file

### Building Templates & Skills

The `tools/converter` package builds canonical sources into ready-to-use artifacts:

```bash
pnpm build            # build agents scaffolds + skills → dist/
pnpm build:agents     # agents-templates → dist/agents/<name>/agents.md
pnpm build:skills     # skills-templates (rules injected) → dist/skills/<name>/SKILL.md
```

Generated files land in `dist/`:

```
dist/
├── agents/<scaffold>/agents.md   # drop-in project context
└── skills/<skill>/{SKILL.md,README.md}   # triggerable skill
```

Tool-specific format conversion (Cursor `.mdc`, Claude `CLAUDE.md`, OpenCode) is planned as additional build targets — see the [Roadmap](#-roadmap).

See the [Usage Guide](./docs/usage-guide.md) and [`tools/converter/README.md`](./tools/converter/README.md) for details.

---

## 🗺️ Roadmap

- [x] Core domain structure (11 domains)
- [x] 45 foundational rules
- [x] Consistent agents.md format
- [ ] [OpenContext specification](./spec/opencontext.md) documentation
- [x] [Converter tool](./tools/converter/) (TypeScript, pnpm workspace)
  - [x] Build agents scaffolds → `dist/agents/<name>/agents.md`
  - [x] Build Cursor rules → `dist/cursor/<name>.mdc`
  - [x] Build CLAUDE.md profiles → `dist/claude/<name>/CLAUDE.md`
  - [x] Build skills → `dist/skills/<name>/` (rules via inline/ref markers)
  - [ ] OpenCode output
- [x] Project scaffolds in `agents-templates/` (`minimal.md`, `software-engineering-expert.md`, `product-expert.md`)
- [x] Cursor rule skeletons in `mdc-templates/`
- [x] CLAUDE.md profile skeletons in `claude-templates/`
- [x] Skill skeletons in `skills-templates/` (SKILL.md format, rule-referenced)
- [ ] Real-world examples
- [ ] Validator tool
- [x] [Contributing guide](./CONTRIBUTING.md)

---

## 🤝 Contributing

Contributions are welcome! Whether it's a new rule, a new domain, improving existing content, or building tooling — we'd love your help.

See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for guidelines on:

- 📝 Rule structure and style conventions
- 🆕 Proposing a new domain or task
- 🔧 Building and testing converter tools
- ✅ Review process

### Quick Guidelines

- Each rule is a **single `.md` file** under the appropriate domain
- Follow the established `## Role` / `## Instructions` / `## Output` structure
- Use clear, practical, actionable language
- Include concrete examples where helpful
- For legal/medical/financial content, **always include a disclaimer**

---

## 📄 License

[MIT](./LICENSE) © awesome-agents-md contributors

---

<p align="center">
  <sub>Built with care for the AI agent community.</sub><br>
  <sub>Star ⭐ this repo if it helps you!</sub>
</p>
