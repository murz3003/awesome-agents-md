import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { RULES_DIR } from "./paths.js";

/**
 * A rule is sliced into named sections by its level-2 headings (`## Name`).
 * `requirement-writing.md` → { Role, Instructions, Output }.
 */

export interface RuleSections {
  /** Heading text (e.g. "Instructions") → body under that heading (no trailing `---`). */
  [heading: string]: string;
}

const HEADING = /^##\s+(.+?)\s*$/;

/** Read a rule file and split it into sections keyed by level-2 heading. */
export function readRuleSections(ruleKey: string): RuleSections {
  const file = resolve(RULES_DIR, `${ruleKey}.md`);
  let raw: string;
  try {
    raw = readFileSync(file, "utf8");
  } catch {
    throw new Error(`Rule not found: ${ruleKey} (looked at ${file})`);
  }
  return sliceSections(raw);
}

export function sliceSections(raw: string): RuleSections {
  const lines = raw.split(/\r?\n/);
  const sections: RuleSections = {};
  let current = "";
  const buffer: Record<string, string[]> = {};

  for (const line of lines) {
    const m = line.match(HEADING);
    if (m) {
      current = m[1].trim();
      buffer[current] = [];
    } else if (current) {
      buffer[current].push(line);
    }
  }

  for (const [heading, bodyLines] of Object.entries(buffer)) {
    // Trim leading blank lines and a trailing horizontal rule, if present.
    let body = bodyLines.join("\n").replace(/^\n+/, "");
    body = body.replace(/\n+---\s*$/, "");
    sections[heading] = body.trim();
  }
  return sections;
}
