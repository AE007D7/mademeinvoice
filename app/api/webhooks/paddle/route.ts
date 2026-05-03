export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { EventName } from '@paddle/paddle-node-sdk'
import { paddle } from '@/lib/paddle'
import { createAdminClient } from '@/lib/supabase/admin'

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

  try {
    switch (event.eventType) {
      case EventName.SubscriptionActivated:
      case EventName.SubscriptionCreated: {
        const sub = event.data as {
          id: string
          customData: Record<string, string> | null
          nextBilledAt: string | null
        }
        const userId = sub.customData?.user_id
        if (!userId) break
        await supabase.from('users').update({
          plan: 'pro',
          paddle_sub_id: sub.id,
          ...(sub.nextBilledAt ? { subscription_ends_at: sub.nextBilledAt } : {}),
        }).eq('id', userId)
        console.log(`[Paddle webhook] ${event.eventType} — user ${userId} set to pro`)
        break
      }

      case EventName.TransactionCompleted: {
        const txn = event.data as {
          subscriptionId: string | null
          customData: Record<string, string> | null
          billingPeriod: { endsAt: string } | null
        }
        const userId = txn.customData?.user_id
        const subId = txn.subscriptionId
        const endsAt = txn.billingPeriod?.endsAt
          ? new Date(new Date(txn.billingPeriod.endsAt).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString()
          : (() => { const d = new Date(); d.setDate(d.getDate() + 32); return d.toISOString() })()

        if (userId) {
          await supabase.from('users').update({ subscription_ends_at: endsAt }).eq('id', userId)
        } else if (subId) {
          await supabase.from('users').update({ subscription_ends_at: endsAt }).eq('paddle_sub_id', subId)
        }
        console.log(`[Paddle webhook] TransactionCompleted — extended access to ${endsAt}`)
        break
      }

      case EventName.SubscriptionCanceled: {
        const sub = event.data as { id: string }
        await supabase.from('users').update({
          plan: 'free',
          paddle_sub_id: null,
          subscription_ends_at: null,
        }).eq('paddle_sub_id', sub.id)
        console.log(`[Paddle webhook] SubscriptionCanceled — sub ${sub.id} reverted to free`)
        break
      }

      default:
        console.log(`[Paddle webhook] Unhandled event: ${event.eventType}`)
    }
  } catch (err) {
    console.error('[Paddle webhook] DB error:', err)
  }

  return NextResponse.json({ ok: true })
}
