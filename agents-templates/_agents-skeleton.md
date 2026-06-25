<!--
  agents.md skeleton — authoring guide only (leading-underscore name → builder skips it).
  Copy this to <your-profile>.md under agents-templates/ to start.

  agents templates produce self-contained project-root context (inline expansion): any
  rule bodies named in `compose` are spliced into the body where `{{ INJECT <slot> }}`
  appears. The frontmatter is build metadata only — the builder strips it; the output is
  pure markdown dropped into a project as agents.md.
  A template with an empty/absent `compose` is a pure profile (all content hand-written).
-->
---
name: <profile-name>
description: <One line: what this project agents.md enforces>
# compose: rule keys (path under rules/, without .md) spliced into each slot, in order.
#           Omit compose (or leave slots empty) for a pure hand-written profile.
compose:
  instructions: []      # e.g. [ software-engineering/testing ]
---

# <Profile Display Name>

<Optional framing paragraph: what stance this project context enforces. Keep it short —
this is constant project-root context.>

{{ INJECT instructions }}
