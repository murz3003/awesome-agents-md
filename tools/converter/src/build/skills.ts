import { resolve } from "node:path";
import { readRuleRaw } from "../rules.js";
import { SKILLS_TEMPLATES_DIR, DIST_SKILLS_DIR } from "../paths.js";
import { writeIfChanged } from "../io.js";
import { loadTemplates, type LoadedTemplate } from "../template.js";
import { resolveBody } from "../markers.js";
import { renderProvenance } from "../provenance.js";

export interface BuildResult {
  name: string;
  outDir: string;
}

/**
 * Build every skills-templates/* into dist/skills/<name>/.
 *
 * Marker-driven: INLINE splices rule content into SKILL.md; REF copies a rule to <path>
 * (relative to the skill dir) and leaves a pointer. A skill commonly references large
 * domain knowledge (loaded on demand) while inlining its "voice" baseline. The source
 * body is emitted as-is (frontmatter already stripped by the loader); each output also
 * ships a README.md recording how it was assembled.
 */
export function buildSkills(filter?: (name: string) => boolean): BuildResult[] {
  return loadTemplates(SKILLS_TEMPLATES_DIR)
    .filter((t) => !filter || filter(t.name))
    .map((t) => buildOne(t));
}

function buildOne(t: LoadedTemplate): BuildResult {
  const { body, refs } = resolveBody(t.body);
  const outDir = resolve(DIST_SKILLS_DIR, t.name);
  for (const r of refs) {
    writeIfChanged(resolve(outDir, r.targetPath), `${readRuleRaw(r.ruleKey)}\n`);
  }
  writeIfChanged(resolve(outDir, "SKILL.md"), `${body.trim()}\n`);
  writeIfChanged(
    resolve(outDir, "README.md"),
    renderProvenance(
      "SKILL.md",
      t.name,
      t.data.scalars.description ?? "",
      body,
      "Install this skill (the `SKILL.md` plus any `references/` files) so the agent can trigger and load it on demand.",
    ),
  );
  return { name: t.name, outDir };
}
