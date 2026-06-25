# Converter / Builder

Materializes the declarative template sources into ready-to-use artifacts under `dist/`.

## Architecture

```
rules/                atomic rule knowledge base (single source of truth — content)
        │
        ▼  compose (declarative reference)
agents-templates/     project agents.md scaffolds   ──► dist/agents/<name>/agents.md      (inlined)
mdc-templates/        Cursor .mdc rule skeletons     ──► dist/cursor/<name>.mdc            (inlined)
claude-templates/     CLAUDE.md profile skeletons    ──► dist/claude/<name>/CLAUDE.md      (inlined)
skills-templates/     SKILL.md skeletons             ──► dist/skills/<name>/{SKILL.md,references/}  (referenced)
```

**One principle, two product modes:**

- **Source = declarative.** No template inlines rule bodies. Each template's `compose` frontmatter declares which `rules/` it pulls in. `rules/` stays the single source of truth.
- **Product = two modes.** `agents` / `mdc` / `claude` produce **self-contained** files (rule bodies spliced in where `{{ INJECT <slot> }}` appears). `skills` produce a **referenced** bundle (rules copied into a sibling `references/` dir, the main file points at them).

## The `compose` contract

Every template carries YAML frontmatter:

```yaml
---
name: product-expert                  # output name (dir/file stem); optional for mdc
description: <one line>               # also used as Cursor's rule description
compose:
  instructions:                       # slot name → ordered list of rule keys
    - product-management/requirement-writing
  output:
    - product-management/requirement-writing
---
```

- `compose` keys are **slot names**. For inline products, a slot matches a `{{ INJECT <slot> }}` marker in the body; the builder splices in each rule's `## <Slot-Heading>` body (slot `instructions` → `## Instructions`, slot `output` → `## Output`). For referenced products, slots only determine *which* rules get copied to `references/`.
- Rule keys are paths under `rules/` without the `.md` (e.g. `software-engineering/testing`).
- For skills, rules are flattened to `references/<basename>.md` and deduplicated across slots.

## Commands

```bash
pnpm install          # one-time
pnpm build            # build all four targets → dist/
pnpm build:agents     # agents scaffolds
pnpm build:mdc        # Cursor .mdc rules
pnpm build:claude     # CLAUDE.md profiles
pnpm build:skills     # skills
pnpm clean            # remove dist/
pnpm typecheck        # tsc --noEmit
```

## What the builder strips / keeps

Frontmatter is **build metadata** — it never leaks into model-facing artifacts:

| Target  | Output frontmatter              | Rule bodies |
|---------|---------------------------------|-------------|
| agents  | none (pure markdown)            | inlined     |
| mdc     | description / globs / alwaysApply (Cursor) | inlined |
| claude  | none (pure markdown)            | inlined     |
| skills  | none (pure markdown)            | copied to references/ |

Each output dir also gets a `README.md` (for humans) recording the source template and composed rules — not consumed by any model.

## Adding a new template

1. Copy the relevant `_*-skeleton.*` from the template directory.
2. Fill the frontmatter (`compose` especially) and the body.
3. For inline products, keep the `{{ INJECT ... }}` markers; declare their rule sources in `compose`.
4. Run the matching `pnpm build:<target>`. The builder fails loudly on unresolved markers or missing rules.

## Modules

- `paths.ts` — directory constants, INJECT pattern
- `frontmatter.ts` — YAML frontmatter parser + `composedRuleKeys`
- `rules.ts` — read a rule and slice it into `## Heading` sections
- `inject.ts` — inline `{{ INJECT <slot> }}` resolution (for agents/mdc/claude)
- `template.ts` — load templates from a dir (skips `_`-prefixed skeletons, strips leading authoring comments)
- `provenance.ts` — render the human-facing README beside each artifact
- `build/{agents,mdc,claude,skills}.ts` — the four builders
- `index.ts` — CLI

## Notes

- Builds are incremental (`writeIfChanged` — no mtime churn for unchanged outputs).
- `_`-prefixed files in any template dir are authoring skeletons and are skipped.
