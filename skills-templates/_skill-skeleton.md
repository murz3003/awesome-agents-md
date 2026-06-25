<!--
  SKILL.md skeleton — DO NOT use directly.
  This file is a template. A build step (converter) reads `compose` below, pulls the
  referenced rule bodies from `rules/`, and injects them into the designated slots to
  produce a complete, triggerable skill.

  How to author a new skill template:
    1. Copy this file to <your-skill>.md under skills-templates/.
    2. Fill the YAML frontmatter (name, description, triggers, compose).
    3. Fill the Stance section (role, audience, tone) — this is what makes it an expert.
    4. Leave the {{ INJECT ... }} placeholders intact; the builder replaces them.
    5. Do NOT inline rule content here — reference it in `compose` to preserve single source of truth.
-->
---
name: <skill-name>
description: <One line: what this skill does, in business value terms>
# compose: declares which rules/ content gets injected, and into which slot.
# Format: <slot-name>: [ list of rule paths under rules/ (without .md), in injection order ]
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
NOT in a task rule (task rules hold role-agnostic knowledge; skills hold role-specific flow).>

1. <Step 1 — e.g., "Diagnose first: audit input against the template, output only the gap, wait.">
2. <Step 2 — e.g., "Pick depth by scale (Large vs Small).">
3. <Step 3 — e.g., "Apply First Principles + Pyramid Principle to structure the output.">
4. <Step 4 — e.g., "Dehydrate value: cut every sentence that doesn't serve Should-we / What-to.">

## Instructions
<!-- BUILDER INJECTS HERE: the `instructions` slot is filled with the bodies of the rules
     listed under frontmatter `compose.instructions`, in order. -->
{{ INJECT instructions }}

## Output
<!-- BUILDER INJECTS HERE: the `output` slot is filled with the bodies of the rules
     listed under frontmatter `compose.output`, in order. -->
{{ INJECT output }}
