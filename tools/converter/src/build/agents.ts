import { resolve } from "node:path";
import { readRuleRaw } from "../rules.js";
import { AGENTS_TEMPLATES_DIR, DIST_AGENTS_DIR } from "../paths.js";
import { writeIfChanged } from "../io.js";
import { loadTemplates, type LoadedTemplate } from "../template.js";
import { resolveBody } from "../markers.js";
import { renderProvenance } from "../provenance.js";

export interface BuildResult {
  name: string;
  outDir: string;
}

/**
 * Build every agents-templates/* into dist/agents/<name>/.
 *
 * Marker-driven: `{{ INLINE:<key>[:<section>] }}` splices rule content into the body;
 * `{{ REF:<path>:<key> }}` copies a rule to <path> and leaves a pointer. The frontmatter
 * is build metadata only — it does NOT appear in the output. Each output dir also gets a
 * README.md (for humans) recording how the agents.md was assembled.
 */
export function buildAgents(filter?: (name: string) => boolean): BuildResult[] {
  return loadTemplates(AGENTS_TEMPLATES_DIR)
    .filter((t) => !filter || filter(t.name))
    .map((t) => buildOne(t));
}

function buildOne(t: LoadedTemplate): BuildResult {
  const { body, refs } = resolveBody(t.body);
  const outDir = resolve(DIST_AGENTS_DIR, t.name);
  for (const r of refs) {
    writeIfChanged(resolve(outDir, r.targetPath), `${readRuleRaw(r.ruleKey)}\n`);
  }
  writeIfChanged(resolve(outDir, "agents.md"), `${body.trim()}\n`);
  writeIfChanged(
    resolve(outDir, "README.md"),
    renderProvenance(
      "agents.md",
      t.name,
      t.data.scalars.description ?? "",
      body,
      "Drop this `agents.md` (and any referenced files alongside it) into your project root as the agent's standing context.",
    ),
  );
  return { name: t.name, outDir };
}
