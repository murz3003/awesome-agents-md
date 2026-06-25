import { resolve } from "node:path";
import { readRuleRaw } from "../rules.js";
import { MDC_TEMPLATES_DIR, DIST_MDC_DIR } from "../paths.js";
import { writeIfChanged } from "../io.js";
import { loadTemplates, type LoadedTemplate } from "../template.js";
import { resolveBody } from "../markers.js";

export interface BuildResult {
  name: string;
  outFile: string;
}

interface Built {
  result: BuildResult;
  description: string;
  globs: string;
}

/**
 * Build every mdc-templates/* into dist/cursor/<name>.mdc (flat, matching Cursor's
 * `.cursor/rules/*.mdc` layout).
 *
 * Marker-driven: INLINE splices rule content; REF copies a rule to <path> *relative to
 * dist/cursor/* and leaves a pointer. Because .mdc files are flat, any referenced rule
 * files land under dist/cursor/<path> and must be carried alongside the .mdc into
 * `.cursor/rules/`. The output keeps a Cursor-style frontmatter (description / globs /
 * alwaysApply) reconstructed from the source scalars; build metadata (name) is dropped.
 */
export function buildMdc(filter?: (name: string) => boolean): BuildResult[] {
  const templates = loadTemplates(MDC_TEMPLATES_DIR).filter((t) => !filter || filter(t.name));
  const built = templates.map((t) => buildOne(t));
  // Only (re)write the directory index when building the whole set; a filtered build would
  // otherwise produce an index describing a partial catalog.
  if (!filter) {
    writeIfChanged(resolve(DIST_MDC_DIR, "README.md"), renderCursorIndex(built));
  }
  return built.map((b) => b.result);
}

function buildOne(t: LoadedTemplate): Built {
  const { body, refs } = resolveBody(t.body);
  const fm = renderCursorFrontmatter(t.data.scalars);
  const outFile = resolve(DIST_MDC_DIR, `${t.name}.mdc`);
  for (const r of refs) {
    writeIfChanged(resolve(DIST_MDC_DIR, r.targetPath), `${readRuleRaw(r.ruleKey)}\n`);
  }
  writeIfChanged(outFile, `${fm}\n${body.trim()}\n`);
  return {
    result: { name: t.name, outFile },
    description: t.data.scalars.description ?? "",
    globs: t.data.scalars.globs ?? "",
  };
}

/**
 * Reconstruct Cursor frontmatter from source scalars, preserving only the fields Cursor
 * recognizes (description / globs / alwaysApply). `name` (build metadata) is excluded.
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

/**
 * Directory-level README describing the Cursor rules in this folder as they are — what each
 * does and when it applies — without revealing how they were assembled. Each entry is a
 * self-description of the rule, the way a hand-written catalog would list it.
 */
function renderCursorIndex(built: Built[]): string {
  const rows = built
    .map(({ result, description, globs }) => {
      const scope = globs.trim() ? `applies to \`${globs}\`` : "applies always";
      return `- \`${result.name}.mdc\` — ${description || "(no description)"} (${scope}).`;
    })
    .join("\n");
  return `# Cursor rules

Drop these into your project's \`.cursor/rules/\`. If a rule references a file (rather than
being self-contained), carry that file alongside the \`.mdc\`.

${rows}

---
_Regenerate with \`pnpm build:mdc\`._
`;
}
