import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { parseFrontmatter, type TemplateFrontmatter } from "./frontmatter.js";

export interface LoadedTemplate {
  file: string;
  /** Output name: the `name` scalar, else the filename stem. */
  name: string;
  data: TemplateFrontmatter;
  /** Body with frontmatter and any leading authoring comment removed. */
  body: string;
}

/**
 * Load every template file in a directory. Files whose stem starts with `_` are
 * authoring guides (skeletons) and are skipped. Supports `.md` and `.mdc`.
 */
export function loadTemplates(dir: string): LoadedTemplate[] {
  const files = readdirSync(dir).filter(
    (f: string) => (f.endsWith(".md") || f.endsWith(".mdc")) && !stripStem(f).startsWith("_"),
  );
  return files.map((f) => loadOne(resolve(dir, f)));
}

function loadOne(file: string): LoadedTemplate {
  const raw = readFileSync(file, "utf8");
  const { data, body } = parseFrontmatter(stripLeadingComment(raw));
  const name = data.name ?? stripStem(file.split(/[\\/]/).pop() as string);
  return { file, name, data, body: body.trim() };
}

/** Strip a leading `<!-- ... -->` authoring block that precedes the frontmatter. */
export function stripLeadingComment(raw: string): string {
  return raw.replace(/^\s*<!--[\s\S]*?-->\s*/, "");
}

function stripStem(filename: string): string {
  return filename.replace(/\.(md|mdc)$/, "");
}
