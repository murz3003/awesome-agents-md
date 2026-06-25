import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { DIST_SKILLS_DIR, SKILLS_TEMPLATES_DIR } from "../paths.js";
import { writeIfChanged } from "../io.js";
import { parseFrontmatter, type SkillFrontmatter } from "../frontmatter.js";
import { injectAll, hasUnresolvedMarkers } from "../inject.js";

export interface BuildResult {
  name: string;
  outDir: string;
}

/**
 * Build every `skills-templates/*.md` (except the leading-underscore skeleton) into
 * `dist/skills/<name>/`. Produces:
 *   - SKILL.md  — the triggerable skill, with rule bodies injected into INJECT slots
 *   - README.md — a manifest of which rules this skill composes (for auditability)
 *
 * Skill templates prefixed with `_` (e.g. `_skill-skeleton.md`) are authoring guides,
 * not buildable skills, and are skipped.
 */
export function buildSkills(): BuildResult[] {
  const templates = readdirSync(SKILLS_TEMPLATES_DIR)
    .filter((f: string) => f.endsWith(".md") && !f.startsWith("_"));
  const results: BuildResult[] = [];

  for (const file of templates) {
    const raw = readFileSync(resolve(SKILLS_TEMPLATES_DIR, file), "utf8");
    const { data, body } = parseFrontmatter(stripLeadingComments(raw));
    const injected = injectAll(body, data.compose);

    if (hasUnresolvedMarkers(injected)) {
      throw new Error(`Skill "${data.name}" has unresolved INJECT markers after injection. Check compose slots.`);
    }

    const outDir = resolve(DIST_SKILLS_DIR, data.name);
    writeIfChanged(resolve(outDir, "SKILL.md"), renderSkill(data, injected));
    writeIfChanged(resolve(outDir, "README.md"), renderManifest(data));
    results.push({ name: data.name, outDir });
  }
  return results;
}

/**
 * Drop a leading `<!-- ... -->` authoring comment that precedes the frontmatter,
 * so the parser sees `---` first.
 */
function stripLeadingComments(raw: string): string {
  return raw.replace(/^\s*<!--[\s\S]*?-->\s*/, "");
}

/** Render the final SKILL.md: frontmatter + body, no authoring scaffolding. */
function renderSkill(data: SkillFrontmatter, body: string): string {
  const fm = renderFrontmatter(data);
  return `${fm}\n${body.trim()}\n`;
}

function renderFrontmatter(data: SkillFrontmatter): string {
  const composeLines = Object.entries(data.compose)
    .filter(([, keys]) => keys.length > 0)
    .map(([slot, keys]) => {
      const items = keys.map((k) => `    - ${k}`).join("\n");
      return `  ${slot}:\n${items}`;
    })
    .join("\n");
  return `---
name: ${data.name}
description: ${data.description}
compose:
${composeLines}
---
`;
}

/** A short audit manifest: what this skill is and which rules it composes. */
function renderManifest(data: SkillFrontmatter): string {
  const ruleList = Object.entries(data.compose)
    .flatMap(([, keys]) => keys)
    .filter((v, i, a) => a.indexOf(v) === i); // unique
  const rows = ruleList.length
    ? ruleList.map((k) => `- \`rules/${k}.md\``).join("\n")
    : "_No rules composed — this skill carries all its own content._";
  return `# ${data.name}

${data.description}

## Composed Rules

This skill is generated from \`skills-templates/${data.name}.md\`. It composes:

${rows}
`;
}
