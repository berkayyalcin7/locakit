# locakit

**Deterministic i18n engine for AI agents.** Your coding agent translates; locakit does everything else — key diffing, staleness tracking, placeholder validation and safe JSON writes.

No translation API. No SaaS account. No API keys. Zero runtime dependencies.

## Why

Every AI localization tool ships its own LLM pipeline: configure a provider, pay per token, hope the model gets your product's tone right from a JSON blob. Meanwhile you already have an agent (Claude Code, Cursor, Copilot) that **reads your codebase all day** — it knows `home` is a nav label and not a building, because it can open the component and look.

locakit splits the job the right way:

| | Who does it |
|---|---|
| Detect missing / stale keys | **locakit** (deterministic, lockfile-based) |
| Understand context, translate | **your agent** (already paid for, already knows your code) |
| Validate placeholders, glossary, language rules | **locakit** (deterministic, CI-friendly) |
| Write JSON safely, preserve key order | **locakit** |

## Quick start

```bash
npm i -D locakit
npx locakit init
```

Edit `locakit.config.json`:

```json
{
  "source": "en",
  "targets": ["tr", "de"],
  "files": "locales/{locale}.json",
  "context": "Developer portfolio & blog. Tone: professional but warm. Formal address (Sie/siz).",
  "glossary": ["locakit", "GitHub"]
}
```

Then let your agent drive:

```bash
npx locakit diff --json     # what needs translating (+ your context & glossary)
# → agent reads key usage in code, translates, produces a patch
echo '{"tr":{"auth.title":"Hoş geldiniz"}}' | npx locakit apply -
npx locakit check           # exit 1 on broken placeholders, missing keys, glossary violations
```

A ready-made Claude Code skill that implements this loop lives in [`skill/i18n-sync/`](skill/i18n-sync/SKILL.md) — copy it to `.claude/skills/` or install via ECC.

## Commands

| Command | Purpose |
|---|---|
| `locakit init` | Scaffold `locakit.config.json` |
| `locakit diff [--json]` | List `missing` and `stale` keys per target |
| `locakit apply <file \| ->` | Write a translation patch; rejects keys absent from the source locale |
| `locakit check [--json] [--strict]` | Validate all targets; CI-friendly exit codes |
| `locakit lock` | Accept current translations as up to date |

### Staleness tracking

`locakit.lock` stores a hash of each source string at translation time. When source copy changes, `diff` reports the key as `stale` for every affected language — the class of bug where English says "Sign in with passkey" and German still says "Sign in with password".

### Validation rules

- **placeholder-mismatch** *(error)* — `{name}`, `{{count}}`, `%s`, `$t(...)` must survive translation intact
- **glossary** *(error)* — configured terms must appear unchanged
- **missing-key / empty-value** *(error)*
- **orphan-key** *(warning)* — translation exists but source key is gone
- **Turkish pack** *(warnings)* — `tr/suffix-after-placeholder` (`{name}'in` breaks vowel harmony at runtime), `tr/dotless-uppercase-i` (`GIRIS` → `GİRİŞ`), `tr/whitespace`

Language packs are pluggable; Turkish ships first because generic tools get it wrong the most. PRs for other languages welcome.

## Programmatic API

```ts
import { diff, apply, check } from "locakit";

const pending = diff(process.cwd());
const result = apply(process.cwd(), { tr: { "home": "Ana Sayfa" } });
const issues = check(process.cwd());
```

## CI

```yaml
- run: npx locakit check   # fails the build on invalid or missing translations
```

## License

MIT © [Berkay Yalçın](https://berkayyalcin.dev)
