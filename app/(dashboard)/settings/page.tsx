import { createClient } from '@/lib/supabase/server'
import BrandingForm from './branding-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: branding } = await supabase
    .from('branding')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: userData } = await supabase
    .from('users')
    .select('plan, trial_ends_at')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and branding.
        </p>
      </div>

      {/* Account info */}
      <div className="rounded-lg border border-border bg-card p-4 text-sm">
        <p className="font-medium text-foreground">Account</p>
        <p className="mt-1 text-muted-foreground">{user.email}</p>
        <p className="mt-1 capitalize text-muted-foreground">
          Plan: <span className="font-medium text-foreground">{userData?.plan ?? 'free'}</span>
          {userData?.trial_ends_at &&
            new Date(userData.trial_ends_at) > new Date() && (
              <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                Trial active
              </span>
            )}
        </p>
      </div>

      <BrandingForm branding={branding} userId={user.id} />
    </div>
  )
}
