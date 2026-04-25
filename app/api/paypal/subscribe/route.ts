import { createClient } from '@/lib/supabase/server'
import { getSubscription } from '@/lib/paypal'
import { NextRequest, NextResponse } from 'next/server'

const VALID_STATUSES = ['ACTIVE', 'APPROVAL_PENDING', 'APPROVED']

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let subscriptionID: string
  try {
    const body = await request.json() as { subscriptionID?: string }
    subscriptionID = body.subscriptionID ?? ''
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!subscriptionID) {
    return NextResponse.json({ error: 'Missing subscriptionID' }, { status: 400 })
  }

  let sub
  try {
    sub = await getSubscription(subscriptionID)
  } catch (err) {
    console.error('[paypal/subscribe] getSubscription error:', err)
    return NextResponse.json({ error: 'Failed to verify subscription with PayPal' }, { status: 400 })
  }

  if (!VALID_STATUSES.includes(sub.status)) {
    return NextResponse.json({ error: `Unexpected subscription status: ${sub.status}` }, { status: 400 })
  }

  if (sub.plan_id !== process.env.PAYPAL_PLAN_ID_PRO_MONTHLY) {
    return NextResponse.json({ error: 'Plan ID mismatch' }, { status: 400 })
  }

  const { error: dbError } = await supabase
    .from('users')
    .update({
      plan: 'pro',
      paypal_sub_id: subscriptionID,
      subscription_ends_at: sub.billing_info?.next_billing_time ?? null,
    })
    .eq('id', user.id)

  if (dbError) {
    console.error('[paypal/subscribe] DB update error:', dbError)
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
