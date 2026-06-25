import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/** Absolute path to the repo root. */
export const ROOT = PROJECT_ROOT;

/** Atomic rule knowledge base — the single source of truth. */
export const RULES_DIR = resolve(PROJECT_ROOT, "rules");

// Template sources — each is a declarative skeleton whose `compose` references rules/.
export const AGENTS_TEMPLATES_DIR = resolve(PROJECT_ROOT, "agents-templates");
export const MDC_TEMPLATES_DIR = resolve(PROJECT_ROOT, "mdc-templates");
export const CLAUDE_TEMPLATES_DIR = resolve(PROJECT_ROOT, "claude-templates");
export const SKILLS_TEMPLATES_DIR = resolve(PROJECT_ROOT, "skills-templates");

/** Build output (gitignored). */
export const DIST_DIR = resolve(PROJECT_ROOT, "dist");
export const DIST_AGENTS_DIR = resolve(DIST_DIR, "agents");
export const DIST_MDC_DIR = resolve(DIST_DIR, "cursor");
export const DIST_CLAUDE_DIR = resolve(DIST_DIR, "claude");
export const DIST_SKILLS_DIR = resolve(DIST_DIR, "skills");

/** Marker replaced with injected rule content (inline-expansion targets only). Format: {{ INJECT <slot> }} */
export const INJECT_PATTERN = /\{\{\s*INJECT\s+([\w-]+)\s*\}\}/g;
