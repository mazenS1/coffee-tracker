/**
 * Coffee-origin countries from contires file.
 * Each entry: Arabic name + ISO 3166-1 alpha-2 code for flag emoji.
 */
export const COFFEE_COUNTRIES: { name: string; code: string }[] = [
  { name: "البرازيل", code: "BR" },
  { name: "فيتنام", code: "VN" },
  { name: "كولومبيا", code: "CO" },
  { name: "إندونيسيا", code: "ID" },
  { name: "إثيوبيا", code: "ET" },
  { name: "الهند", code: "IN" },
  { name: "هندوراس", code: "HN" },
  { name: "أوغندا", code: "UG" },
  { name: "المكسيك", code: "MX" },
  { name: "بيرو", code: "PE" },
  { name: "غواتيمالا", code: "GT" },
  { name: "نيكاراغوا", code: "NI" },
  { name: "ساحل العاج", code: "CI" },
  { name: "تنزانيا", code: "TZ" },
  { name: "كينيا", code: "KE" },
  { name: "إل سلفادور", code: "SV" },
  { name: "كوستاريكا", code: "CR" },
  { name: "بابوا غينيا الجديدة", code: "PG" },
  { name: "لاوس", code: "LA" },
  { name: "جمهورية الكونغو الديمقراطية", code: "CD" },
  { name: "مدغشقر", code: "MG" },
  { name: "بوروندي", code: "BI" },
  { name: "رواندا", code: "RW" },
  { name: "الكاميرون", code: "CM" },
  { name: "تايلاند", code: "TH" },
  { name: "الفلبين", code: "PH" },
  { name: "فنزويلا", code: "VE" },
  { name: "الإكوادور", code: "EC" },
  { name: "بوليفيا", code: "BO" },
  { name: "بنما", code: "PA" },
  { name: "هايتي", code: "HT" },
  { name: "جمهورية الدومينيكان", code: "DO" },
  { name: "تيمور الشرقية", code: "TL" },
  { name: "توغو", code: "TG" },
  { name: "غانا", code: "GH" },
  { name: "غينيا", code: "GN" },
  { name: "سيراليون", code: "SL" },
  { name: "نيجيريا", code: "NG" },
  { name: "اليمن", code: "YE" },
  { name: "الصين", code: "CN" },
  { name: "ميانمار", code: "MM" },
  { name: "كمبوديا", code: "KH" },
  { name: "فانواتو", code: "VU" },
];

/** Convert ISO country code to flag emoji (e.g. "BR" → 🇧🇷) */
export function getFlagEmoji(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}
