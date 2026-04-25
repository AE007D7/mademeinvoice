import { createClient } from '@/lib/supabase/server'

export async function hasProAccess(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('plan, subscription_ends_at')
    .eq('id', userId)
    .single()

  if (!data || data.plan !== 'pro') return false
  if (!data.subscription_ends_at) return true
  return new Date(data.subscription_ends_at) > new Date()
}
