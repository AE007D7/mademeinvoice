import type { SupabaseClient } from '@supabase/supabase-js'

export function isTrialActive(trial_ends_at: string | null): boolean {
  if (!trial_ends_at) return false
  return new Date(trial_ends_at) > new Date()
}

export async function checkInvoiceLimit(
  supabase: SupabaseClient,
  userId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const { data: user } = await supabase
    .from('users')
    .select('plan, trial_ends_at')
    .eq('id', userId)
    .single()

  if (!user) return { allowed: false, reason: 'User not found.' }

  if (user.plan === 'pro' || user.plan === 'enterprise') {
    return { allowed: true }
  }

  if (isTrialActive(user.trial_ends_at)) {
    return { allowed: true }
  }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())

  if ((count ?? 0) < 5) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason:
      'You have reached the 5 invoice limit for the free plan this month. Upgrade to Pro for unlimited invoices.',
  }
}
