#!/usr/bin/env node
/**
 * awesome-agents-md converter / builder.
 *
 * Commands:
 *   build [--target agents|skills]   Build templates into dist/. Default: both.
 *   clean                            Remove dist/.
 *
 * Output layout:
 *   dist/agents/<scaffold-name>/agents.md
 *   dist/skills/<skill-name>/SKILL.md (+ README.md)
 */
import { DIST_DIR } from "./paths.js";
import { rmrf } from "./io.js";
import { buildAgents } from "./build/agents.js";
import { buildSkills } from "./build/skills.js";

type Target = "agents" | "skills" | "all";

function parseTarget(args: string[]): Target {
  const idx = args.indexOf("--target");
  const value = idx !== -1 ? args[idx + 1] : undefined;
  if (value === "agents" || value === "skills") return value;
  if (value && value !== "all") {
    fail(`Unknown --target "${value}". Expected: agents | skills.`);
  }
  return "all";
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
      fail("No command given. Usage: build [--target agents|skills] | clean");
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
    console.log(`✓ built ${res.length} agents scaffold(s)`);
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
