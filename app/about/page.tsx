import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, ArrowRight } from 'lucide-react'
import Header from '@/components/landing/header'
import Footer from '@/components/landing/footer'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About',
  description: 'Made Me Invoice is a free invoice generator built for freelancers and small businesses. Create professional, print-ready invoices in under a minute — no accounting degree required.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-background">
        {/* Hero */}
        <section className="border-b border-border py-20">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/30">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Built for people who bill,
              <br />
              <span className="gradient-text">not accountants</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Made Me Invoice exists because invoicing software was either too expensive, too complicated,
              or too ugly. We built the tool we always wanted — fast, professional, and out of your way.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-20">
          <div className="mx-auto max-w-3xl space-y-16 px-5">

            {/* What it is */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">What is Made Me Invoice?</h2>
              <p className="leading-relaxed text-muted-foreground">
                Made Me Invoice is a web-based invoice generator for freelancers, consultants, and small
                business owners. You create a professional invoice — complete with your logo, line items,
                tax, and payment details — in under a minute, then send it by email or export a
                print-ready PDF.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                Unlike full accounting suites, Made Me Invoice does one thing and does it well: it turns
                your work into a professional document your client can act on immediately. No subscriptions
                for features you never use. No learning curve. No paywall between you and your first invoice.
              </p>
            </div>

            {/* Who it's for */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Who it&apos;s for</h2>
              <ul className="space-y-3 text-muted-foreground">
                {[
                  'Freelance designers, developers, writers, and photographers who need to bill clients fast',
                  'Consultants and coaches who send a handful of invoices per month',
                  'Small agencies or sole traders who want consistent, branded invoices without enterprise pricing',
                  'International freelancers who bill in multiple currencies or need to apply local tax rates',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* What makes it different */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">What makes it different</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: '10 invoice templates',
                    body: 'Modern, minimal, corporate, creative — choose the look that matches your brand and your clients.',
                  },
                  {
                    title: 'Multi-currency & global tax',
                    body: 'Bill in USD, EUR, GBP, CAD, AUD and more. All 50 US state tax rates built in, plus custom international rates.',
                  },
                  {
                    title: '7 invoice languages',
                    body: 'Generate invoices in English, French, Spanish, German, Arabic, Portuguese, or Italian — the app switches automatically.',
                  },
                  {
                    title: 'Custom branding',
                    body: 'Upload your logo, watermark, and company stamp. Set accent colors. Every invoice is consistently on-brand.',
                  },
                  {
                    title: 'Invoices and estimates',
                    body: 'Switch between Invoice and Estimate with one click. Convert an accepted estimate to an invoice in seconds.',
                  },
                  {
                    title: 'AI invoice assistant',
                    body: 'Describe your project in plain language and let the AI draft your line items, then review and send.',
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-border bg-muted/40 p-5">
                    <h3 className="mb-1.5 font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Pricing</h2>
              <p className="leading-relaxed text-muted-foreground">
                Made Me Invoice starts free with a 7-day full-access trial — no credit card required.
                After the trial, the free plan gives you up to 2 invoices per month. Pro is $4.99/month
                for unlimited invoices, custom branding, and priority support. There is no Enterprise
                lock-in — if you outgrow Pro, contact us and we will figure something out.
              </p>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Get in touch</h2>
              <p className="leading-relaxed text-muted-foreground">
                Questions, feedback, or a feature you need? Reach out on{' '}
                <a
                  href="https://www.instagram.com/mademeinvoice/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  Instagram
                </a>{' '}
                or email us at{' '}
                <a href="mailto:hello@mademeinvoice.com" className="font-medium text-primary hover:underline">
                  hello@mademeinvoice.com
                </a>
                . We read everything.
              </p>
            </div>

            {/* CTA */}
            <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
              <h3 className="mb-2 text-xl font-bold text-foreground">Ready to send your first invoice?</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                7-day free trial. No credit card. Your first invoice in under a minute.
              </p>
              <Button
                size="lg"
                render={<Link href="/signup" />}
                className="gradient-primary border-0 text-white shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity gap-2"
              >
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
