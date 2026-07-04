import { loadConfig, localePath } from "./config.js";
import { readLocale } from "./locales.js";
import { placeholderMismatch } from "./validators/placeholders.js";
import { checkTurkish } from "./validators/tr.js";
import type { CheckIssue } from "./types.js";

/**
 * Tüm hedef dilleri doğrular. Hatalar (eksik key, boş değer, yer tutucu
 * uyumsuzluğu, glossary ihlali) CI'ı kırmalıdır; dile özel sezgisel kurallar
 * uyarı üretir.
 */
export function check(cwd: string): CheckIssue[] {
  const config = loadConfig(cwd);
  const source = readLocale(localePath(cwd, config, config.source));
  const issues: CheckIssue[] = [];

  for (const target of config.targets) {
    const translated = readLocale(localePath(cwd, config, target));
    const lang = target.split("-")[0]!.toLowerCase();

    for (const [key, sourceValue] of Object.entries(source)) {
      const value = translated[key];

      if (value === undefined) {
        issues.push({
          target,
          key,
          level: "error",
          rule: "missing-key",
          message: "Çeviri eksik.",
        });
        continue;
      }
      if (value.trim() === "") {
        issues.push({
          target,
          key,
          level: "error",
          rule: "empty-value",
          message: "Çeviri boş.",
        });
        continue;
      }

      const mismatch = placeholderMismatch(sourceValue, value);
      if (mismatch) {
        const parts: string[] = [];
        if (mismatch.missing.length) parts.push(`eksik: ${mismatch.missing.join(", ")}`);
        if (mismatch.extra.length) parts.push(`fazla: ${mismatch.extra.join(", ")}`);
        issues.push({
          target,
          key,
          level: "error",
          rule: "placeholder-mismatch",
          message: `Yer tutucular kaynakla uyuşmuyor (${parts.join("; ")}).`,
        });
      }

      for (const term of config.glossary ?? []) {
        if (sourceValue.includes(term) && !value.includes(term)) {
          issues.push({
            target,
            key,
            level: "error",
            rule: "glossary",
            message: `Glossary terimi "${term}" çeviride korunmamış.`,
          });
        }
      }

      if (lang === "tr") {
        for (const warning of checkTurkish(key, value)) {
          issues.push({ target, key, level: "warning", ...warning });
        }
      }
    }

    // Kaynakta olmayan artık key'ler: temizlik uyarısı
    for (const key of Object.keys(translated)) {
      if (!(key in source)) {
        issues.push({
          target,
          key,
          level: "warning",
          rule: "orphan-key",
          message: "Kaynakta karşılığı olmayan artık key.",
        });
      }
    }
  }

  return issues;
}
