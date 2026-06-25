import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";

/** Recursively create a directory (no-op if it exists). */
export function ensureDirSync(dir: string): void {
  mkdirSync(dir, { recursive: true });
}

/**
 * Write a file only when its content differs from the current on-disk content.
 * Avoids touching mtimes for unchanged outputs — important for incremental builds.
 */
export function writeIfChanged(file: string, content: string): void {
  ensureDirSync(dirname(file));
  if (existsSync(file) && readFileSync(file, "utf8") === content) return;
  writeFileSync(file, content, "utf8");
}

/** Recursively remove a directory if it exists. */
export function rmrf(dir: string): void {
  if (existsSync(dir) && statSync(dir).isDirectory()) {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Recursively list file entries under a directory (empty array if missing). */
export function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f: string) => statSync(join(dir, f)).isFile());
}
