import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Check, Zap } from 'lucide-react'
import Link from 'next/link'
import { PaddleCheckoutButton } from '@/components/billing/paddle-button'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Made Me Invoice is free for 7 days — no credit card required. Pro is $4.99/month for unlimited invoices, custom branding, multi-currency, and global tax support.',
  alternates: { canonical: '/pricing' },
}

const PRO_FEATURES = [
  'Unlimited invoices',
  'Custom branding (logo + watermark)',
  'US state + global tax rates',
  'Multi-currency support',
  'Priority support',
]

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let plan = 'free'
  let subEndsAt: string | null = null
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('plan, subscription_ends_at')
      .eq('id', user.id)
      .single()
    plan = data?.plan ?? 'free'
    subEndsAt = data?.subscription_ends_at ?? null
  }

  const isPro = plan === 'pro' || plan === 'enterprise'

  if (isPro) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground">You are on Pro</p>
              <p className="text-xs text-muted-foreground capitalize">{plan} plan · Active</p>
            </div>
            <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">Active</span>
          </div>

          {subEndsAt && (
            <p className="text-sm text-muted-foreground">
              Next renewal: <span className="font-medium text-foreground">{new Date(subEndsAt).toLocaleDateString()}</span>
            </p>
          )}

          <ul className="space-y-2">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-foreground/80">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-2.5 w-2.5 text-primary" />
                </div>
                {f}
              </li>
            ))}
          </ul>

          <div className="flex gap-3 pt-2">
            <Link
              href="/dashboard"
              className="flex-1 rounded-lg border border-border bg-muted px-4 py-2 text-center text-sm font-medium text-foreground hover:bg-muted/70 transition-colors"
            >
              Go to dashboard
            </Link>
            <Link
              href="/billing"
              className="flex-1 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-center text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              Manage subscription
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-[120px]" style={{ background: 'oklch(0.511 0.262 277.7)' }} />
      </div>

      <div className="relative w-full max-w-md space-y-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Zap className="h-3 w-3 text-primary" />
            Upgrade to Pro
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            $4.99<span className="text-lg font-normal text-muted-foreground">/mo</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Everything you need to grow your business.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-7 shadow-xl shadow-black/5 space-y-6">
          <ul className="space-y-3">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-foreground/80">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-2.5 w-2.5 text-primary" />
                </div>
                {f}
              </li>
            ))}
          </ul>

          <PaddleCheckoutButton userId={user?.id ?? ''} userEmail={user?.email ?? ''} />

          {!user && (
            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login?next=/pricing" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
