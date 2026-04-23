import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.supabase_user_id
    if (!userId) return NextResponse.json({ ok: true })

    if (session.mode === 'subscription') {
      await supabase.from('users').update({
        plan: 'pro',
      }).eq('id', userId)
    } else if (session.mode === 'payment') {
      // topup: add 10 credits
      await supabase.rpc('increment_credits', { user_id: userId, amount: 10 })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('stripe_customer_id', customerId)
    if (users?.[0]) {
      await supabase.from('users').update({ plan: 'free', subscription_ends_at: null }).eq('id', users[0].id)
    }
  }

  return NextResponse.json({ ok: true })
}
