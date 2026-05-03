import type { SupabaseClient } from '@supabase/supabase-js'

export function isTrialActive(trial_ends_at: string | null): boolean {
  if (!trial_ends_at) return false
  return new Date(trial_ends_at) > new Date()
}

type PlanRow = {
  plan: string
  subscription_status: string | null
  trial_ends_at: string | null
  subscription_ends_at: string | null
}

function canUseProFeatures(user: PlanRow): boolean {
  if (user.plan === 'enterprise') return true
  if (user.plan !== 'pro') return false

  const status = user.subscription_status
  const now = new Date()

  // Null status = pre-migration Pro user → allowed
  if (status === null || status === 'active' || status === 'trialing') return true

  // Canceled but still within paid period
  if (status === 'canceled' && user.subscription_ends_at) {
    return new Date(user.subscription_ends_at) > now
  }

  return false
}

export async function getUserPlan(
  supabase: SupabaseClient,
  userId: string,
): Promise<{
  plan: 'free' | 'pro' | 'enterprise'
  isActive: boolean
  isTrialing: boolean
  isCanceled: boolean
  daysRemaining: number | null
  canUseProFeatures: boolean
  subEndsAt: Date | null
  status: string | null
}> {
  const { data: user } = await supabase
    .from('users')
    .select('plan, subscription_status, trial_ends_at, subscription_ends_at')
    .eq('id', userId)
    .single()

  const plan = (user?.plan ?? 'free') as 'free' | 'pro' | 'enterprise'
  const status = user?.subscription_status ?? null
  const subEndsAt = user?.subscription_ends_at ? new Date(user.subscription_ends_at) : null
  const now = new Date()

  const isTrialing = isTrialActive(user?.trial_ends_at ?? null)
  const isActive = plan === 'pro' && (status === 'active' || status === null)
  const isCanceled = status === 'canceled'
  const daysRemaining = subEndsAt ? Math.max(0, Math.ceil((subEndsAt.getTime() - now.getTime()) / 86400000)) : null

  return {
    plan,
    isActive,
    isTrialing,
    isCanceled,
    daysRemaining,
    canUseProFeatures: user ? canUseProFeatures(user as PlanRow) : false,
    subEndsAt,
    status,
  }
}

export async function checkInvoiceLimit(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ allowed: boolean; reason?: string }> {
  const { data: user } = await supabase
    .from('users')
    .select('plan, subscription_status, trial_ends_at, subscription_ends_at')
    .eq('id', userId)
    .single()

  if (!user) return { allowed: false, reason: 'User not found.' }

  if (user.plan === 'enterprise') return { allowed: true }

  if (user.plan === 'pro') {
    if (canUseProFeatures(user as PlanRow)) return { allowed: true }

    const status = user.subscription_status
    if (status === 'past_due') {
      return { allowed: false, reason: 'Votre paiement est en attente. Mettez à jour votre moyen de paiement.' }
    }
    if (status === 'paused') {
      return { allowed: false, reason: 'Votre abonnement est en pause.' }
    }
    if (status === 'canceled') {
      return { allowed: false, reason: 'Votre abonnement Pro a expiré. Abonnez-vous à nouveau pour continuer.' }
    }
  }

  if (isTrialActive(user.trial_ends_at)) return { allowed: true }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())

  if ((count ?? 0) < 2) return { allowed: true }

  return {
    allowed: false,
    reason: 'Vous avez atteint la limite de 2 factures par mois du plan gratuit. Passez à Pro pour des factures illimitées.',
  }
}
