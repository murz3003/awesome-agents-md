import { resolve } from "node:path";
import { CLAUDE_TEMPLATES_DIR, DIST_CLAUDE_DIR } from "../paths.js";
import { writeIfChanged } from "../io.js";
import { loadTemplates, type LoadedTemplate } from "../template.js";
import { injectAll } from "../inject.js";
import { renderProvenance } from "../provenance.js";

export interface BuildResult {
  name: string;
  outDir: string;
}

/**
 * Build every claude-templates/* into dist/claude/<name>/CLAUDE.md.
 *
 * Inline expansion (same as agents). The frontmatter is build metadata only — the output
 * is pure markdown (CLAUDE.md has no frontmatter). Each output dir also gets a README.md
 * recording how CLAUDE.md was assembled.
 */
export function buildClaude(): BuildResult[] {
  return loadTemplates(CLAUDE_TEMPLATES_DIR).map((t) => buildOne(t));
}

function buildOne(t: LoadedTemplate): BuildResult {
  const body = injectAll(t.body, t.data.compose);
  const outDir = resolve(DIST_CLAUDE_DIR, t.name);
  writeIfChanged(resolve(outDir, "CLAUDE.md"), `${body.trim()}\n`);
  writeIfChanged(
    resolve(outDir, "README.md"),
    renderProvenance("CLAUDE.md", t.name, "claude-templates", t.data.compose, "inlined"),
  );
  return { name: t.name, outDir };
}
