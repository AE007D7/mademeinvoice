export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { EventName } from '@paddle/paddle-node-sdk'
import { paddle } from '@/lib/paddle'
import { createAdminClient } from '@/lib/supabase/admin'

type SubData = {
  id: string
  customerId: string
  customData: Record<string, string> | null
  status: string
  nextBilledAt: string | null
  startedAt: string | null
  currentBillingPeriod: { startsAt: string; endsAt: string } | null
}

type TxnData = {
  id: string
  subscriptionId: string | null
  customData: Record<string, string> | null
  billingPeriod: { startsAt: string; endsAt: string } | null
}

async function resolveUserId(
  supabase: ReturnType<typeof createAdminClient>,
  customData: Record<string, string> | null,
  customerId: string,
): Promise<string | null> {
  // Primary: customData.user_id passed at checkout
  const uid = customData?.user_id
  if (uid) return uid

  // Fallback: look up by Paddle customer email
  console.warn('[Paddle webhook] customData.user_id missing — attempting email fallback')
  try {
    const customer = await paddle.customers.get(customerId)
    const email = customer.email
    if (email) {
      const { data } = await supabase.from('users').select('id').eq('email', email).single()
      if (data?.id) {
        console.log(`[Paddle webhook] Matched user by email: ${email}`)
        return data.id
      }
    }
  } catch (err) {
    console.error('[Paddle webhook] Email fallback failed:', err)
  }

  // Last resort: log the full payload so it can be fixed manually
  console.error('[Paddle webhook] Could not match user — payload customData:', customData, 'customerId:', customerId)
  return null
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('paddle-signature') ?? ''
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET ?? ''

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any
  try {
    event = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature)
  } catch {
    console.warn('[Paddle webhook] Signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (!event) {
    return NextResponse.json({ error: 'Empty event' }, { status: 400 })
  }

  const supabase = createAdminClient()

  console.log(`[Paddle webhook] Received: ${event.eventType}`)

  try {
    switch (event.eventType) {

      // ─── New subscription created (trial or immediate) ────────────────────
      case EventName.SubscriptionCreated: {
        const sub = event.data as SubData
        const userId = await resolveUserId(supabase, sub.customData, sub.customerId)
        if (!userId) break

        const endsAt = sub.currentBillingPeriod?.endsAt ?? sub.nextBilledAt
        const status = sub.status === 'trialing' ? 'trialing' : 'active'

        await supabase.from('users').update({
          plan: 'pro',
          subscription_status: status,
          paddle_sub_id: sub.id,
          paddle_customer_id: sub.customerId,
          subscription_started_at: sub.startedAt,
          ...(endsAt ? { subscription_ends_at: endsAt } : {}),
        }).eq('id', userId)

        console.log(`[Paddle webhook] SubscriptionCreated — user ${userId} → pro/${status}`)
        break
      }

      // ─── Trial ended, first real payment succeeded ────────────────────────
      case EventName.SubscriptionActivated: {
        const sub = event.data as SubData
        const userId = await resolveUserId(supabase, sub.customData, sub.customerId)
        if (!userId) break

        const endsAt = sub.currentBillingPeriod?.endsAt ?? sub.nextBilledAt

        await supabase.from('users').update({
          plan: 'pro',
          subscription_status: 'active',
          paddle_sub_id: sub.id,
          paddle_customer_id: sub.customerId,
          ...(endsAt ? { subscription_ends_at: endsAt } : {}),
        }).eq('id', userId)

        console.log(`[Paddle webhook] SubscriptionActivated — user ${userId} → pro/active`)
        break
      }

      // ─── Plan changed, payment method updated, dates shifted ──────────────
      case EventName.SubscriptionUpdated: {
        const sub = event.data as SubData
        const endsAt = sub.currentBillingPeriod?.endsAt ?? sub.nextBilledAt

        await supabase.from('users').update({
          subscription_status: sub.status,
          ...(endsAt ? { subscription_ends_at: endsAt } : {}),
        }).eq('paddle_sub_id', sub.id)

        console.log(`[Paddle webhook] SubscriptionUpdated — sub ${sub.id} → ${sub.status}`)
        break
      }

      // ─── Canceled — keep Pro until end of paid period ─────────────────────
      case EventName.SubscriptionCanceled: {
        const sub = event.data as SubData
        // Keep plan=pro so user retains access until subscription_ends_at.
        // A future job or periodic check should downgrade once the date passes.
        await supabase.from('users').update({
          subscription_status: 'canceled',
          // subscription_ends_at stays — user has access until that date
        }).eq('paddle_sub_id', sub.id)

        console.log(`[Paddle webhook] SubscriptionCanceled — sub ${sub.id} → canceled (Pro access retained until period ends)`)
        break
      }

      // ─── Subscription paused ──────────────────────────────────────────────
      case EventName.SubscriptionPaused: {
        const sub = event.data as SubData
        await supabase.from('users').update({
          subscription_status: 'paused',
        }).eq('paddle_sub_id', sub.id)

        console.log(`[Paddle webhook] SubscriptionPaused — sub ${sub.id}`)
        break
      }

      // ─── Payment collected (renewals) ─────────────────────────────────────
      case EventName.TransactionCompleted: {
        const txn = event.data as TxnData
        const userId = txn.customData?.user_id ?? null
        const subId  = txn.subscriptionId

        // Add 2-day buffer to the period end to avoid edge-of-period gaps
        const rawEnd = txn.billingPeriod?.endsAt
        const endsAt = rawEnd
          ? new Date(new Date(rawEnd).getTime() + 2 * 86400_000).toISOString()
          : (() => { const d = new Date(); d.setDate(d.getDate() + 32); return d.toISOString() })()

        if (userId) {
          await supabase.from('users').update({
            subscription_status: 'active',
            subscription_ends_at: endsAt,
          }).eq('id', userId)
        } else if (subId) {
          await supabase.from('users').update({
            subscription_status: 'active',
            subscription_ends_at: endsAt,
          }).eq('paddle_sub_id', subId)
        }

        console.log(`[Paddle webhook] TransactionCompleted — extended to ${endsAt}`)
        break
      }

      // ─── Payment failed ───────────────────────────────────────────────────
      case EventName.TransactionPaymentFailed: {
        const txn = event.data as TxnData
        const subId = txn.subscriptionId
        if (subId) {
          await supabase.from('users').update({
            subscription_status: 'past_due',
          }).eq('paddle_sub_id', subId)
        }
        console.log(`[Paddle webhook] TransactionPaymentFailed — sub ${subId} → past_due`)
        break
      }

      default:
        console.log(`[Paddle webhook] Unhandled event: ${event.eventType}`)
    }
  } catch (err) {
    // Always 200 to Paddle — DB errors should not cause retries
    console.error(`[Paddle webhook] DB error on ${event.eventType}:`, err)
  }

  return NextResponse.json({ ok: true })
}
