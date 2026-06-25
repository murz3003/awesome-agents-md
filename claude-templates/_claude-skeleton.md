<!--
  CLAUDE.md skeleton — authoring guide only (leading-underscore name → builder skips it).
  Copy this to <your-profile>.md under claude-templates/ to start.

  Marker-driven composition (no `compose` in frontmatter). Declare rule composition in the BODY:
    {{ INLINE:<rule-key> }}              splice a rule's whole body here
    {{ INLINE:<rule-key>:<section> }}    splice one `## <section>` body (e.g. :Instructions)
    {{ REF:<path>:<rule-key> }}          copy the rule to <path> (relative to this artifact's
                                         dir) and leave a pointer here
  <rule-key> is a path under rules/ (with or without .md), e.g. product-management/requirement-writing.
  The frontmatter is build metadata only — the output is pure markdown (CLAUDE.md has no
  frontmatter convention), dropped into a project root as CLAUDE.md.
-->
---
name: <profile-name>
description: <One line: what this CLAUDE.md profile enforces>
---

# <Profile Display Name>

<Optional framing paragraph: what stance this project-root context enforces. Keep it short.>

## Guidance

{{ INLINE:product-management/requirement-writing:Instructions }}

## Output

{{ INLINE:product-management/requirement-writing:Output }}
