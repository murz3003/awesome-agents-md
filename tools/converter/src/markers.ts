import { readRuleSections } from "./rules.js";
import { readRuleRaw } from "./rules.js";

/**
 * Marker-driven rule composition. The mode (inline/reference), the source rule,
 * and — for references — the target path are all declared *in the template body*
 * via self-contained markers. The frontmatter no longer carries a `compose` block.
 *
 * Two markers, both whitespace-tolerant:
 *   {{ INLINE:<rule-key> }}              splice the rule's whole body here
 *   {{ INLINE:<rule-key>:<section> }}    splice one `## <section>` body here
 *   {{ REF:<target-path>:<rule-key> }}   copy the rule to <target-path> (relative to
 *                                        the artifact dir) and leave a pointer here
 *
 * A rule-key is a path under `rules/` without the `.md` extension; it may nest
 * (e.g. `general/communication/natural-expression`). Unresolved markers (missing rule,
 * missing section, malformed syntax) fail the build loudly.
 */

/** A reference to materialize: copy `ruleKey` to `targetPath` under the artifact dir. */
export interface RefSpec {
  /** Destination path relative to the artifact's output directory (e.g. "references/x.md"). */
  targetPath: string;
  /** Source rule-key under rules/ (no `.md`). */
  ruleKey: string;
}

/** Result of resolving a template body. */
export interface ResolvedBody {
  /** Body with INLINE markers spliced in and REF markers replaced by pointers. */
  body: string;
  /** Rule-keys that were inlined (deduped, first-seen order) — for provenance. */
  inlineKeys: string[];
  /** References to materialize (deduped by targetPath) — builders copy these. */
  refs: RefSpec[];
}

const INLINE_RE = /\{\{\s*INLINE\s*:\s*([^:}]+?)\s*(?::\s*([^}]+?)\s*)?\}\}/g;
const REF_RE = /\{\{\s*REF\s*:\s*([^:}]+?)\s*:\s*([^}]+?)\s*\}\}/g;

/**
 * Resolve every marker in a template body.
 *
 * - INLINE → the rule body (whole, or one `## section`) spliced in place.
 * - REF    → the rule is queued for copying to its target path; the marker is
 *            replaced in-place by an inline-code pointer to that path.
 */
export function resolveBody(raw: string): ResolvedBody {
  const inlineKeys: string[] = [];
  const refMap = new Map<string, RefSpec>();

  // Pass 1: INLINE markers.
  const afterInline = raw.replace(INLINE_RE, (_full, key: string, section: string | undefined) => {
    const ruleKey = normKey(key);
    const content =
      section !== undefined && section !== ""
        ? sliceSectionOrThrow(ruleKey, section.trim())
        : readRuleRaw(ruleKey);
    pushUnique(inlineKeys, ruleKey);
    return content;
  });

  // Pass 2: REF markers. {{ REF: target : source }}.
  const afterRef = afterInline.replace(REF_RE, (_full, target: string, source: string) => {
    const targetPath = target.trim();
    const ruleKey = normKey(source);
    // Verify the rule exists early (fail loudly); readRuleRaw throws if missing.
    readRuleRaw(ruleKey);
    if (!refMap.has(targetPath)) refMap.set(targetPath, { targetPath, ruleKey });
    return `\`${targetPath}\``;
  });

  return { body: afterRef, inlineKeys, refs: [...refMap.values()] };
}

/** True if the body still contains any unresolved INLINE/REF marker. */
export function hasUnresolvedMarkers(body: string): boolean {
  return INLINE_RE.test(body) || REF_RE.test(body);
}

function sliceSectionOrThrow(ruleKey: string, section: string): string {
  const sections = readRuleSections(ruleKey);
  const body = sections[section];
  if (body === undefined || body.length === 0) {
    throw new Error(
      `Rule "${ruleKey}" has no \`## ${section}\` section to inline. Available: ${Object.keys(sections).join(", ") || "(none)"}.`,
    );
  }
  return body;
}

function pushUnique(list: string[], value: string): void {
  if (!list.includes(value)) list.push(value);
}

/** Normalize a rule-key: trim, and tolerate a trailing `.md` (markers may include it). */
function normKey(key: string): string {
  return key.trim().replace(/\.md$/i, "");
}
