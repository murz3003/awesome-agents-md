/**
 * Minimal YAML frontmatter parser for template sources.
 *
 * Templates carry a tiny, well-defined YAML subset: top-level scalars only. There is
 * NO `compose` block anymore — rule composition is now marker-driven, declared in the
 * template *body* (see markers.ts). Hand-rolled to avoid a full YAML dependency.
 *
 * `name` is required for agents/skills/claude templates (derives the output path) but
 * optional for mdc templates (the mdc `description` is the meaningful field). All raw
 * scalars are preserved so each builder can emit the fields its format needs.
 */

export interface TemplateFrontmatter {
  name?: string;
  /** Every top-level scalar found, keyed by field name (name, description, globs, ...). */
  scalars: Record<string, string>;
}

export interface ParsedFrontmatter {
  data: TemplateFrontmatter;
  /** The body that follows the closing `---` (frontmatter stripped). */
  body: string;
}

const FENCE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const match = raw.match(FENCE);
  if (!match) {
    throw new Error("Missing YAML frontmatter. Expected a leading `---` fenced block.");
  }
  const [, yaml, body] = match;
  return { data: parseYaml(yaml), body };
}

function parseYaml(yaml: string): TemplateFrontmatter {
  const scalars: Record<string, string> = {};
  for (const line of yaml.split(/\r?\n/)) {
    // A top-level scalar: `key: value` (indented lines belong to no block now that
    // `compose` is gone, so they are safely ignored).
    const m = line.match(/^([\w-]+):\s*(.+?)\s*$/);
    if (m) scalars[m[1]] = stripQuotes(m[2]).trim();
  }
  return { name: scalars.name, scalars };
}

function stripQuotes(value: string): string {
  const ch = value[0];
  if ((ch === '"' || ch === "'") && value[value.length - 1] === ch) {
    return value.slice(1, -1);
  }
  return value;
}
