import { createClient } from '@/lib/supabase/server'
import { isTrialActive } from '@/lib/subscription'
import { Check, Zap, Building2, Star } from 'lucide-react'
import { PayPalSubscribeButton } from '@/components/billing/paypal-button'
import { CancelSubscriptionButton, DeleteAccountButton, StripeCheckoutButton } from './billing-actions'

export default async function BillingPage() {
  console.log('[BILLING DEBUG]', {
    paypalPlanId: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_PRO_MONTHLY,
    paypalClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    hasStripe: !!process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
  })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: userData } = await supabase
    .from('users')
    .select('plan, trial_ends_at, extra_credits, paypal_sub_id, stripe_customer_id, subscription_ends_at')
    .eq('id', user.id)
    .single()

  const { count: invoiceCount } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const plan = userData?.plan ?? 'free'
  const isPro = plan === 'pro' || plan === 'enterprise'
  const trialActive = isTrialActive(userData?.trial_ends_at ?? null)
  const extraCredits = userData?.extra_credits ?? 0
  const hasSub = !!(userData?.paypal_sub_id || userData?.stripe_customer_id)

  const paypalPlanId = process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_PRO_MONTHLY ?? ''
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ''
  const stripePricePro = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO ?? ''
  const stripeTopupPrice = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_TOPUP ?? ''

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your plan and billing.</p>
      </div>

      {/* Current plan status */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-2">
        <p className="text-sm font-medium text-foreground">Current plan</p>
        <div className="flex items-center gap-3">
          <span className="capitalize text-lg font-bold text-foreground">{plan}</span>
          {trialActive && !isPro && (
            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
              Trial active — ends {new Date(userData!.trial_ends_at!).toLocaleDateString()}
            </span>
          )}
          {isPro && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Active</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Total invoices created: <span className="font-medium text-foreground">{invoiceCount ?? 0}</span>
          {extraCredits > 0 && (
            <> &mdash; Extra credits remaining: <span className="font-medium text-foreground">{extraCredits}</span></>
          )}
        </p>
        {isPro && hasSub && (
          <div className="pt-2">
            <CancelSubscriptionButton />
          </div>
        )}
      </div>

      {/* Plan cards */}
      {!isPro && (
        <div>
          <p className="text-sm font-medium text-foreground mb-4">Upgrade your plan</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Pro plan */}
            <div className="relative rounded-xl border-2 border-primary bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Pro</p>
                  <p className="text-xs text-muted-foreground">$9.99 / month</p>
                </div>
                <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">Popular</span>
              </div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {['Unlimited invoices', 'Custom branding', 'All templates', 'Priority support', 'Remove watermark'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="space-y-2 pt-2">
                {stripePricePro && (
                  <StripeCheckoutButton
                    label="Subscribe with Card"
                    priceId={stripePricePro}
                    mode="subscription"
                  />
                )}
                {paypalPlanId && paypalClientId && (
                  <PayPalSubscribeButton planId={paypalPlanId} clientId={paypalClientId} />
                )}
                {!stripePricePro && (!paypalPlanId || !paypalClientId) && (
                  <p className="text-xs text-muted-foreground">Payment not configured yet.</p>
                )}
              </div>
            </div>

            {/* Enterprise */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Enterprise</p>
                  <p className="text-xs text-muted-foreground">Custom pricing</p>
                </div>
              </div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {['Everything in Pro', 'Custom domain', 'White-label', 'Dedicated support', 'SLA'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:hello@mademeinvoice.com"
                className="block w-full rounded-lg border border-border bg-muted px-4 py-2 text-center text-sm font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                Contact us
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Topup credits (free plan) */}
      {!isPro && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <p className="text-sm font-medium text-foreground">Buy extra invoices</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Get 10 extra invoices for <span className="font-medium text-foreground">$5</span> — no subscription required.
          </p>
          {stripeTopupPrice ? (
            <StripeCheckoutButton
              label="Buy 10 invoices — $5"
              priceId={stripeTopupPrice}
              mode="payment"
            />
          ) : (
            <p className="text-xs text-muted-foreground">Topup not configured yet.</p>
          )}
        </div>
      )}

      {/* Danger zone */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-3">
        <p className="text-sm font-medium text-destructive">Danger zone</p>
        <p className="text-sm text-muted-foreground">
          Permanently delete your account, all invoices, clients, and branding. This cannot be undone.
        </p>
        <DeleteAccountButton />
      </div>
    </div>
  )
}
