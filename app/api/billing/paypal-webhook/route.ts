import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const event = await request.json() as { event_type: string; resource: Record<string, unknown> }
  const supabase = await createClient()

  if (event.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
    const sub = event.resource
    const userId = (sub['custom_id'] ?? (sub['subscriber'] as Record<string, unknown>)?.['custom_id']) as string | undefined
    const subId = sub.id as string
    if (userId) {
      await supabase.from('users').update({
        plan: 'pro',
        paypal_sub_id: subId,
        subscription_ends_at: null,
      }).eq('id', userId)
    }
  }

  if (event.event_type === 'BILLING.SUBSCRIPTION.CANCELLED') {
    const sub = event.resource
    const subId = sub.id as string
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('paypal_sub_id', subId)
    if (users?.[0]) {
      await supabase.from('users').update({ plan: 'free', paypal_sub_id: null }).eq('id', users[0].id)
    }
  }

  return NextResponse.json({ ok: true })
}
