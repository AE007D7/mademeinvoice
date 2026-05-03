import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUiLang } from '@/lib/get-lang'
import { getUiT } from '@/lib/i18n'
import { isTrialActive } from '@/lib/subscription'
import BrandingForm from './branding-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const [lang, brandingRes, userRes] = await Promise.all([
    getUiLang(),
    supabase.from('branding').select('*').eq('user_id', user.id).single(),
    supabase
      .from('users')
      .select('plan, trial_ends_at, subscription_ends_at, paypal_sub_id')
      .eq('id', user.id)
      .single(),
  ])

  const t = getUiT(lang)
  const branding = brandingRes.data
  const userData = userRes.data
  const plan = userData?.plan ?? 'free'
  const isPro = plan === 'pro' || plan === 'enterprise'
  const trialActive = isTrialActive(userData?.trial_ends_at ?? null)
  const subEndsAt = userData?.subscription_ends_at
    ? new Date(userData.subscription_ends_at)
    : null

  const paypalManageUrl =
    process.env.PAYPAL_MODE === 'live'
      ? 'https://www.paypal.com/myaccount/autopay/'
      : 'https://www.sandbox.paypal.com/myaccount/autopay/'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.settings.title}</h1>
        <p className="text-sm text-muted-foreground">{t.settings.subtitle}</p>
      </div>

      {/* Account info */}
      <div className="rounded-lg border border-border bg-card p-4 text-sm space-y-1">
        <p className="font-medium text-foreground">{t.settings.account}</p>
        <p className="text-muted-foreground">{user.email}</p>
        <p className="capitalize text-muted-foreground">
          {t.settings.plan}: <span className="font-medium text-foreground">{plan}</span>
          {!isPro && trialActive && (
            <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
              {t.settings.trialActive}
            </span>
          )}
          {isPro && (
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Active
            </span>
          )}
        </p>
      </div>

      {/* Billing panel */}
      <div className="rounded-lg border border-border bg-card p-4 text-sm space-y-3">
        <p className="font-medium text-foreground">Billing</p>
        {isPro ? (
          <>
            {subEndsAt && (
              <p className="text-muted-foreground">
                Next renewal:{' '}
                <span className="font-medium text-foreground">
                  {subEndsAt.toLocaleDateString()}
                </span>
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <a
                href={paypalManageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                Manage subscription ↗
              </a>
              <Link
                href="/billing"
                className="inline-flex items-center rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                Billing details
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-muted-foreground">
              You are on the <span className="font-medium text-foreground">free</span> plan.
              Upgrade to Pro for unlimited invoices and custom branding.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Upgrade to Pro — $4.99/mo
            </Link>
          </>
        )}
      </div>

      <BrandingForm branding={branding} userId={user.id} t={t.settings} />
    </div>
  )
}
