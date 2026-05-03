'use server'

import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { paddle } from '@/lib/paddle'
import { redirect } from 'next/navigation'

export async function checkPlanAction(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'free'
  const { data } = await supabase.from('users').select('plan').eq('id', user.id).single()
  return data?.plan ?? 'free'
}

export async function getPaddlePortalAction(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('paddle_customer_id')
    .eq('id', user.id)
    .single()

  const customerId = data?.paddle_customer_id
  if (!customerId) return null

  try {
    const response = await paddle.customers.generateAuthToken(customerId)
    return `https://customer.paddle.com?auth_token=${response.customerAuthToken}`
  } catch (err) {
    console.error('[Paddle] generateAuthToken failed:', err)
    return null
  }
}

export async function cancelSubscriptionAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: userData } = await supabase
    .from('users')
    .select('paddle_sub_id, stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (userData?.paddle_sub_id) {
    await paddle.subscriptions.cancel(userData.paddle_sub_id, { effectiveFrom: 'next_billing_period' })
    // Don't downgrade to free here — the webhook will set subscription_status=canceled
    // and the user retains Pro access until subscription_ends_at
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
    .select('paddle_sub_id, stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (userData?.paddle_sub_id) {
    await paddle.subscriptions.cancel(userData.paddle_sub_id, { effectiveFrom: 'immediately' }).catch(() => null)
  }
  if (userData?.stripe_customer_id) {
    const subs = await getStripe().subscriptions.list({ customer: userData.stripe_customer_id, status: 'active', limit: 1 })
    if (subs.data[0]) {
      await getStripe().subscriptions.cancel(subs.data[0].id).catch(() => null)
    }
  }

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

  await supabase.from('users').delete().eq('id', user.id)
  await supabase.auth.signOut()

  redirect('/')
}
