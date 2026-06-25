import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/** Absolute path to the repo root. */
export const ROOT = PROJECT_ROOT;

/** Atomic rule knowledge base — the single source of truth. */
export const RULES_DIR = resolve(PROJECT_ROOT, "rules");

/** Project-level agents.md scaffolds (drop-in project root context). */
export const AGENTS_TEMPLATES_DIR = resolve(PROJECT_ROOT, "agents-templates");

/** SKILL.md skeletons (role + stance + SOP) with INJECT placeholders. */
export const SKILLS_TEMPLATES_DIR = resolve(PROJECT_ROOT, "skills-templates");

/** Build output (gitignored). */
export const DIST_DIR = resolve(PROJECT_ROOT, "dist");
export const DIST_AGENTS_DIR = resolve(DIST_DIR, "agents");
export const DIST_SKILLS_DIR = resolve(DIST_DIR, "skills");

/** Marker the skill builder replaces with injected rule content. Format: {{ INJECT <slot> }} */
export const INJECT_PATTERN = /\{\{\s*INJECT\s+([\w-]+)\s*\}\}/g;
