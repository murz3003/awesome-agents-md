/**
 * Render the human-facing README that ships beside each generated artifact.
 *
 * This README describes the artifact **as a thing in itself** — what it is and how to use
 * it — exactly as a hand-written README would. It deliberately does NOT reveal how the
 * artifact was assembled (which source rules were inlined vs referenced): from this README's
 * vantage point, the artifact simply *is* what it is. The main artifact file (agents.md /
 * SKILL.md / .mdc / CLAUDE.md) is the source of truth; this README orients a human reader.
 *
 * Description material is pulled from the artifact's own body (its opening framing or a named
 * section like `## Description`), with the frontmatter `description` as a one-line fallback.
 */

/**
 * Extract a self-description from an artifact body, to summarize what it is in its own words.
 * Uses a `## Description` section when the artifact carries one (the skill convention); these
 * artifacts are written as descriptive prose. Structured artifacts (agents/claude/mdc) don't
 * have such a section — they return "" here and rely on their frontmatter tagline instead,
 * rather than mining a list-item or heading that isn't actually a description.
 */
export function extractDescription(body: string): string {
  const sectionMatch = body.match(/^##\s+Description\s*\n([\s\S]*?)(?=\n##\s|$)/im);
  return sectionMatch ? sectionMatch[1].trim() : "";
}

/**
 * Render the README for an artifact.
 *
 * @param artifactFile  Filename of the artifact (e.g. "agents.md", "SKILL.md", "CLAUDE.md").
 * @param name          Artifact name (the output directory / profile name).
 * @param description   One-line description from frontmatter (the tagline).
 * @param body          The artifact's own body (to mine a richer self-description from, if any).
 * @param usageNote     How a consumer drops this artifact into their tool (tool-specific).
 */
export function renderProvenance(
  artifactFile: string,
  name: string,
  description: string,
  body: string,
  usageNote: string,
): string {
  const selfDesc = extractDescription(body);
  const tagline = (description ?? "").trim().replace(/\.+$/, "");

  const aboutBlock = selfDesc || (tagline ? `${tagline}.` : "_No description available._");

  return `# ${name}

${aboutBlock}

## What this is

\`${artifactFile}\`${tagline ? ` — ${tagline}.` : ""}

${usageNote}

---

_Regenerate with \`pnpm build\`._
`;
}
