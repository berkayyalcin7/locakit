import { loadConfig, localePath } from "./config.js";
import { readLocale, writeLocale } from "./locales.js";
import { readLockfile, writeLockfile, hashValue } from "./lockfile.js";
import type { TranslationPatch } from "./types.js";

export interface ApplyResult {
  written: Record<string, number>;
  skipped: { target: string; key: string; reason: string }[];
}

/**
 * Agent'ın ürettiği çeviri yamasını hedef dosyalara yazar ve lockfile'ı günceller.
 * Kaynakta bulunmayan key'ler yazılmaz (agent halüsinasyonuna karşı emniyet).
 */
export function apply(cwd: string, patch: TranslationPatch): ApplyResult {
  const config = loadConfig(cwd);
  const source = readLocale(localePath(cwd, config, config.source));
  const sourceOrder = Object.keys(source);
  const lock = readLockfile(cwd);
  const result: ApplyResult = { written: {}, skipped: [] };

  for (const [target, entries] of Object.entries(patch)) {
    if (!config.targets.includes(target)) {
      result.skipped.push({ target, key: "*", reason: "hedef dil config'de tanımlı değil" });
      continue;
    }
    const path = localePath(cwd, config, target);
    const translated = readLocale(path);
    lock.targets[target] ??= {};
    let count = 0;

    for (const [key, value] of Object.entries(entries)) {
      if (!(key in source)) {
        result.skipped.push({ target, key, reason: "kaynakta böyle bir key yok" });
        continue;
      }
      if (typeof value !== "string" || value.trim() === "") {
        result.skipped.push({ target, key, reason: "boş veya string olmayan değer" });
        continue;
      }
      translated[key] = value;
      lock.targets[target]![key] = hashValue(source[key]!);
      count++;
    }

    if (count > 0) writeLocale(path, translated, sourceOrder);
    result.written[target] = count;
  }

  writeLockfile(cwd, lock);
  return result;
}

/** Mevcut çevirileri "güncel" kabul edip lockfile'ı bugünkü kaynak hash'leriyle doldurur. */
export function lockCurrent(cwd: string): number {
  const config = loadConfig(cwd);
  const source = readLocale(localePath(cwd, config, config.source));
  const lock = readLockfile(cwd);
  let count = 0;

  for (const target of config.targets) {
    const translated = readLocale(localePath(cwd, config, target));
    lock.targets[target] ??= {};
    for (const key of Object.keys(translated)) {
      if (key in source) {
        lock.targets[target]![key] = hashValue(source[key]!);
        count++;
      }
    }
  }
  writeLockfile(cwd, lock);
  return count;
}
