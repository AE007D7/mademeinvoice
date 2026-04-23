import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

function InvoiceMockup() {
  return (
    <div className="relative">
      {/* Glow behind the card */}
      <div className="absolute inset-0 rounded-2xl bg-primary/25 blur-3xl scale-90 translate-y-4" />

      <div className="relative rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm shadow-2xl">
        {/* Invoice header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="mb-1 h-5 w-24 rounded-md bg-white/80" />
            <div className="h-3 w-16 rounded bg-white/40" />
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Invoice</p>
            <p className="text-lg font-bold text-white">#0042</p>
          </div>
        </div>

        {/* Bill to */}
        <div className="mb-5 rounded-xl bg-white/10 px-3 py-2.5">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/50">Bill To</p>
          <p className="text-sm font-semibold text-white">Acme Corporation</p>
          <p className="text-xs text-white/60">billing@acme.com</p>
        </div>

        {/* Line items */}
        <div className="mb-4 space-y-2">
          {[
            { desc: 'UI Design — 12 hrs', amount: '$2,400' },
            { desc: 'Frontend Dev — 8 hrs', amount: '$1,600' },
            { desc: 'Project management', amount: '$480' },
          ].map((item) => (
            <div key={item.desc} className="flex justify-between text-xs">
              <span className="text-white/70">{item.desc}</span>
              <span className="font-medium text-white">{item.amount}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-3 h-px bg-white/15" />

        {/* Totals */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-white/60">
            <span>Subtotal</span>
            <span>$4,480.00</span>
          </div>
          <div className="flex justify-between text-white/60">
            <span>Tax (8.25%)</span>
            <span>$369.60</span>
          </div>
          <div className="flex justify-between pt-1 text-sm font-bold text-white">
            <span>Total</span>
            <span>$4,849.60</span>
          </div>
        </div>

        {/* Status badge */}
        <div className="mt-4 flex justify-end">
          <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-300">
            ✓ Paid
          </span>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -left-4 top-8 rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm shadow-lg">
        <p className="text-xs font-semibold text-white">🌍 Multi-currency</p>
        <p className="text-[10px] text-white/60">USD · EUR · GBP · more</p>
      </div>
      <div className="absolute -right-4 bottom-10 rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm shadow-lg">
        <p className="text-xs font-semibold text-white">⚡ Instant PDF</p>
        <p className="text-[10px] text-white/60">Print-ready invoices</p>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden py-24 md:py-36"
      style={{ background: 'oklch(0.11 0.04 265)' }}
    >
      {/* Background glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-32 top-0 h-[600px] w-[600px] rounded-full opacity-30 blur-[120px]"
          style={{ background: 'oklch(0.511 0.262 277.7)' }}
        />
        <div
          className="absolute -right-32 bottom-0 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'oklch(0.46 0.27 300)' }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(oklch(1 0 0 / 0.8) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.8) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-5">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left: text */}
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              7-day free trial · No credit card required
            </div>

            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl">
              Invoice faster.
              <br />
              <span className="gradient-text">Get paid sooner.</span>
            </h1>

            <p className="max-w-md text-lg leading-relaxed text-white/60">
              Create beautiful, professional invoices in seconds. Global tax
              support, custom branding, multi-currency — everything you need
              to run a modern freelance business.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                render={<Link href="/signup" />}
                className="gradient-primary border-0 text-white shadow-xl shadow-primary/40 hover:opacity-90 transition-opacity gap-2"
              >
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                render={<Link href="/#features" />}
                className="border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15 transition-colors"
              >
                See how it works
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 text-sm text-white/40">
              <div className="flex -space-x-2">
                {['A', 'B', 'C', 'D'].map((l) => (
                  <div
                    key={l}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[oklch(0.11_0.04_265)] gradient-primary text-[10px] font-bold text-white"
                  >
                    {l}
                  </div>
                ))}
              </div>
              <span>Trusted by 2,000+ freelancers</span>
            </div>
          </div>

          {/* Right: invoice mockup */}
          <div className="hidden lg:block">
            <InvoiceMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
