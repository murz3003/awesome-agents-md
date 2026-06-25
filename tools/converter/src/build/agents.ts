import { resolve } from "node:path";
import { AGENTS_TEMPLATES_DIR, DIST_AGENTS_DIR } from "../paths.js";
import { writeIfChanged } from "../io.js";
import { loadTemplates, type LoadedTemplate } from "../template.js";
import { injectAll } from "../inject.js";
import { renderProvenance } from "../provenance.js";

export interface BuildResult {
  name: string;
  outDir: string;
}

/**
 * Build every agents-templates/* into dist/agents/<name>/.
 *
 * Inline expansion: rule bodies named in `compose` are spliced into the body where
 * `{{ INJECT <slot> }}` appears. The frontmatter is build metadata only — it does NOT
 * appear in the output. Each output dir also gets a README.md (for humans) recording
 * how the agents.md was assembled.
 */
export function buildAgents(): BuildResult[] {
  return loadTemplates(AGENTS_TEMPLATES_DIR).map((t) => buildOne(t));
}

function buildOne(t: LoadedTemplate): BuildResult {
  const body = injectAll(t.body, t.data.compose);
  const outDir = resolve(DIST_AGENTS_DIR, t.name);
  writeIfChanged(resolve(outDir, "agents.md"), `${body.trim()}\n`);
  writeIfChanged(
    resolve(outDir, "README.md"),
    renderProvenance("agents.md", t.name, "agents-templates", t.data.compose, "inlined"),
  );
  return { name: t.name, outDir };
}
