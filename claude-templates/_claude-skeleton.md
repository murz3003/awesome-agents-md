<!--
  CLAUDE.md skeleton — authoring guide only (leading-underscore name → builder skips it).
  Copy this to <your-profile>.md under claude-templates/ to start.

  claude templates produce self-contained CLAUDE.md files (inline expansion): the rule
  bodies named in `compose` are spliced where `{{ INJECT <slot> }}` appears. The frontmatter
  below is build metadata only — the builder strips it; the output is pure markdown.
  Output goes to dist/claude/<name>/CLAUDE.md.
-->
---
name: <profile-name>
description: <One line: what this profile enforces>
# compose: rule keys (path under rules/, without .md) spliced into each slot in order.
compose:
  instructions: []      # e.g. [ software-engineering/testing ]
---

# <Profile Display Name>

<Optional framing paragraph. Keep it short — this is project-root context.>

{{ INJECT instructions }}
