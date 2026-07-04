import { test } from "node:test";
import assert from "node:assert/strict";
import { placeholderMismatch, extractPlaceholders } from "../dist/validators/placeholders.js";
import { checkTurkish } from "../dist/validators/tr.js";

test("extractPlaceholders: {name}, {{name}}, %s ve $t() yakalar", () => {
  assert.deepEqual(
    extractPlaceholders("Hi {name}, {{count}} items, %s, $t(nested.key)"),
    ["$t(nested.key)", "%s", "{name}", "{{count}}"]
  );
});

test("placeholderMismatch: eksik ve fazla yer tutucuları raporlar", () => {
  const result = placeholderMismatch("Hello {name}!", "Merhaba {isim}!");
  assert.deepEqual(result, { missing: ["{name}"], extra: ["{isim}"] });
  assert.equal(placeholderMismatch("Hello {name}!", "Merhaba {name}!"), null);
});

test("checkTurkish: yer tutucu sonrası kesme işaretli eki uyarır", () => {
  const warnings = checkTurkish("k", "{name}'in profili");
  assert.equal(warnings.length, 1);
  assert.equal(warnings[0].rule, "tr/suffix-after-placeholder");
});

test("checkTurkish: noktasız büyük I kalıplarını uyarır", () => {
  const warnings = checkTurkish("k", "IPTAL");
  assert.equal(warnings[0].rule, "tr/dotless-uppercase-i");
});

test("checkTurkish: temiz metinde uyarı üretmez", () => {
  assert.deepEqual(checkTurkish("k", "Profilinizi görüntüleyin: {name}"), []);
});
