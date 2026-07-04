import { loadConfig, localePath } from "./config.js";
import { readLocale } from "./locales.js";
import { readLockfile, hashValue } from "./lockfile.js";
import type { DiffResult, DiffEntry } from "./types.js";

/**
 * Her hedef dil için eksik ve bayat key'leri hesaplar.
 * - missing: kaynakta var, hedef dosyada yok.
 * - stale: hedefte çeviri var ama kaynak metin son çeviriden (lockfile) sonra değişmiş.
 *   Lockfile kaydı olmayan mevcut çeviriler güncel kabul edilir; 'locakit lock' ile
 *   mevcut durum kilitlenebilir.
 */
export function diff(cwd: string): DiffResult {
  const config = loadConfig(cwd);
  const source = readLocale(localePath(cwd, config, config.source));
  const lock = readLockfile(cwd);

  const result: DiffResult = {
    sourceLocale: config.source,
    context: config.context,
    glossary: config.glossary,
    targets: {},
  };

  for (const target of config.targets) {
    const translated = readLocale(localePath(cwd, config, target));
    const locked = lock.targets[target] ?? {};
    const entries: DiffEntry[] = [];

    for (const [key, value] of Object.entries(source)) {
      if (!(key in translated)) {
        entries.push({ key, source: value, reason: "missing" });
      } else if (key in locked && locked[key] !== hashValue(value)) {
        entries.push({ key, source: value, reason: "stale" });
      }
    }
    result.targets[target] = entries;
  }
  return result;
}
