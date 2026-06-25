import { resolve } from "node:path";
import { MDC_TEMPLATES_DIR, DIST_MDC_DIR } from "../paths.js";
import { writeIfChanged } from "../io.js";
import { loadTemplates, type LoadedTemplate } from "../template.js";
import { injectAll } from "../inject.js";
import { composedRuleKeys } from "../frontmatter.js";

export interface BuildResult {
  name: string;
  outFile: string;
}

/**
 * Build every mdc-templates/* into dist/cursor/<name>.mdc (flat, matching Cursor's
 * `.cursor/rules/*.mdc` layout).
 *
 * Inline expansion (same as agents), but the output keeps a Cursor-style frontmatter
 * (description / globs / alwaysApply) reconstructed from the source scalars. The build
 * metadata fields (name, compose) are dropped. A single directory-level README.md lists
 * all generated rules (flat files don't get per-file READMEs).
 */
export function buildMdc(): BuildResult[] {
  const templates = loadTemplates(MDC_TEMPLATES_DIR);
  const results = templates.map((t) => buildOne(t));
  writeIfChanged(resolve(DIST_MDC_DIR, "README.md"), renderCursorIndex(templates));
  return results;
}

function buildOne(t: LoadedTemplate): BuildResult {
  const body = injectAll(t.body, t.data.compose);
  const fm = renderCursorFrontmatter(t.data.scalars);
  const outFile = resolve(DIST_MDC_DIR, `${t.name}.mdc`);
  writeIfChanged(outFile, `${fm}\n${body.trim()}\n`);
  return { name: t.name, outFile };
}

/**
 * Reconstruct Cursor frontmatter from source scalars, preserving only the fields Cursor
 * recognizes (description / globs / alwaysApply). `name` and `compose` (build metadata)
 * are excluded.
 */
function renderCursorFrontmatter(scalars: Record<string, string>): string {
  const lines = ["---"];
  for (const key of ["description", "globs", "alwaysApply"]) {
    if (scalars[key] !== undefined) {
      lines.push(`${key}: ${formatScalar(key, scalars[key])}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}

function formatScalar(key: string, value: string): string {
  // `globs` / `alwaysApply` are emitted bare; descriptive strings get quoted if needed.
  if (key === "globs" || key === "alwaysApply") return value;
  return needsQuotes(value) ? `"${value.replace(/"/g, '\\"')}"` : value;
}

function needsQuotes(value: string): boolean {
  return /[:#{}[\],&*?|<>=!%@`]/.test(value) || value.includes('"');
}

/** Directory-level README listing all generated .mdc rules and their composed sources. */
function renderCursorIndex(templates: LoadedTemplate[]): string {
  const rows = templates
    .map((t) => {
      const rules = composedRuleKeys(t.data.compose);
      const ruleList = rules.length
        ? rules.map((k) => `rules/${k}.md`).join(", ")
        : "no rules (self-contained)";
      return `- \`${t.name}.mdc\` — ${t.data.scalars.description ?? ""} (composes: ${ruleList})`;
    })
    .join("\n");
  return `# Cursor rules

Generated from \`mdc-templates/\` (inline expansion). Drop these into your project's \`.cursor/rules/\`.

${rows}

---
_Regenerate with \`pnpm build:mdc\`. Edit the source templates, not these outputs._
`;
}
