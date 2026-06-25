#!/usr/bin/env node
/**
 * awesome-agents-md converter / builder.
 *
 * Commands:
 *   build [--target agents|mdc|claude|skills|all]   Build templates into dist/. Default: all.
 *   clean                                            Remove dist/.
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

type Target = "agents" | "mdc" | "claude" | "skills" | "all";
const ALL_TARGETS: Target[] = ["agents", "mdc", "claude", "skills"];

function parseTarget(args: string[]): Target {
  const idx = args.indexOf("--target");
  const value = idx !== -1 ? args[idx + 1] : undefined;
  if (value === undefined || value === "all") return "all";
  if (ALL_TARGETS.includes(value as Target)) return value as Target;
  fail(`Unknown --target "${value}". Expected: agents | mdc | claude | skills | all.`);
}

function main(): void {
  const [cmd, ...rest] = process.argv.slice(2);
  switch (cmd) {
    case "build":
      runBuild(parseTarget(rest));
      break;
    case "clean":
      rmrf(DIST_DIR);
      console.log("✓ cleaned dist/");
      break;
    case undefined:
      fail("No command given. Usage: build [--target agents|mdc|claude|skills|all] | clean");
      break;
    default:
      fail(`Unknown command "${cmd}". Expected: build | clean`);
  }
}

function runBuild(target: Target): void {
  const summary: string[] = [];

  if (target === "all" || target === "agents") {
    const res = buildAgents();
    for (const r of res) summary.push(`  agents/${r.name}/agents.md`);
    console.log(`✓ built ${res.length} agents.md scaffold(s)`);
  }
  if (target === "all" || target === "mdc") {
    const res = buildMdc();
    for (const r of res) summary.push(`  cursor/${r.name}.mdc`);
    console.log(`✓ built ${res.length} .mdc rule(s)`);
  }
  if (target === "all" || target === "claude") {
    const res = buildClaude();
    for (const r of res) summary.push(`  claude/${r.name}/CLAUDE.md`);
    console.log(`✓ built ${res.length} CLAUDE.md profile(s)`);
  }
  if (target === "all" || target === "skills") {
    const res = buildSkills();
    for (const r of res) summary.push(`  skills/${r.name}/SKILL.md`);
    console.log(`✓ built ${res.length} skill(s)`);
  }

  console.log("\nOutput:");
  for (const line of summary) console.log(line);
}

function fail(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}

main();
