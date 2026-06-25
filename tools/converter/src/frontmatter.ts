/**
 * Minimal YAML frontmatter parser.
 *
 * The skill templates use a tiny, well-defined subset of YAML: scalars, a `compose`
 * mapping whose values are block sequences of strings. Hand-rolling avoids pulling a
 * full YAML dependency for ~10 lines of structured data.
 */

export interface ComposeSpec {
  /** slot name → ordered list of rule keys (e.g. "product-management/requirement-writing") */
  [slot: string]: string[];
}

export interface SkillFrontmatter {
  name: string;
  description: string;
  compose: ComposeSpec;
}

export interface ParsedFrontmatter {
  data: SkillFrontmatter;
  /** The body that follows the closing `---`. */
  body: string;
}

const FENCE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;

export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const match = raw.match(FENCE);
  if (!match) {
    throw new Error("Missing YAML frontmatter. Expected a leading `---` fenced block.");
  }
  const [, yaml, body] = match;
  const data = parseYaml(yaml);
  return { data, body };
}

function parseYaml(yaml: string): SkillFrontmatter {
  const name = scalar(yaml, "name");
  const description = scalar(yaml, "description");
  const compose = parseCompose(yaml);
  if (!name) throw new Error("Frontmatter missing required field: name");
  if (!description) throw new Error("Frontmatter missing required field: description");
  return { name, description, compose };
}

function scalar(yaml: string, key: string): string {
  const re = new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m");
  const m = yaml.match(re);
  return m ? stripQuotes(m[1]).trim() : "";
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

  // Operate on lines under the `compose:` key, at indent level 2 (slot) / 4 (item).
  const lines = yaml.slice(composeStart).split(/\r?\n/);
  let currentSlot = "";
  for (const line of lines.slice(1)) {
    // Stop at the next top-level key (non-indented line).
    if (/\S/.test(line) && /^\S/.test(line)) break;
    const slotMatch = line.match(/^  ([\w-]+):\s*$/);
    if (slotMatch) {
      currentSlot = slotMatch[1];
      compose[currentSlot] = [];
      continue;
    }
    // List items are indented further than the slot (typically 4 spaces).
    const itemMatch = line.match(/^\s+-\s+(.+?)\s*$/);
    if (itemMatch && currentSlot) {
      compose[currentSlot].push(stripQuotes(itemMatch[1]).trim());
    }
  }
  return compose;
}
