import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import type { FlatRecord } from "./types.js";

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

/**
 * İç içe locale JSON'unu "a.b.c" düz key'lere açar. Yalnızca string yapraklar
 * çevrilebilir kabul edilir; diğer tipler (sayı, boolean) olduğu gibi korunmak
 * üzere atlanır. Diziler indeks key'iyle ("list.0") açılır.
 */
export function flatten(obj: JsonValue, prefix = ""): FlatRecord {
  const out: FlatRecord = {};
  if (typeof obj === "string") {
    // Kök string olamaz; prefix boşsa geçersiz locale dosyasıdır.
    if (prefix) out[prefix] = obj;
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => Object.assign(out, flatten(item, prefix ? `${prefix}.${i}` : String(i))));
    return out;
  }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      Object.assign(out, flatten(v, prefix ? `${prefix}.${k}` : k));
    }
  }
  return out;
}

/**
 * Düz key'leri iç içe yapıya geri çevirir. Bir seviyedeki key'lerin tamamı
 * ardışık olmayan da olsa sayısal ise dizi üretilir.
 */
export function unflatten(flat: FlatRecord): JsonValue {
  const root: { [k: string]: JsonValue } = {};
  for (const [path, value] of Object.entries(flat)) {
    const parts = path.split(".");
    let node: { [k: string]: JsonValue } = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]!;
      if (typeof node[part] !== "object" || node[part] === null || Array.isArray(node[part])) {
        node[part] = {};
      }
      node = node[part] as { [k: string]: JsonValue };
    }
    node[parts[parts.length - 1]!] = value;
  }
  return arrayify(root);
}

function arrayify(node: JsonValue): JsonValue {
  if (node === null || typeof node !== "object") return node;
  if (Array.isArray(node)) return node.map(arrayify);
  const obj = node as { [k: string]: JsonValue };
  const keys = Object.keys(obj);
  for (const k of keys) obj[k] = arrayify(obj[k]!);
  if (keys.length > 0 && keys.every((k) => /^\d+$/.test(k))) {
    const arr: JsonValue[] = [];
    for (const k of keys.sort((a, b) => Number(a) - Number(b))) arr.push(obj[k]!);
    return arr;
  }
  return obj;
}

export function readLocale(path: string): FlatRecord {
  if (!existsSync(path)) return {};
  const parsed = JSON.parse(readFileSync(path, "utf8")) as JsonValue;
  return flatten(parsed);
}

/**
 * Hedef locale'i, key sırası kaynak dosyayı izleyecek şekilde yazar; kaynakta
 * olmayan (artık) key'ler sona eklenir ki diff'ler okunabilir kalsın.
 */
export function writeLocale(path: string, flat: FlatRecord, sourceOrder: string[]): void {
  const ordered: FlatRecord = {};
  for (const key of sourceOrder) {
    if (key in flat) ordered[key] = flat[key]!;
  }
  for (const key of Object.keys(flat)) {
    if (!(key in ordered)) ordered[key] = flat[key]!;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(unflatten(ordered), null, 2) + "\n", "utf8");
}
