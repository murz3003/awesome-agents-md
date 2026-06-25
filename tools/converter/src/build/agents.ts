import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { AGENTS_TEMPLATES_DIR, DIST_AGENTS_DIR } from "../paths.js";
import { writeIfChanged } from "../io.js";

export interface BuildResult {
  name: string;
  outDir: string;
}

/**
 * Build every `agents-templates/*.md` into `dist/agents/<name>/agents.md`.
 *
 * The scaffold is a finished project context; no rule injection is needed (unlike
 * skills). The only transform is stripping the leading `> How to use` hint block so
 * the output reads as a clean, drop-in agents.md.
 */
export function buildAgents(): BuildResult[] {
  const templates = readdirSync(AGENTS_TEMPLATES_DIR).filter((f) => f.endsWith(".md"));
  const results: BuildResult[] = [];

  for (const file of templates) {
    const name = file.replace(/\.md$/, "");
    const raw = readFileSync(resolve(AGENTS_TEMPLATES_DIR, file), "utf8");
    const body = stripUsageHint(raw);

    const outDir = resolve(DIST_AGENTS_DIR, name);
    writeIfChanged(resolve(outDir, "agents.md"), body.trim() + "\n");
    results.push({ name, outDir });
  }
  return results;
}

/**
 * Remove the leading "> How to Use This Template" block — authoring guidance that
 * shouldn't ship in the generated project context.
 */
function stripUsageHint(raw: string): string {
  const marker = "## How to Use";
  const idx = raw.indexOf(marker);
  if (idx === -1) return raw;
  // Drop from the `## How to Use` heading up to the next `## ` heading.
  const after = raw.slice(idx);
  const nextHeading = after.search(/\n##\s/m);
  if (nextHeading === -1) return raw;
  return raw.slice(0, idx) + after.slice(nextHeading + 1);
}
