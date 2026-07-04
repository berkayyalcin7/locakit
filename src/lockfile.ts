import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { LOCK_FILE } from "./config.js";
import type { Lockfile } from "./types.js";

export function hashValue(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex").slice(0, 16);
}

export function readLockfile(cwd: string): Lockfile {
  const path = resolve(cwd, LOCK_FILE);
  if (!existsSync(path)) return { version: 1, targets: {} };
  return JSON.parse(readFileSync(path, "utf8")) as Lockfile;
}

export function writeLockfile(cwd: string, lock: Lockfile): void {
  // Key'ler sıralı yazılır ki lockfile diff'leri git'te deterministik olsun.
  const sorted: Lockfile = { version: 1, targets: {} };
  for (const target of Object.keys(lock.targets).sort()) {
    const entries = lock.targets[target]!;
    sorted.targets[target] = {};
    for (const key of Object.keys(entries).sort()) {
      sorted.targets[target]![key] = entries[key]!;
    }
  }
  writeFileSync(resolve(cwd, LOCK_FILE), JSON.stringify(sorted, null, 2) + "\n", "utf8");
}
