<!--
  SKILL.md skeleton — authoring guide only (the leading-underscore name means the
  builder skips it). Copy this to <your-skill>.md under skills-templates/ to start.

  Reference style: skills do NOT inline rule bodies. Instead, `compose` below declares
  which rules/ are pulled in; the builder copies each rule verbatim into the skill's own
  `references/` directory in dist/. The main SKILL.md references them by relative path.
-->
---
name: <skill-name>
description: <One line: what this skill does, in business value terms>
# compose: declares which rules/ files get copied into the skill's references/ directory.
#           Format: <slot>: [ list of rule paths under rules/ (without .md), in order ]
compose:
  instructions: []      # e.g. [ product-management/requirement-writing ]
  output: []            # e.g. [ general/output-validation ]
---

# <Skill Display Name>

## Description
<2-3 sentences. What problem this skill solves, for whom, and the value it delivers.
This is the pitch that determines whether the skill gets activated — be concrete, not generic.>

## Triggers (Flexible Activation)
Activate this skill when the user's intent matches ANY of:
- Direct commands: `/<skill-name>` or an explicit request to do <this thing>.
- <Scenario pattern 1 — e.g., "I want to add a feature", "help me structure a requirement">
- <Scenario pattern 2>
- Keyword matching: <keyword1>, <keyword2>, <keyword3>

## Stance
<This section is what turns a generic skill into an expert. State the role, audience, and
discipline that distinguish this skill from a plain rule lookup.>

- **Role:** <Who the agent acts as — e.g., "a Product Expert speaking to stakeholders and management".>
- **Audience & Scope:** <Who the output is for, and the hard boundary — e.g., "Why & What only, never technical implementation".>
- **Tone:** <e.g., concise, professional, anti-fluff. Lock the response language via CONFIG below if needed.>
  <!-- CONFIG: response language, e.g. "Simplified Chinese" / "English". Leave blank for no lock. -->

<!-- Push-back clauses are the core discipline of an expert skill. Keep at least one. -->
- **Push back on:** <low-value requests | unverified assumptions | feature bloat — state specifics for this domain.>

## Procedure (SOP)
<The fixed, role-specific workflow this expert follows. This is what belongs in a skill,
NOT in a task rule (task rules hold role-agnostic knowledge; skills hold role-specific flow).
Reference the relevant reference file(s) by name rather than inlining their content.>

1. <Step 1 — e.g., "Diagnose first: audit input against the Instructions reference, output only the gap, wait.">
2. <Step 2 — e.g., "Pick depth by scale (Large vs Small).">
3. <Step 3 — e.g., "Apply First Principles + Pyramid Principle to structure the output.">
4. <Step 4 — e.g., "Dehydrate value: cut every sentence that doesn't serve Should-we / What-to.">

## References
<List each composed rule by its output path under references/, with a one-line note on what
the agent should read it for. The builder copies the rule files named in `compose` into
references/, deduplicating when the same rule feeds multiple slots.>

- `references/<rule-key>.md` — <what this reference provides and when to read it.>
