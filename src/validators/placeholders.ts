/**
 * Bir çeviri metnindeki interpolasyon yer tutucularını çıkarır.
 * Desteklenen biçimler: {name}, {{name}}, %s/%d/%i/%f, $t(key) (i18next nested).
 */
export function extractPlaceholders(text: string): string[] {
  const found: string[] = [];
  const patterns = [
    /\{\{\s*[\w.-]+\s*\}\}/g, // {{name}}
    /(?<!\{)\{\s*[\w.-]+\s*\}(?!\})/g, // {name}
    /%[sdif]/g, // printf
    /\$t\([^)]*\)/g, // i18next nesting
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      found.push(match[0].replace(/\s+/g, ""));
    }
  }
  return found.sort();
}

/** Kaynak ve çevirideki yer tutucu kümeleri eşleşmiyorsa farkları döndürür. */
export function placeholderMismatch(
  source: string,
  translated: string
): { missing: string[]; extra: string[] } | null {
  const src = extractPlaceholders(source);
  const dst = extractPlaceholders(translated);
  const missing = src.filter((p) => !dst.includes(p));
  const extra = dst.filter((p) => !src.includes(p));
  return missing.length || extra.length ? { missing, extra } : null;
}
