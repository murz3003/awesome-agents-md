import { resolve } from "node:path";
import { readRuleRaw } from "../rules.js";
import { CLAUDE_TEMPLATES_DIR, DIST_CLAUDE_DIR } from "../paths.js";
import { writeIfChanged } from "../io.js";
import { loadTemplates, type LoadedTemplate } from "../template.js";
import { resolveBody } from "../markers.js";
import { renderProvenance } from "../provenance.js";

export interface BuildResult {
  name: string;
  outDir: string;
}

/**
 * Build every claude-templates/* into dist/claude/<name>/CLAUDE.md.
 *
 * Marker-driven (same as agents). The frontmatter is build metadata only — the output is
 * pure markdown (CLAUDE.md has no frontmatter). Each output dir also gets a README.md
 * recording how CLAUDE.md was assembled.
 */
export function buildClaude(filter?: (name: string) => boolean): BuildResult[] {
  return loadTemplates(CLAUDE_TEMPLATES_DIR)
    .filter((t) => !filter || filter(t.name))
    .map((t) => buildOne(t));
}

function buildOne(t: LoadedTemplate): BuildResult {
  const { body, refs } = resolveBody(t.body);
  const outDir = resolve(DIST_CLAUDE_DIR, t.name);
  for (const r of refs) {
    writeIfChanged(resolve(outDir, r.targetPath), `${readRuleRaw(r.ruleKey)}\n`);
  }
  writeIfChanged(resolve(outDir, "CLAUDE.md"), `${body.trim()}\n`);
  writeIfChanged(
    resolve(outDir, "README.md"),
    renderProvenance(
      "CLAUDE.md",
      t.name,
      t.data.scalars.description ?? "",
      body,
      "Place this `CLAUDE.md` (and any referenced files alongside it) in your project root for Claude Code.",
    ),
  );
  return { name: t.name, outDir };
}
