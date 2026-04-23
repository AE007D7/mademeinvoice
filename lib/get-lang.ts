import { cookies } from 'next/headers'
import type { LangCode } from './i18n'

export async function getUiLang(): Promise<LangCode> {
  const store = await cookies()
  const lang = store.get('mmi_ui_lang')?.value
  return (lang as LangCode) ?? 'en'
}
