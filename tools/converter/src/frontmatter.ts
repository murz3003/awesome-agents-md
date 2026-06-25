/**
 * Minimal YAML frontmatter parser for template sources.
 *
 * Templates carry a tiny, well-defined YAML subset: scalars and a `compose` mapping whose
 * values are block sequences of strings. Hand-rolled to avoid a full YAML dependency.
 *
 * `name` is required for agents/skills/claude templates (derives the output path) but
 * optional for mdc templates (the mdc `description` is the meaningful field). All raw
 * scalars are preserved so each builder can emit the fields its format needs.
 */

export interface ComposeSpec {
  /** slot name → ordered list of rule keys (e.g. "product-management/requirement-writing") */
  [slot: string]: string[];
}

export interface TemplateFrontmatter {
  name?: string;
  /** Every top-level scalar found, keyed by field name (name, description, globs, ...). */
  scalars: Record<string, string>;
  compose: ComposeSpec;
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
  const compose = parseCompose(yaml);
  for (const line of yaml.split(/\r?\n/)) {
    // A top-level scalar: `key: value`, not a `compose:` mapping line.
    const m = line.match(/^([\w-]+):\s*(.+?)\s*$/);
    if (m) scalars[m[1]] = stripQuotes(m[2]).trim();
  }
  return { name: scalars.name, scalars, compose };
}

function stripQuotes(value: string): string {
  const ch = value[0];
  if ((ch === '"' || ch === "'") && value[value.length - 1] === ch) {
    return value.slice(1, -1);
  }
  return value;
}

function parseCompose(yaml: string): ComposeSpec {
  const compose: ComposeSpec = {};
  const composeStart = yaml.indexOf("compose:");
  if (composeStart === -1) return compose;

  const lines = yaml.slice(composeStart).split(/\r?\n/);
  let currentSlot = "";
  for (const line of lines.slice(1)) {
    if (/\S/.test(line) && /^\S/.test(line)) break; // next top-level key
    const slotMatch = line.match(/^  ([\w-]+):\s*$/);
    if (slotMatch) {
      currentSlot = slotMatch[1];
      compose[currentSlot] = [];
      continue;
    }
    const itemMatch = line.match(/^\s+-\s+(.+?)\s*$/);
    if (itemMatch && currentSlot) {
      compose[currentSlot].push(stripQuotes(itemMatch[1]).trim());
    }
  }
  return compose;
}

/** All unique rule keys referenced anywhere in `compose`, in first-seen order. */
export function composedRuleKeys(compose: ComposeSpec): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const keys of Object.values(compose)) {
    for (const k of keys) {
      if (!seen.has(k)) {
        seen.add(k);
        out.push(k);
      }
    }
  }
  return out;
}
