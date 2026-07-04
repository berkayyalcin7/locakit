# locakit — Yol Haritası

> Konumlandırma: **"Bring your own agent" i18n motoru.** Paket deterministik işleri yapar
> (diff, lockfile, doğrulama, güvenli yazma), çeviriyi kullanıcının zaten sahip olduğu
> agent (Claude Code vb.) yapar. API key yok, SaaS hesabı yok, token faturası yok.
> İkinci ayrıştırıcı: **Türkçe'yi gerçekten doğru yapan tek araç** (dil paketi mimarisi).

## Faz 0 — MVP çekirdek ✅ (tamamlandı)

- [x] Sıfır bağımlılıklı TypeScript paket iskeleti (ESM, Node 20+, `node:test`)
- [x] `init` / `diff` / `apply` / `check` / `lock` komutları
- [x] Lockfile ile bayatlama (stale) takibi — kaynak metin değişince hedefler işaretlenir
- [x] Placeholder paritesi, glossary, eksik/boş/artık key doğrulaması
- [x] Türkçe dil paketi v1: `suffix-after-placeholder`, `dotless-uppercase-i`, `whitespace`
- [x] ECC formatında `i18n-sync` skill taslağı (`skill/i18n-sync/SKILL.md`)
- [x] README (İngilizce, npm kitlesi), testler (birim + uçtan uca)

## Faz 1 — Rodaj (dogfooding) — sıradaki iş

- [ ] **Portfolyo sitesine İngilizce dil desteği ekle ve locakit ile çevir.**
      Bu hem gerçek test, hem blog yazısının kendisi, hem canlı referans olur.
- [ ] Skill'i `.claude/skills/i18n-sync/` olarak portfolyo projesine kur, akışı uçtan uca yaşa
- [ ] Sürtünme noktalarını GitHub issue olarak locakit reposuna işle
- [ ] Türkçe dil paketini gerçek kullanımda genişlet (yeni sezgisel kurallar)

## Faz 2 — Yayın

- [ ] GitHub reposu aç: `berkayyalcin7/locakit` (👤 **sizin yapmanız gereken** — repo oluşturup push)
- [ ] `npm publish` v0.1.0 (👤 **sizin yapmanız gereken** — trkit'teki npm hesabıyla)
- [ ] GitHub Actions: test + `locakit check` örnek workflow
- [ ] npm README'ye demo GIF/asciinema

## Faz 3 — ECC PR'ı (görünürlük hamlesi)

- [ ] ECC repo'sunu fork'la, `skills/i18n-sync/` olarak skill'i ekle
      (format hazır: `origin: community`, "When to Activate" bölümü, Related linkleri)
- [ ] PR açıklamasında locakit'i motor olarak tanıt — ~200K yıldızlı repoda kalıcı link
- [ ] ECC'nin CONTRIBUTING.md kurallarına uygunluk kontrolü (conventional commits: `feat(skills):`)
- [ ] Kabul sonrası: README'ye "Available in ECC" rozeti

## Faz 4 — Tanıtım (blog + araçlar)

- [ ] Blog yazısı (TR): "JSON çeviri eziyetine agent-native çözüm: locakit"
      — pazar analizi (lingo.dev vs. neden farklıyız), mimari karar (LLM'siz paket), ders çıkarımları
- [ ] `/araclar/locakit` sayfası: trkit playground'u gibi canlı demo
      (tarayıcıda örnek en.json + tr.json ile diff/check simülasyonu)
- [ ] Projeler bölümüne kart; blog yazısından link
- [ ] Hacker News "Show HN" + r/i18n, r/webdev denemesi (İngilizce README ile)

## Faz 5 — Genişleme ve gelir (ürün tutarsa)

Sıralama esnek; sinyale göre önceliklendirilir:

- [ ] Dil paketleri: Almanca (bileşik kelime uzunluğu), Arapça/İbranice (RTL), Japonca (keigo)
      — topluluk PR'larına açık mimari zaten hazır
- [ ] Format desteği: YAML, gettext `.po`, iOS `.strings`, Android `strings.xml`
- [ ] `locakit extract`: koddaki hardcoded string'leri key'e çıkarma (skill ile birlikte)
- [ ] **Gelir seçenekleri (open-core):**
  - `locakit-pro` dil paketleri: derin TR kalite kuralları (sen/siz tutarlılık sözlüğü,
    ICU plural denetimi), kurumsal glossary yönetimi — tek seferlik lisans veya sponsorware
  - GitHub App (ECC-Tools modeli): PR'larda otomatik `locakit check` + çeviri önerisi
    yorumları — private repo'lar için aylık abonelik
  - Vibe-coding platformları (Lovable/Bolt kullanıcıları) için hazır entegrasyon şablonları
- [ ] npm haftalık indirme > 500 olursa: ayrı dokümantasyon sitesi (locakit.dev)

## Sizin yapmanız gerekenler (özet)

| Ne | Ne zaman | Not |
|---|---|---|
| GitHub reposu `locakit` oluştur + push | Faz 2 | `gh repo create locakit --public` yeterli |
| `npm publish` | Faz 2 | trkit'i yayınladığınız hesapla; isim şu an boş, kapılmadan yayınlamak iyi olur (v0.1.0 "reserve" yayını bugün bile yapılabilir) |
| ECC fork + PR gönderimi | Faz 3 | PR'ı ben hazırlarım, gönderim sizin hesabınızdan |
| Blog yazısı onayı/rötuşu | Faz 4 | Taslağı ben yazarım |

## İlkeler (değişmez)

1. Pakete asla LLM/API bağımlılığı ekleme — deterministik çekirdek, ürünün kimliği.
2. Genel SaaS/CLI yarışına girme (o savaş lingo.dev'in) — agent-native + dil derinliği nişinde kal.
3. Her özellik önce kendi projelerimizde rodaja girer, sonra yayınlanır.
