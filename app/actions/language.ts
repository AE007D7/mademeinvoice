'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { LangCode } from '@/lib/i18n'

export async function setUiLanguage(lang: LangCode) {
  const store = await cookies()
  store.set('mmi_ui_lang', lang, { path: '/', maxAge: 60 * 60 * 24 * 365 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('branding').upsert(
      { user_id: user.id, ui_language: lang },
      { onConflict: 'user_id' }
    )
  }
}

export async function setInvoiceLanguage(lang: LangCode) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('branding').upsert(
    { user_id: user.id, invoice_language: lang },
    { onConflict: 'user_id' }
  )
}
