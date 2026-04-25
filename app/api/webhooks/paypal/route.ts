export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhook } from '@/lib/paypal'
import { createAdminClient } from '@/lib/supabase/admin'

type PayPalEvent = {
  event_type: string
  resource: {
    id: string
    billing_agreement_id?: string
    billing_info?: { next_billing_time?: string }
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  const valid = await verifyWebhook(request.headers, rawBody)
  if (!valid) {
    console.warn('[PayPal webhook] Signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: PayPalEvent
  try {
    event = JSON.parse(rawBody) as PayPalEvent
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.RE-ACTIVATED': {
        const nextBilling = event.resource.billing_info?.next_billing_time
        await supabase
          .from('users')
          .update({
            plan: 'pro',
            ...(nextBilling ? { subscription_ends_at: nextBilling } : {}),
          })
          .eq('paypal_sub_id', event.resource.id)
        console.log(`[PayPal webhook] ${event.event_type} — sub ${event.resource.id} set to pro`)
        break
      }

      case 'PAYMENT.SALE.COMPLETED': {
        // Extend access 32 days from now as a safety buffer after each payment
        const subId = event.resource.billing_agreement_id
        if (subId) {
          const endsAt = new Date()
          endsAt.setDate(endsAt.getDate() + 32)
          await supabase
            .from('users')
            .update({ subscription_ends_at: endsAt.toISOString() })
            .eq('paypal_sub_id', subId)
          console.log(`[PayPal webhook] PAYMENT.SALE.COMPLETED — extended sub ${subId} to ${endsAt.toISOString()}`)
        }
        break
      }

      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        // Log only — do not downgrade; PayPal retries failed payments
        console.log(`[PayPal webhook] PAYMENT.FAILED for sub ${event.resource.id} — no action taken`)
        break

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await supabase
          .from('users')
          .update({ plan: 'free', paypal_sub_id: null })
          .eq('paypal_sub_id', event.resource.id)
        console.log(`[PayPal webhook] ${event.event_type} — sub ${event.resource.id} reverted to free`)
        break

      default:
        console.log(`[PayPal webhook] Unhandled event type: ${event.event_type}`)
    }
  } catch (err) {
    // Log but always 200 — we don't want PayPal retrying on our DB blips
    console.error('[PayPal webhook] DB error:', err)
  }

  return NextResponse.json({ ok: true })
}
