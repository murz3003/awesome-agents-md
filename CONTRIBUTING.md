# Contributing to awesome-agents-md

> Contributions of any size are welcome — a wording fix, a new rule, a new domain, a new template, or converter tooling. This guide tells you exactly how the project is structured and what a mergeable change looks like.

English | **[简体中文](./CONTRIBUTING.zh-CN.md)**

First time here? Skim the [project structure](./README.md#-project-structure) and [domains listing](./README.md#-domains) in the README to see how everything fits together.

---

## 📖 Table of Contents

- [The Big Picture](#-the-big-picture)
- [Prerequisites](#-prerequisites)
- [Ways to Contribute](#-ways-to-contribute)
- [Writing or Editing a Rule](#-writing-or-editing-a-rule)
- [Adding a New Domain or Task](#-adding-a-new-domain-or-task)
- [Adding a Template (agents / mdc / claude / skills)](#-adding-a-template-agents--mdc--claude--skills)
- [Working with the Converter](#-working-with-the-converter)
- [Validation Checklist](#-validation-checklist)
- [Pull Request Process](#-pull-request-process)
- [Review Criteria](#-review-criteria)
- [Style & Tone](#-style--tone)
- [License & Attribution](#-license--attribution)

---

## 🧭 The Big Picture

The project rests on **one principle**: `rules/` is the single source of truth. Everything else either *is* a rule or *pulls in* rules.

```
rules/            ← atomic, role-agnostic knowledge (the ONLY place rule bodies live)
      │
      ▼  body markers ({{ INLINE:... }} / {{ REF:... }}); templates never hold rule bodies of their own
agents-templates/  mdc-templates/  claude-templates/  skills-templates/
      │
      ▼  pnpm build
dist/             ← generated artifacts (gitignored; never hand-edit)
```

Three corollaries that prevent most mistakes:

1. **Rules are role-agnostic.** A rule teaches *how to do a task well*, not *who you are while doing it*. Role/stance/SOP belongs in a skill template, not a rule.
2. **Templates never hold rule bodies of their own.** They pull rules in via body markers (`{{ INLINE:... }}` / `{{ REF:... }}`). If you find yourself pasting a rule body into a template, stop — point at it instead.
3. **`dist/` is generated.** Never edit it by hand; run the builder.

---

## 🔧 Prerequisites

- [Node.js](https://nodejs.org/) ≥ 20
- [pnpm](https://pnpm.io/) ≥ 10 (the repo pins `pnpm@10.32.1` via `packageManager`)
- Git

```bash
git clone https://github.com/<your-fork>/awesome-agents-md.git
cd awesome-agents-md
pnpm install
```

---

## 🙌 Ways to Contribute

| You want to… | Where it goes | Read this section |
|---|---|---|
| Fix wording or improve an existing rule | `rules/<domain>/<task>.md` | [Writing or Editing a Rule](#-writing-or-editing-a-rule) |
| Add a new task within an existing domain | new file in `rules/<domain>/` | [Adding a New Domain or Task](#-adding-a-new-domain-or-task) |
| Start a brand-new domain | new dir `rules/<domain>/` | [Adding a New Domain or Task](#-adding-a-new-domain-or-task) |
| Ship a ready-to-use project profile / Cursor rule / CLAUDE.md / skill | `*-templates/` | [Adding a Template](#-adding-a-template-agents--mdc--claude--skills) |
| Improve the build tooling | `tools/converter/` | [Working with the Converter](#-working-with-the-converter) |
| Fix docs | `README.md`, this file | — |

---

## ✍️ Writing or Editing a Rule

### File location & naming

- Lives at `rules/<domain>/<task>.md`.
- File name is `kebab-case`, one task per file.
- Task names should be **a verb or noun phrase describing the activity** (`api-design`, `code-review`, `fact-checking`), not a role or job title.

### Required structure

Every rule follows the same three-section format (compatible with the [OpenContext](./spec/opencontext.md) spec):

```markdown
# Task Name

## Role

<One or two sentences. Who the agent should act as for THIS task. Keep it
task-specific, not a generic "expert".>

## Instructions

<Core guidance and best practices. Use ### subsections, bullet lists, and
concrete examples. This is the meat of the rule.>

## Output

<What the agent should produce, and in what structure. A numbered list of
expected output elements works well.>
```

### Good rules are…

- **Atomic** — one task per file. If a rule is doing two distinct things, split it.
- **Role-agnostic** — it teaches *the craft*, not *the persona*. "How to review code well", not "You are a senior engineer named…".
- **Actionable** — concrete steps and checkpoints, not abstract principles. "Split sentences over ~25 words" beats "write clearly".
- **Example-rich** — show ✅/❌ pairs where they clarify. See [`rules/software-engineering/code-review.md`](./rules/software-engineering/code-review.md) for the pattern.
- **Self-contained** — a reader (or model) shouldn't need external context to apply it.

### Disclaimer rule (important)

For **legal, medical, or financial** domains, the rule **must** include a clear disclaimer at the top of `## Instructions` stating it is not professional advice and directing users to qualified professionals. See [`rules/legal-compliance/contract-review.md`](./rules/legal-compliance/contract-review.md) for the established wording — follow that pattern. Such rules guide understanding only; they never give binding advice.

### Editing an existing rule

Keep edits surgical. If you're improving clarity, preserve the existing structure and section headings — templates may `compose` these rules and rely on the `## Heading` slicing the builder does (see [the converter](./tools/converter/README.md)). Renaming a `## Heading` can silently break composition, so check whether anything references it first:

```bash
rg "domain/task-name" *-templates/
```

---

## 🆕 Adding a New Domain or Task

### New task in an existing domain

1. Create `rules/<domain>/<new-task>.md` following the [rule structure](#-writing-or-editing-a-rule).
2. Add a row to the domain's table in [`README.md`](./README.md#-domains) (and the matching table in [`README.zh-CN.md`](./README.zh-CN.md) if you translate descriptions).
3. Bump the rule count in the two README badges (`Rules-48` → `Rules-49`) and the "48 rules" prose line in both files.

### New domain

1. Create a directory `rules/<domain>/` with at least one rule inside.
2. Add a `### \`<domain>/\` — <Title> <emoji>` subsection in both READMEs' [Domains](./README.md#-domains) section, with a one-line description and a rule table.
3. Add the directory to the [Project Structure](./README.md#-project-structure) tree.
4. Bump the domain count (`Domains-11` → `Domains-12`) in both READMEs, the badge, and the "11 domains" prose line.
5. If your domain has compliance implications (legal/health/finance), apply the [disclaimer rule](#disclaimer-rule-important) to every rule in it.

> **Naming domains:** use a lowercase `kebab-case` noun phrase (`data-ai-engineering`, `content-operations`). The directory name is referenced verbatim by template `compose` keys, so keep it stable once published.

---

## 🧩 Adding a Template (agents / mdc / claude / skills)

Templates are **declarative skeletons** that pull in rules. Pick the target that matches your goal:

| Template dir | Produces | Typical use |
|---|---|---|
| `agents-templates/` | project-root `agents.md` | project context (often inlined) |
| `mdc-templates/` | Cursor `.mdc` rule files | Cursor rules (inlined; refs are awkward — flat files) |
| `claude-templates/` | `CLAUDE.md` profiles | project-root context (often inlined) |
| `skills-templates/` | `SKILL.md` + `references/...` | role + stance + SOP; voice inlined, heavy playbook referenced |

**Any template can use both modes.** Composition is declared in the *body*, not frontmatter.

### The two markers

```markdown
{{ INLINE:<rule-key> }}              splice a rule's whole body here
{{ INLINE:<rule-key>:<section> }}    splice one `## <section>` body (e.g. :Instructions)
{{ REF:<target-path>:<rule-key> }}   copy the rule to <target-path> and leave a pointer
```

- `<rule-key>` is a path under `rules/` **without** `.md` (a trailing `.md` is tolerated); may nest (`general/communication/natural-expression`).
- `<target-path>` in REF is relative to the artifact's output dir.

### Steps

1. **Copy the right skeleton.** Each template dir has a `_*-skeleton.*` authoring guide (e.g. [`agents-templates/_agents-skeleton.md`](./agents-templates/_agents-skeleton.md)). Files prefixed with `_` are skipped by the builder, so rename your copy without the underscore.

2. **Fill the frontmatter** — product metadata only (`name`/`description`, plus `globs`/`alwaysApply` for mdc). There is **no** `compose` field.

3. **Write the body**, placing `{{ INLINE:... }}` / `{{ REF:... }}` markers exactly where the rule content should land.
   - A common skill shape: **inline** the voice baseline (`general/communication/*`), **reference** the heavy domain playbook. See [`skills-templates/_skill-skeleton.md`](./skills-templates/_skill-skeleton.md).

4. **Never paste a rule body into a template.** If you're tempted, point at it with a marker instead. This is the single-source principle.

5. **Build and verify** — see the next section.

Full details on markers and what the builder strips/keeps are in [`tools/converter/README.md`](./tools/converter/README.md).

---

## ⚙️ Working with the Converter

The builder (`tools/converter/`, a pnpm workspace-style TS package) turns declarative templates into `dist/`.

### Everyday commands

```bash
pnpm build            # build all four targets → dist/
pnpm build:agents     # agents scaffolds       → dist/agents/<name>/agents.md
pnpm build:mdc        # Cursor .mdc rules      → dist/cursor/<name>.mdc
pnpm build:claude     # CLAUDE.md profiles     → dist/claude/<name>/CLAUDE.md
pnpm build:skills     # skills                 → dist/skills/<name>/SKILL.md
pnpm typecheck        # tsc --noEmit
pnpm clean            # wipe dist/
```

### What it validates for you

The builder **fails loudly** on common mistakes, so a green build is real validation:

- ❌ An `{{ INLINE:... }}` marker pointing at a rule (or `## section`) that doesn't exist → missing-rule error.
- ❌ A `{{ REF:... }}` marker pointing at a rule that doesn't exist → missing-rule error.
- ❌ A `_`-prefixed file — silently skipped (it's an authoring skeleton), so don't expect it in `dist/`.

### Modifying the tooling itself

- The codebase is small and modular — see the [Modules list](./tools/converter/README.md#modules) for the file map (`paths.ts`, `frontmatter.ts`, `rules.ts`, `markers.ts`, `template.ts`, `provenance.ts`, `build/*.ts`).
- Builds are incremental (`writeIfChanged`), so re-running won't churn mtimes of unchanged outputs.
- After any change, run `pnpm typecheck` and a full `pnpm build` from a clean `dist/` (`pnpm clean && pnpm build`).

---

## ✅ Validation Checklist

Before opening a PR, run through this:

- [ ] `pnpm install` succeeded with no lockfile drift.
- [ ] `pnpm typecheck` passes (if you touched `tools/`).
- [ ] `pnpm clean && pnpm build` succeeds with **no** unresolved-marker or missing-rule errors.
- [ ] The generated `dist/` output for your change looks right (open the relevant file and read it).
- [ ] If you added a **rule**: it follows the `## Role` / `## Instructions` / `## Output` structure.
- [ ] If you added a **legal/medical/financial rule**: it carries the disclaimer block.
- [ ] If you added a **domain or task**: both READMEs (domains table, project-structure tree, and the domain/rule **counts**) are updated and consistent.
- [ ] If you added a **template**: it pulls in rules via `{{ INLINE:... }}` / `{{ REF:... }}` body markers, and contains **no** pasted rule body.
- [ ] No hand-edits to `dist/` (it's gitignored, but double-check nothing slips in).

---

## 🔀 Pull Request Process

1. **Branch** off `main` with a descriptive name: `feat/rules-api-design`, `fix/copywriting-cta`, `chore/converter-<thing>`.
2. **Commit in focused, reviewable units.** Suggested message style (the repo already uses [Conventional Commits](https://www.conventionalcommits.org/)):

   ```
   feat(rules): add api-versioning task under software-engineering
   docs(readme): bump rule count and add domain row
   ```

3. **One concern per PR** where possible. A new rule + its README row can travel together; a converter refactor is a separate PR.
4. **Open the PR against `main`** and fill in the PR template (what changed, why, how to verify). Link any related issue.
5. **Address review feedback** with new commits (avoid force-pushing over reviewed commits unless asked).

First-time contributors: small PRs are far easier to land than one large one. A single well-formed rule is a great first contribution.

---

## 🔍 Review Criteria

Reviewers will look for:

- **Single-source integrity** — no rule body duplicated into a template; markers used correctly.
- **Rule quality** — atomic, role-agnostic, actionable, example-rich, follows the section structure.
- **Disclaimer compliance** — present on every legal/medical/financial rule.
- **Doc consistency** — README counts and tables match the actual files; both languages updated where relevant.
- **Build health** — `pnpm build` clean; `dist/` output correct.
- **Naming & placement** — kebab-case, correct domain, stable identifiers.

---

## 🎨 Style & Tone

- **Markdown:** sentence-case headings, `###` subsections inside rules, bullet lists for enumerations.
- **Tone in rules:** direct and practical; prefer concrete thresholds over vague advice ("split sentences over ~25 words", not "be concise").
- **Examples:** use `✅`/`❌` pairs to make "good vs. bad" instantly readable (see `code-review.md`).
- **Emojis:** used sparingly as section anchors in docs (matching the README), **not** inside rule bodies.
- **Code blocks:** fence with the language tag (```bash, ```yaml, ```markdown).

---

## 📄 License & Attribution

By contributing, you agree your contributions are licensed under the project's [MIT License](./LICENSE), and that you have the right to license them as such. The project is © awesome-agents-md contributors (see `LICENSE`).

If you contribute a substantial amount of content and would like attribution, you're welcome to add yourself to the contributors list in a follow-up — but attribution is never required to contribute.

---

<p align="center">
  <sub>Thank you for making the AI agent ecosystem better. 🙏</sub>
</p>
