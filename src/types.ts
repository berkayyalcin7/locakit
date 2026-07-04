/** locakit.config.json şeması. */
export interface LocakitConfig {
  /** Kaynak dil kodu, ör. "en". */
  source: string;
  /** Hedef dil kodları, ör. ["tr", "de"]. */
  targets: string[];
  /** Locale dosya yolu şablonu; {locale} yer tutucusu zorunlu. Ör: "locales/{locale}.json" */
  files: string;
  /**
   * Agent'a aktarılacak serbest metin bağlam: ürünün ne olduğu, ton (resmî/samimi),
   * hedef kitle, çevrilmeyecek terimler vb. locakit bunu yorumlamaz; diff çıktısında
   * olduğu gibi geçirir.
   */
  context?: string;
  /** Çevrilmeden bırakılacak terimler (marka adları vb.). check bunları doğrular. */
  glossary?: string[];
}

export type FlatRecord = Record<string, string>;

export interface DiffEntry {
  key: string;
  source: string;
  reason: "missing" | "stale";
}

export interface DiffResult {
  sourceLocale: string;
  context?: string;
  glossary?: string[];
  targets: Record<string, DiffEntry[]>;
}

export interface CheckIssue {
  target: string;
  key: string;
  level: "error" | "warning";
  rule: string;
  message: string;
}

/** apply girdisi: hedef dil -> düz key -> çeviri. */
export type TranslationPatch = Record<string, FlatRecord>;

/** locakit.lock: hedef dil -> key -> çeviri anındaki kaynak değer hash'i. */
export interface Lockfile {
  version: 1;
  targets: Record<string, Record<string, string>>;
}
