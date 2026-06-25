# Converter / Builder

Materializes the declarative template sources into ready-to-use artifacts under `dist/`.

## Architecture

```
rules/                atomic rule knowledge base (single source of truth — content)
        │
        ▼  body markers ({{ INLINE:... }} / {{ REF:... }}), declared in the template body
agents-templates/     project agents.md scaffolds   ──► dist/agents/<name>/agents.md
mdc-templates/        Cursor .mdc rule skeletons     ──► dist/cursor/<name>.mdc
claude-templates/     CLAUDE.md profile skeletons    ──► dist/claude/<name>/CLAUDE.md
skills-templates/     SKILL.md skeletons             ──► dist/skills/<name>/{SKILL.md, references/...}
```

**One principle:** every template declares *what* rule content it pulls in, *how* (inline vs reference), and *where* — all in the **template body**, via self-contained markers. There is no `compose` block in the frontmatter. `rules/` stays the single source of truth; templates only point at it.

## The marker contract

Two markers, both whitespace-tolerant, both usable in **any** of the four template types:

```markdown
{{ INLINE:<rule-key> }}              splice a rule's whole body in place
{{ INLINE:<rule-key>:<section> }}    splice one `## <section>` body (e.g. :Instructions)
{{ REF:<target-path>:<rule-key> }}   copy the rule to <target-path> (relative to the
                                      artifact's output dir) and leave a pointer here
```

- `<rule-key>` is a path under `rules/`, **without** the `.md` extension (a trailing `.md` is tolerated). It may nest, e.g. `general/communication/human-voice`.
- `<target-path>` in a REF is relative to the artifact's output directory (e.g. `references/requirement-writing.md`).
- INLINE splices the content directly. REF copies the rule file to its target path and replaces the marker with an inline-code pointer (`` `references/...` ``).
- The same rule can appear in multiple markers (INLINE in several places, REF to several targets, or both). The builder dedupes the *file copies*.
- Unresolved markers (missing rule, missing `## section`, malformed syntax) **fail the build loudly** with the specific marker.

### Why inline vs reference, and when to use each

| Mode | When | Cost |
|---|---|---|
| INLINE | Self-contained artifact; small/shared "voice" content (e.g. the `general/communication/*` expression baseline) you want present in every context | Increases the artifact size; always loaded |
| REF | Large domain knowledge the agent reads on demand (e.g. a full requirement-writing playbook) | Keeps the main file lean; reader pays the cost only when needed |

A common skill shape: **inline** the voice baseline, **reference** the heavy domain playbook.

## Frontmatter

The frontmatter carries only **product metadata**, never rule composition:

```yaml
---
name: <profile-or-skill-name>     # required for agents/claude/skills (output path); optional for mdc
description: <one line>           # also Cursor's rule description
globs: <patterns>                 # mdc only
alwaysApply: false                # mdc only
---
```

`name`, `description`, `globs`, `alwaysApply` are all the builder knows. There is **no** `compose` field. A template with no body markers is a pure hand-written profile.

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

### Building a subset of templates

When the template set grows, build only what you need. A **selector** is `target:pattern`; a
trailing `*` is a prefix wildcard. Selectors are repeatable (comma- or space-separated):

```bash
pnpm build "agents:engineering-*"                 # one target, prefix wildcard
pnpm build "agents:product-expert,minimal"        # comma list within a target
pnpm build "agents:product-*" "skills:product-*"  # multiple targets at once
pnpm build "skills:*"                             # every template of one type
```

Prefer the `build:<target>` shortcut when working in a single type — it pins the target, so
you pass only the pattern (no `target:` prefix):

```bash
pnpm build:agents "engineering-*"
pnpm build:skills product-expert,minimal
pnpm build:agents                                # an entire type (no pattern)
```

`--target <t>` still builds an entire type; no selector at all builds everything. A selector
that matches nothing prints a warning and builds nothing (never an error), so an empty result
is unambiguous.

## What the builder does per artifact

| Target  | Output frontmatter                          | Markers |
|---------|---------------------------------------------|---------|
| agents  | none (pure markdown)                        | INLINE splices in body; REF copies to `<outDir>/<path>` |
| mdc     | description / globs / alwaysApply (Cursor)  | INLINE splices; REF copies to `dist/cursor/<path>` (flat — see note) |
| claude  | none (pure markdown)                        | INLINE splices; REF copies to `<outDir>/<path>` |
| skills  | none (pure markdown)                        | INLINE splices; REF copies to `<outDir>/<path>` |

Each agents/claude/skills output dir also gets a `README.md` that describes the artifact **as a thing in itself** — what it is and how to use it — drawn from the artifact's own description, the way a hand-written README would. It deliberately does not reveal how the artifact was assembled (which rules were inlined vs referenced); from this README's vantage point, the artifact simply *is* what it is. mdc emits a single directory-level `README.md` cataloging the rules present.

### mdc flat-output note

`.mdc` files are flat (`dist/cursor/<name>.mdc`). A REF in an mdc copies the rule to `dist/cursor/<target-path>` — a sibling of the `.mdc`. When dropping these into `.cursor/rules/`, **carry the referenced files alongside the `.mdc`**, or the pointers break. Prefer INLINE for mdc unless the rule is genuinely large.

## Adding a new template

1. Copy the relevant `_*-skeleton.*` from the template directory (it's an authoring guide; the builder skips `_`-prefixed files).
2. Fill the frontmatter (`name`/`description`, plus `globs`/`alwaysApply` for mdc).
3. Write the body, placing `{{ INLINE:... }}` / `{{ REF:... }}` markers exactly where the rule content should land.
4. Run the matching `pnpm build:<target>`. The builder fails loudly on unresolved markers or missing rules.

## Modules

- `paths.ts` — directory constants
- `frontmatter.ts` — minimal YAML frontmatter parser (scalars only)
- `rules.ts` — read a rule's raw body and slice it into `## Heading` sections
- `markers.ts` — the INLINE/REF resolver (core of the compose contract)
- `template.ts` — load templates from a dir (skips `_`-prefixed skeletons, strips leading authoring comments)
- `provenance.ts` — render the human-facing README beside each artifact (self-describing, not assembly-revealing)
- `build/{agents,mdc,claude,skills}.ts` — the four builders
- `index.ts` — CLI

## Notes

- Builds are incremental (`writeIfChanged` — no mtime churn for unchanged outputs).
- `_`-prefixed files in any template dir are authoring skeletons and are skipped.
- No external runtime dependencies — pure Node + TypeScript.
