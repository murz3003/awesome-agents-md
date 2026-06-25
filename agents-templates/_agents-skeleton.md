<!--
  agents.md skeleton — authoring guide only (leading-underscore name → builder skips it).
  Copy this to <your-profile>.md under agents-templates/ to start.

  Marker-driven composition (the frontmatter carries NO `compose` block). Declare rule
  composition in the BODY, exactly where you want it to land:
    {{ INLINE:<rule-key> }}              splice a rule's whole body here
    {{ INLINE:<rule-key>:<section> }}    splice one `## <section>` body (e.g. :Instructions)
    {{ REF:<path>:<rule-key> }}          copy the rule to <path> (relative to this artifact's
                                         dir) and leave a pointer here
  <rule-key> is a path under rules/ (with or without .md), e.g. software-engineering/testing.
  A profile with no markers is pure hand-written content. The frontmatter is build metadata
  only — the builder strips it; the output is pure markdown dropped into a project as agents.md.
-->
---
name: <profile-name>
description: <One line: what this project agents.md enforces>
---

# <Profile Display Name>

<Optional framing paragraph: what stance this project context enforces. Keep it short —
this is constant project-root context.>

## Guidance

{{ INLINE:software-engineering/testing:Instructions }}

## Output

{{ INLINE:software-engineering/testing:Output }}

## Core Directive

<One-line summary of what this profile always does.>
