import { test } from "node:test";
import assert from "node:assert/strict";
import { flatten, unflatten } from "../dist/locales.js";

test("flatten: iç içe objeyi dot-key'lere açar", () => {
  const flat = flatten({ auth: { welcome: { title: "Hi" } }, home: "Home" });
  assert.deepEqual(flat, { "auth.welcome.title": "Hi", home: "Home" });
});

test("flatten: dizileri indeks key'iyle açar, string olmayanları atlar", () => {
  const flat = flatten({ list: ["a", "b"], count: 3 });
  assert.deepEqual(flat, { "list.0": "a", "list.1": "b" });
});

test("unflatten: flatten'ın tersidir (roundtrip)", () => {
  const original = { auth: { title: "Hi", items: ["x", "y"] }, home: "Home" };
  assert.deepEqual(unflatten(flatten(original)), original);
});
