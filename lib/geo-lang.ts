import type { LangCode } from './i18n'

// ISO 3166-1 alpha-2 country code → site language
// Only maps to languages supported by the app (en/fr/es/de/ar/pt/it).
// Countries not listed default to 'en'.
const COUNTRY_LANG: Record<string, LangCode> = {
  // French
  FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr', SN: 'fr', CI: 'fr',
  CM: 'fr', MG: 'fr', ML: 'fr', BF: 'fr', NE: 'fr', TD: 'fr',
  GN: 'fr', BJ: 'fr', TG: 'fr', GA: 'fr', CG: 'fr', CD: 'fr',
  CF: 'fr', RW: 'fr', BI: 'fr', DJ: 'fr', HT: 'fr', VU: 'fr',

  // Spanish
  ES: 'es', MX: 'es', CO: 'es', PE: 'es', VE: 'es', CL: 'es',
  EC: 'es', GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es',
  PY: 'es', SV: 'es', NI: 'es', CR: 'es', PA: 'es', UY: 'es',
  AR: 'es', GQ: 'es', PH: 'es',

  // German
  DE: 'de', AT: 'de', CH: 'de', LI: 'de',

  // Arabic
  SA: 'ar', EG: 'ar', AE: 'ar', IQ: 'ar', SY: 'ar', YE: 'ar',
  JO: 'ar', LB: 'ar', KW: 'ar', OM: 'ar', QA: 'ar', BH: 'ar',
  LY: 'ar', TN: 'ar', DZ: 'ar', MA: 'ar', SD: 'ar', SO: 'ar',
  PS: 'ar', KM: 'ar', MR: 'ar',

  // Portuguese
  PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt', CV: 'pt', ST: 'pt',
  GW: 'pt', TL: 'pt',

  // Italian
  IT: 'it', SM: 'it', VA: 'it',
}

export function countryToLang(countryCode: string | null | undefined): LangCode {
  if (!countryCode) return 'en'
  return COUNTRY_LANG[countryCode.toUpperCase()] ?? 'en'
}
