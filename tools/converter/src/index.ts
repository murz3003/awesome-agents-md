#!/usr/bin/env node
/**
 * awesome-agents-md converter / builder.
 *
 * Commands:
 *   build [selectors...] [--target <t>]   Build into dist/.
 *
 *   Two equivalent ways to select what to build:
 *
 *   1. `build "target:pattern"` — a selector names the target AND the pattern. Repeatable,
 *      comma- or space-separated. A trailing `*` is a prefix wildcard.
 *         pnpm build "agents:engineering-*"
 *         pnpm build "agents:product-*" "skills:product-*"
 *         pnpm build "agents:product-expert,minimal"
 *         pnpm build "agents:*"            # build all of one type
 *
 *   2. `build:<target> [pattern...]` — a dedicated script pins the target; pass only the
 *      pattern(s) (no `target:` prefix). Repeatable the same ways.
 *         pnpm build:agents "engineering-*"
 *         pnpm build:skills product-expert,minimal
 *
 *   `--target <t>` (or `build:<t>` with no pattern) still builds an entire type. No selector
 *   at all builds everything.
 *
 *   clean                                  Remove dist/.
 *
 * Output layout:
 *   dist/agents/<name>/agents.md
 *   dist/cursor/<name>.mdc
 *   dist/claude/<name>/CLAUDE.md
 *   dist/skills/<name>/{SKILL.md, references/, README.md}
 */
import { DIST_DIR } from "./paths.js";
import { rmrf } from "./io.js";
import { buildAgents } from "./build/agents.js";
import { buildMdc } from "./build/mdc.js";
import { buildClaude } from "./build/claude.js";
import { buildSkills } from "./build/skills.js";

type Target = "agents" | "mdc" | "claude" | "skills";
const ALL_TARGETS: Target[] = ["agents", "mdc", "claude", "skills"];
const TARGET_SET = new Set<string>(ALL_TARGETS);

/** Per-target name filters; a missing key means "no filter" (build all of that type). */
type FilterMap = Partial<Record<Target, (name: string) => boolean>>;

/** Parse result: which targets were selected, plus their optional name filters. */
interface Selection {
  filters: FilterMap;
  /** Targets explicitly named by a selector (even with `*`, i.e. no filter). */
  selected: Target[];
}

function parseTargetFlag(args: string[]): { target?: Target; rest: string[] } {
  const idx = args.indexOf("--target");
  if (idx === -1) return { rest: args };
  const value = args[idx + 1];
  if (value === undefined) fail("--target requires a value: agents | mdc | claude | skills");
  if (!TARGET_SET.has(value)) fail(`Unknown --target "${value}". Expected: agents | mdc | claude | skills.`);
  return { target: value as Target, rest: [...args.slice(0, idx), ...args.slice(idx + 2)] };
}

/** Compile a list of patterns into a predicate over a template name (prefix `*` wildcard). */
function makeFilter(patterns: string[]): (name: string) => boolean {
  const regexes = patterns.map((p) => {
    const escaped = p.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    return new RegExp(`^${escaped}$`);
  });
  return (name: string) => regexes.some((re) => re.test(name));
}

/**
 * Parse selector tokens into per-target filters.
 *
 * Each token is either `target:pattern` (colon-prefixed; may carry its own comma list, e.g.
 * `agents:a,b`) or a bare pattern (assigned to the `targetFlag`, used by `build:<target>`
 * scripts that already pin the type). Bare patterns with no target flag are an error.
 * `target:*` collapses to "no filter" for that target (build the whole type).
 */
function parseFilters(tokens: string[], targetFlag?: Target): Selection {
  const patternsByTarget = new Map<Target, string[]>();
  const selectedSet = new Set<Target>();
  const ensure = (t: Target): string[] => {
    let arr = patternsByTarget.get(t);
    if (!arr) patternsByTarget.set(t, (arr = []));
    return arr;
  };

  for (const tok of tokens) {
    if (tok.startsWith("--")) continue;
    const colon = tok.indexOf(":");
    if (colon !== -1) {
      const t = tok.slice(0, colon);
      if (!TARGET_SET.has(t)) {
        fail(`Unknown target "${t}" in "${tok}". Expected one of: ${ALL_TARGETS.join(", ")}.`);
      }
      selectedSet.add(t as Target);
      const pat = tok.slice(colon + 1);
      if (pat === "*") continue; // explicit "all of this type" → no filter, but still selected
      ensure(t as Target).push(...pat.split(",").map((s) => s.trim()).filter(Boolean));
    } else {
      if (!targetFlag) {
        fail(`Pattern "${tok}" has no target. Use "target:${tok}" or a build:<target> script.`);
      }
      selectedSet.add(targetFlag);
      ensure(targetFlag).push(...tok.split(",").map((s) => s.trim()).filter(Boolean));
    }
  }

  const filters: FilterMap = {};
  for (const [t, pats] of patternsByTarget) {
    if (pats.length > 0) filters[t] = makeFilter(pats);
  }
  return { filters, selected: [...selectedSet] };
}

function main(): void {
  const [cmd, ...rest] = process.argv.slice(2);
  switch (cmd) {
    case "build": {
      const { target: targetFlag, rest: afterFlag } = parseTargetFlag(rest);
      const { filters, selected } = parseFilters(afterFlag, targetFlag);
      runBuild(targetFlag, filters, selected);
      break;
    }
    case "clean":
      rmrf(DIST_DIR);
      console.log("✓ cleaned dist/");
      break;
    case undefined:
      fail("No command given. Usage: build [selectors...] | clean");
      break;
    default:
      fail(`Unknown command "${cmd}". Expected: build | clean`);
  }
}

/**
 * Build. Decisions:
 *  - If any selectors named targets, build exactly those (each with its own filter; a `*`
 *    selector means "all of that type").
 *  - Else if `--target` (or `build:<t>` with no pattern) was given, build that one type whole.
 *  - Else build everything.
 */
function runBuild(targetFlag: Target | undefined, filters: FilterMap, selected: Target[]): void {
  const targets: Target[] = selected.length > 0 ? selected : targetFlag ? [targetFlag] : ALL_TARGETS;
  const buildAll = selected.length === 0 && !targetFlag;

  const summary: string[] = [];
  let builtAny = false;

  for (const t of ALL_TARGETS) {
    if (!targets.includes(t)) continue;
    const filter = filters[t];
    const res = dispatch(t, filter);
    builtAny = builtAny || res.length > 0;
    const label = LABELS[t];
    for (const r of res) summary.push(`  ${label.path(r.name)}`);
    console.log(`✓ built ${res.length} ${label.unit}`);
  }

  console.log("\nOutput:");
  for (const line of summary) console.log(line);

  if (!buildAll && !builtAny) {
    console.log("\n⚠  filter matched no templates — nothing built.");
  }
}

const LABELS: Record<Target, { unit: string; path: (n: string) => string }> = {
  agents: { unit: "agents.md scaffold(s)", path: (n) => `agents/${n}/agents.md` },
  mdc: { unit: ".mdc rule(s)", path: (n) => `cursor/${n}.mdc` },
  claude: { unit: "CLAUDE.md profile(s)", path: (n) => `claude/${n}/CLAUDE.md` },
  skills: { unit: "skill(s)", path: (n) => `skills/${n}/SKILL.md` },
};

function dispatch(t: Target, filter?: (name: string) => boolean) {
  switch (t) {
    case "agents": return buildAgents(filter);
    case "mdc": return buildMdc(filter);
    case "claude": return buildClaude(filter);
    case "skills": return buildSkills(filter);
  }
}

function fail(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}

main();
