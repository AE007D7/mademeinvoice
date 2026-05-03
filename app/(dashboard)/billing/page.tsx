import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/subscription'
import { Check, Zap, Building2, CheckCircle2 } from 'lucide-react'
import { PaddleCheckoutButton } from '@/components/billing/paddle-button'
import { CancelSubscriptionButton, PaddlePortalButton, DeleteAccountButton } from './billing-actions'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [planInfo, invoiceCountRes] = await Promise.all([
    getUserPlan(supabase, user.id),
    supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const invoiceCount = invoiceCountRes.count ?? 0
  const isPro  = planInfo.plan === 'pro' || planInfo.plan === 'enterprise'
  const hasPaddleSub = !!(await supabase.from('users').select('paddle_customer_id').eq('id', user.id).single()).data?.paddle_customer_id

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Facturation</h1>
        <p className="text-sm text-muted-foreground">Gérez votre plan et votre abonnement.</p>
      </div>

      {/* ── Current plan ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">Plan actuel</p>
          {isPro && (
            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle2 className="h-3 w-3" />
              Actif
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-foreground capitalize">{planInfo.plan}</span>
          {planInfo.isTrialing && !isPro && (
            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
              Essai en cours
            </span>
          )}
          {planInfo.isCanceled && planInfo.subEndsAt && (
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
              Annulé — accès jusqu&apos;au{' '}
              {planInfo.subEndsAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* Renewal date */}
        {isPro && !planInfo.isCanceled && planInfo.subEndsAt && (
          <p className="text-sm text-muted-foreground">
            Prochain renouvellement :{' '}
            <strong className="text-foreground">
              {planInfo.subEndsAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </strong>
          </p>
        )}

        <p className="text-sm text-muted-foreground">
          Factures créées : <span className="font-medium text-foreground">{invoiceCount}</span>
        </p>

        {isPro && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {hasPaddleSub && <PaddlePortalButton />}
            <CancelSubscriptionButton />
          </div>
        )}
      </div>

      {/* ── Upgrade cards (free users only) ──────────────────────────────── */}
      {!isPro && (
        <div>
          <p className="text-sm font-medium text-foreground mb-4">Passer à la version supérieure</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Pro */}
            <div className="relative rounded-xl border-2 border-primary bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Pro</p>
                  <p className="text-xs text-muted-foreground">4,99 € / mois</p>
                </div>
                <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">Populaire</span>
              </div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {[
                  'Factures illimitées',
                  'Personnalisation complète',
                  'Tous les modèles',
                  'Support prioritaire',
                  'Sans filigrane',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <PaddleCheckoutButton userId={user.id} userEmail={user.email ?? ''} />
            </div>

            {/* Enterprise */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Enterprise</p>
                  <p className="text-xs text-muted-foreground">Sur mesure</p>
                </div>
              </div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {['Tout ce qu\'il y a dans Pro', 'Domaine personnalisé', 'Marque blanche', 'Support dédié', 'SLA garanti'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:contact@mademeinvoice.com"
                className="block w-full rounded-lg border border-border bg-muted px-4 py-2 text-center text-sm font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Danger zone ───────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-3">
        <p className="text-sm font-medium text-destructive">Zone de danger</p>
        <p className="text-sm text-muted-foreground">
          Supprime définitivement votre compte, toutes vos factures, clients et personnalisations.
        </p>
        <DeleteAccountButton />
      </div>
    </div>
  )
}
