/**
 * Türkçe'ye özel doğrulama kuralları — locakit'in genel araçlardan ayrıştığı yer.
 * Kurallar hata değil uyarı üretir; --strict ile hataya çevrilebilir.
 */

export interface TrWarning {
  rule: string;
  message: string;
}

/**
 * Yer tutucudan hemen sonra kesme işaretiyle ek gelmesi ({name}'in, {count}'ta)
 * risklidir: ek, yer tutucunun alacağı gerçek değerle uyumlu olmayabilir
 * ("Ali'in" ✗). Cümleyi ekten kaçınacak şekilde kurmak gerekir.
 */
const SUFFIX_AFTER_PLACEHOLDER =
  /(\{\{?\s*[\w.-]+\s*\}?\}|%[sdif])['’][a-zçğıiöşü]+/giu;

/**
 * Büyük harfe çevrilmiş metinde ASCII "I" Türkçe'de neredeyse her zaman hatadır
 * (kırmızı → KIRMIZI doğru, ancak "IPTAL" hatalıdır; doğrusu "İPTAL").
 * Kaba sezgisel: tamamı büyük harf bir Türkçe kelimede "I" varsa ve kelimenin
 * küçük hali "ı" içermeyen yaygın kalıplardansa uyar. Yanlış pozitifleri
 * düşük tutmak için yalnız bilinen hatalı kalıpları yakalar.
 */
const SUSPICIOUS_UPPER_I = /\b(?:IPTAL|GIRIS|GIRIŞ|ILERI|IZIN|INDIR|ILETISIM|ISLEM|IMZA)\b/gu;

/** İngilizce'den kalma çift boşluk / baştaki-sondaki boşluk sorunları. */
const WHITESPACE_ISSUES = /^\s|\s$|\s{2}/;

export function checkTurkish(key: string, translated: string): TrWarning[] {
  const warnings: TrWarning[] = [];

  const suffixMatches = translated.match(SUFFIX_AFTER_PLACEHOLDER);
  if (suffixMatches) {
    warnings.push({
      rule: "tr/suffix-after-placeholder",
      message:
        `Yer tutucudan sonra kesme işaretli ek var (${suffixMatches.join(", ")}). ` +
        `Ek, çalışma zamanındaki değerle uyuşmayabilir; cümleyi ekten kaçınarak kurun.`,
    });
  }

  const upperIMatches = translated.match(SUSPICIOUS_UPPER_I);
  if (upperIMatches) {
    warnings.push({
      rule: "tr/dotless-uppercase-i",
      message:
        `Şüpheli büyük "I" kullanımı: ${upperIMatches.join(", ")}. ` +
        `Türkçe'de "i" büyürken "İ" olur (İPTAL, GİRİŞ). JS'de toUpperCase yerine ` +
        `toLocaleUpperCase("tr-TR") kullanın.`,
    });
  }

  if (WHITESPACE_ISSUES.test(translated)) {
    warnings.push({
      rule: "tr/whitespace",
      message: "Baş/son boşluk veya çift boşluk var.",
    });
  }

  return warnings;
}
