'use server'

import { createClient } from '@/lib/supabase/server'
import { cancelPayPalSubscription } from '@/lib/paypal'
import { getStripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'

export async function cancelSubscriptionAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: userData } = await supabase
    .from('users')
    .select('paypal_sub_id, stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (userData?.paypal_sub_id) {
    await cancelPayPalSubscription(userData.paypal_sub_id)
    await supabase.from('users').update({ plan: 'free', paypal_sub_id: null, subscription_ends_at: null }).eq('id', user.id)
  }

  if (userData?.stripe_customer_id) {
    const subs = await getStripe().subscriptions.list({ customer: userData.stripe_customer_id, status: 'active', limit: 1 })
    if (subs.data[0]) {
      await getStripe().subscriptions.cancel(subs.data[0].id)
    }
    await supabase.from('users').update({ plan: 'free', subscription_ends_at: null }).eq('id', user.id)
  }

  return { ok: true }
}

export async function deleteAccountAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: userData } = await supabase
    .from('users')
    .select('paypal_sub_id, stripe_customer_id')
    .eq('id', user.id)
    .single()

  // Cancel active subscriptions
  if (userData?.paypal_sub_id) {
    await cancelPayPalSubscription(userData.paypal_sub_id).catch(() => null)
  }
  if (userData?.stripe_customer_id) {
    const subs = await getStripe().subscriptions.list({ customer: userData.stripe_customer_id, status: 'active', limit: 1 })
    if (subs.data[0]) {
      await getStripe().subscriptions.cancel(subs.data[0].id).catch(() => null)
    }
  }

  // Delete storage files
  const { data: brandingData } = await supabase
    .from('branding')
    .select('logo_url, watermark_url')
    .eq('user_id', user.id)
    .single()

  if (brandingData?.logo_url) {
    await supabase.storage.from('logos').remove([brandingData.logo_url]).catch(() => null)
  }
  if (brandingData?.watermark_url) {
    await supabase.storage.from('watermarks').remove([brandingData.watermark_url]).catch(() => null)
  }

  // Delete user record (cascades to all related rows)
  await supabase.from('users').delete().eq('id', user.id)
  await supabase.auth.signOut()

  redirect('/')
}
