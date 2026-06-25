import { INJECT_PATTERN } from "./paths.js";
import type { ComposeSpec } from "./frontmatter.js";
import { readRuleSections } from "./rules.js";

/**
 * Map a slot name to the rule section heading it injects from.
 * Skill templates use two canonical slots:
 *   - instructions → the rule's "## Instructions" body
 *   - output       → the rule's "## Output" body
 */
const SLOT_TO_HEADING: Record<string, string> = {
  instructions: "Instructions",
  output: "Output",
};

/**
 * Resolve every `{{ INJECT <slot> }}` marker in the skill body by pulling the
 * referenced rule sections declared in `compose`. Each rule contributes its
 * section body; multiple rules are concatenated in declaration order, separated
 * by a horizontal rule.
 *
 * Authoring comments on the same or preceding line (`<!-- ... -->`) are stripped
 * so they don't leak into the generated skill.
 */
export function injectAll(body: string, compose: ComposeSpec): string {
  return body
    .replace(/^[ \t]*<!--.*?-->\s*\n\s*(?=\{\{\s*INJECT\s)/gm, "") // drop comment directly above an INJECT marker
    .replace(INJECT_PATTERN, (_full, slot: string) => {
      const heading = SLOT_TO_HEADING[slot];
      if (!heading) {
        throw new Error(`Unknown inject slot: "${slot}". Known slots: ${Object.keys(SLOT_TO_HEADING).join(", ")}`);
      }
      const ruleKeys = compose[slot];
      if (!ruleKeys || ruleKeys.length === 0) {
        throw new Error(`Slot "${slot}" has no rules under compose:. Add rules or remove the marker.`);
      }
      return ruleKeys
        .map((key) => readRuleSections(key)[heading] ?? "")
        .filter((s) => s.length > 0)
        .join("\n\n---\n\n");
    });
}

/** True if the body still contains unreplaced INJECT markers (used to surface template bugs). */
export function hasUnresolvedMarkers(body: string): boolean {
  return INJECT_PATTERN.test(body);
}
