import Link from 'next/link'
import { Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

const tiers = [
  {
    name: 'Basic',
    price: 'Free',
    period: null,
    description: 'Try it out — no credit card needed.',
    features: [
      '1-day free trial',
      'Full app access for 24 hours',
      'Create & export invoices',
      'Client management',
    ],
    cta: 'Start free trial',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/mo',
    description: 'Everything you need to grow.',
    features: [
      'Unlimited invoices',
      'Custom branding (logo + watermark)',
      'US state + global tax rates',
      'Multi-currency support',
      'Priority support',
    ],
    cta: 'Subscribe now',
    href: '/signup',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: null,
    description: 'For teams with advanced needs.',
    features: [
      'Everything in Pro',
      'Multiple team members',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    cta: 'Contact us',
    href: 'mailto:hello@invoicepro.app',
    highlighted: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="bg-muted/40 py-24">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Pricing
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Simple,{' '}
            <span className="gradient-text">transparent pricing</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free. No credit card. Upgrade when you need more.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-2xl border p-7 transition-all duration-200 ${
                tier.highlighted
                  ? 'gradient-primary border-transparent text-white shadow-2xl shadow-primary/30 scale-[1.03]'
                  : 'border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-primary shadow-md">
                    <Zap className="h-3 w-3" />
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className={`mb-1 text-sm font-semibold uppercase tracking-widest ${tier.highlighted ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {tier.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${tier.highlighted ? 'text-white' : 'text-foreground'}`}>
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className={`text-sm ${tier.highlighted ? 'text-white/60' : 'text-muted-foreground'}`}>
                      {tier.period}
                    </span>
                  )}
                </div>
                <p className={`mt-2 text-sm ${tier.highlighted ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {tier.description}
                </p>
              </div>

              <ul className="mb-7 flex-1 space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${tier.highlighted ? 'bg-white/20' : 'bg-primary/10'}`}>
                      <Check className={`h-2.5 w-2.5 ${tier.highlighted ? 'text-white' : 'text-primary'}`} />
                    </div>
                    <span className={tier.highlighted ? 'text-white/85' : 'text-foreground/80'}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                render={<Link href={tier.href} />}
                className={
                  tier.highlighted
                    ? 'w-full border-0 bg-white font-semibold text-primary hover:bg-white/90 transition-opacity shadow-lg'
                    : 'w-full border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors'
                }
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
