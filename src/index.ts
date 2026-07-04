export { diff } from "./diff.js";
export { apply, lockCurrent } from "./apply.js";
export { check } from "./check.js";
export { flatten, unflatten, readLocale, writeLocale } from "./locales.js";
export { extractPlaceholders, placeholderMismatch } from "./validators/placeholders.js";
export { checkTurkish } from "./validators/tr.js";
export type {
  LocakitConfig,
  DiffResult,
  DiffEntry,
  CheckIssue,
  TranslationPatch,
  FlatRecord,
  Lockfile,
} from "./types.js";
