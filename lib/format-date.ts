import type { LangCode } from './i18n'

const LOCALE_MAP: Record<LangCode, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  es: 'es-ES',
  de: 'de-DE',
  ar: 'ar-SA',
  pt: 'pt-PT',
  it: 'it-IT',
}

export function formatDate(
  date: string | Date,
  lang: LangCode = 'en',
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString(LOCALE_MAP[lang] ?? 'en-US', options)
}

export function formatDateLong(date: string | Date, lang: LangCode = 'en'): string {
  return formatDate(date, lang, { year: 'numeric', month: 'long', day: 'numeric' })
}
