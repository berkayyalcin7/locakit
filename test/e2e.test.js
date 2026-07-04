import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { diff, apply, check } from "../dist/index.js";

function scaffold() {
  const dir = mkdtempSync(join(tmpdir(), "locakit-"));
  writeFileSync(
    join(dir, "locakit.config.json"),
    JSON.stringify({
      source: "en",
      targets: ["tr"],
      files: "locales/{locale}.json",
      context: "Test app",
      glossary: ["Acme"],
    })
  );
  mkdirSync(join(dir, "locales"));
  writeFileSync(
    join(dir, "locales/en.json"),
    JSON.stringify({ auth: { title: "Welcome to Acme, {name}!" }, home: "Home" })
  );
  return dir;
}

test("diff → apply → check akışı uçtan uca çalışır", () => {
  const dir = scaffold();

  // 1. diff: her şey eksik
  let d = diff(dir);
  assert.equal(d.targets.tr.length, 2);
  assert.equal(d.targets.tr[0].reason, "missing");

  // 2. apply: çevirileri yaz
  const result = apply(dir, {
    tr: { "auth.title": "Acme'ye hoş geldin {name}!", home: "Ana Sayfa" },
  });
  assert.equal(result.written.tr, 2);

  // 3. diff artık temiz
  d = diff(dir);
  assert.equal(d.targets.tr.length, 0);

  // 4. check: hata yok
  const issues = check(dir).filter((i) => i.level === "error");
  assert.deepEqual(issues, []);

  // 5. kaynak değişince key stale olur
  writeFileSync(
    join(dir, "locales/en.json"),
    JSON.stringify({ auth: { title: "Welcome to Acme Cloud, {name}!" }, home: "Home" })
  );
  d = diff(dir);
  assert.deepEqual(d.targets.tr.map((e) => [e.key, e.reason]), [["auth.title", "stale"]]);
});

test("apply: kaynakta olmayan key'i reddeder (halüsinasyon emniyeti)", () => {
  const dir = scaffold();
  const result = apply(dir, { tr: { "made.up.key": "x" } });
  assert.equal(result.written.tr, 0);
  assert.equal(result.skipped[0].reason, "kaynakta böyle bir key yok");
});

test("check: placeholder ve glossary ihlallerini hata olarak yakalar", () => {
  const dir = scaffold();
  apply(dir, { tr: { "auth.title": "Akme'ye hoş geldin!", home: "Ana Sayfa" } });
  const issues = check(dir);
  const rules = issues.filter((i) => i.level === "error").map((i) => i.rule).sort();
  assert.deepEqual(rules, ["glossary", "placeholder-mismatch"]);
});

test("writeLocale: hedef dosya kaynak key sırasını izler", () => {
  const dir = scaffold();
  // Ters sırada gönderilse bile dosya kaynak sırasıyla yazılmalı
  apply(dir, { tr: { home: "Ana Sayfa", "auth.title": "Acme'ye hoş geldin {name}!" } });
  const written = JSON.parse(readFileSync(join(dir, "locales/tr.json"), "utf8"));
  assert.deepEqual(Object.keys(written), ["auth", "home"]);
});
