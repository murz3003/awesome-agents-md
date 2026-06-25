# Converter / Builder

Builds the canonical sources (`rules/`, `agents-templates/`, `skills-templates/`) into ready-to-use artifacts under `dist/`.

## Architecture

```
rules/              atomic rule knowledge base (single source of truth)
agents-templates/   project-level agents.md scaffolds ──► dist/agents/<name>/agents.md
skills-templates/   SKILL.md skeletons (role+stance+SOP) ──► dist/skills/<name>/{SKILL.md,README.md}
                          │                                       │
                          └── compose frontmatter declares ─────┘
                              which rules/ sections get injected
```

The three source directories are **independent**:

- `rules/` — role-agnostic knowledge/patterns. Each rule is a standalone `## Role` / `## Instructions` / `## Output` file. Nothing is built from rules alone.
- `agents-templates/` — finished project contexts. Built by **copy + strip** of the `## How to Use` authoring hint. No injection.
- `skills-templates/` — skill skeletons carrying role, stance, and SOP, but with `{{ INJECT <slot> }}` placeholders where rule knowledge goes. The builder resolves these via the `compose` frontmatter.

## Commands

```bash
pnpm install          # one-time
pnpm build            # build agents + skills into dist/
pnpm build:agents     # only agents scaffolds
pnpm build:skills     # only skills
pnpm clean            # remove dist/
pnpm typecheck        # tsc --noEmit
```

## Output Layout

```
dist/
├── agents/
│   ├── minimal/agents.md
│   ├── product-expert/agents.md
│   └── software-engineering-expert/agents.md
└── skills/
    └── product-expert/
        ├── SKILL.md      # triggerable skill, rules injected
        └── README.md     # manifest of composed rules
```

## The `compose` Contract

A skill template declares which rule sections it pulls in, in its YAML frontmatter:

```yaml
---
name: product-expert
description: <one line>
compose:
  instructions:
    - product-management/requirement-writing
  output:
    - product-management/requirement-writing
---
```

- Each key under `compose` is a **slot name** matching a `{{ INJECT <slot> }}` marker in the body.
- Each value is an ordered list of rule keys (path under `rules/`, without `.md`).
- The builder slices each referenced rule by its `## ` heading: slot `instructions` → the rule's `## Instructions` body; slot `output` → its `## Output` body.
- Multiple rules in one slot are concatenated, separated by `---`.
- A slot with a marker but no rules is a build error (surfaces template bugs early).

### Slot → heading map

| Slot          | Rule section injected |
|---------------|-----------------------|
| `instructions`| `## Instructions`     |
| `output`      | `## Output`           |

## Adding a New Skill

1. Copy `skills-templates/_skill-skeleton.md` to `skills-templates/<your-skill>.md`.
2. Fill the frontmatter (`name`, `description`, `compose`) and the Stance / Procedure sections.
3. Keep the `{{ INJECT ... }}` markers; declare their rule sources in `compose`.
4. Run `pnpm build:skills`. The builder fails loudly if a marker is unresolved or a rule is missing.

## Notes

- `_skill-skeleton.md` (leading underscore) is an authoring guide and is skipped by the builder.
- Builds are incremental: files are rewritten only when content changes (`writeIfChanged`).
- The converter currently builds agents.md and skills. Emitting tool-specific formats (Cursor `.mdc`, Claude `CLAUDE.md`, OpenCode) is on the roadmap as additional build targets.
