import { composedRuleKeys, type ComposeSpec } from "./frontmatter.js";

/**
 * Render the human-facing README that ships beside each generated artifact.
 * Describes WHAT was generated and HOW (source template + composed rules), so a
 * reader can trace provenance without reading the build tool. It is NOT consumed by
 * any model — the artifact itself (agents.md / SKILL.md / .mdc / CLAUDE.md) is.
 *
 * `mode` describes how rules enter the artifact: "inlined" (spliced into the body) or
 * "referenced" (copied under references/ and pointed at).
 */
export function renderProvenance(
  artifactFile: string,
  name: string,
  sourceDir: string,
  compose: ComposeSpec,
  mode: "inlined" | "referenced",
): string {
  const sourceExt = sourceDir === "mdc-templates" ? ".mdc" : ".md";
  const rules = composedRuleKeys(compose);
  const ruleLines = rules.length
    ? rules.map((k) => `- \`rules/${k}.md\``).join("\n")
    : "_No rules composed — this artifact carries all its own content._";

  const modeNote =
    mode === "inlined"
      ? "Rule content is **inlined** into this file (self-contained)."
      : "Rule files are copied into a sibling `references/` directory and referenced by relative path.";

  return `# ${name} — ${artifactFile}

Generated from \`${sourceDir}/${name}${sourceExt}\`.

${modeNote}

## Composed Rules

${ruleLines}

---

_Regenerate with \`pnpm build\`. Edit the source template, not this output._
`;
}
