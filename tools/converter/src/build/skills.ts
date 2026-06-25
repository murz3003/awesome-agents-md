import { readFileSync } from "node:fs";
import { resolve, basename } from "node:path";
import { SKILLS_TEMPLATES_DIR, DIST_SKILLS_DIR, RULES_DIR } from "../paths.js";
import { writeIfChanged } from "../io.js";
import { loadTemplates, type LoadedTemplate } from "../template.js";
import { composedRuleKeys } from "../frontmatter.js";
import { renderProvenance } from "../provenance.js";

export interface BuildResult {
  name: string;
  outDir: string;
}

/**
 * Build every skills-templates/* into dist/skills/<name>/.
 *
 * Reference style: rule content is NOT inlined. Each rule named in `compose` is copied
 * verbatim (deduplicated) into a sibling `references/` directory under its flat basename
 * (e.g. `references/requirement-writing.md`, NOT `references/product-management/...`);
 * the SKILL.md main file references those files by that flat path. The source body is
 * emitted as-is (its frontmatter is already stripped by the loader).
 */
export function buildSkills(): BuildResult[] {
  return loadTemplates(SKILLS_TEMPLATES_DIR).map((t) => buildOne(t));
}

function buildOne(t: LoadedTemplate): BuildResult {
  const outDir = resolve(DIST_SKILLS_DIR, t.name);
  const refsDir = resolve(outDir, "references");

  for (const ruleKey of composedRuleKeys(t.data.compose)) {
    const src = resolve(RULES_DIR, `${ruleKey}.md`);
    let raw: string;
    try {
      raw = readFileSync(src, "utf8");
    } catch {
      throw new Error(`Rule not found for skill "${t.name}": ${ruleKey} (looked at ${src})`);
    }
    // Flatten: ruleKey may be "domain/rule" → output "rule.md" so references stay shallow.
    const flatName = `${basename(ruleKey)}.md`;
    writeIfChanged(resolve(refsDir, flatName), `${raw.trim()}\n`);
  }

  writeIfChanged(resolve(outDir, "SKILL.md"), `${t.body.trim()}\n`);
  writeIfChanged(
    resolve(outDir, "README.md"),
    renderProvenance("SKILL.md", t.name, "skills-templates", t.data.compose, "referenced"),
  );
  return { name: t.name, outDir };
}
