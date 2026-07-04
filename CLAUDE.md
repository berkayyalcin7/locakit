# locakit

Deterministic i18n engine for AI agents. npm paketi (sıfır bağımlılık, TypeScript, ESM) + Claude Code skill'i (`skill/i18n-sync/`).

## Mimari ilkeler

- **Pakette LLM çağrısı YOK.** Çeviri zekâsı skill'de/agent'ta yaşar; paket deterministik kalır (diff, lockfile, doğrulama, güvenli yazma). Bu ayrım ürünün konumlandırmasıdır — pakete AI/API bağımlılığı eklemeyin.
- Sıfır runtime bağımlılık: yalnızca `node:` yerleşikleri. Yeni bağımlılık eklemeden önce iki kez düşünün.
- Dil paketleri (`src/validators/<lang>.ts`) uyarı üretir, hata değil; genel kurallar (placeholder, glossary) hata üretir.
- CLI çıktıları: insan için Türkçe olabilir, `--json` çıktıları İngilizce/nötr şema kalır (agent'lar tüketiyor).
- Kod yorumları Türkçe (maintainer dili), README ve SKILL.md İngilizce (npm/ECC kitlesi).

## Komutlar

- Build: `npm run build` — Test: `npm test` (build + node --test)
- Test dosyaları `dist/` üzerinden import eder; testten önce build şart.

## Yayın akışı

`npm version <patch|minor|major>` → `npm publish` (prepublishOnly testleri koşar). trkit ile aynı akış.
