import type { Metadata } from 'next'
import Header from '@/components/landing/header'
import Footer from '@/components/landing/footer'

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Made Me Invoice refund and cancellation policy.',
  alternates: { canonical: '/refund-policy' },
  robots: { index: true, follow: true },
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="space-y-4 scroll-mt-8">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <div className="space-y-3 leading-relaxed text-muted-foreground">{children}</div>
    </div>
  )
}

export default function RefundPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-background">
        <section className="border-b border-border py-16">
          <div className="mx-auto max-w-3xl px-5">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Refund Policy</h1>
            <p className="mt-3 text-sm text-muted-foreground">Last updated: 3 May 2026</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We want you to be completely satisfied with Made Me Invoice. This policy explains
              when and how you can request a refund for a paid Subscription.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-3xl space-y-14 px-5">

            <Section id="window" title="1. Refund Window">
              <p>
                We offer a <strong className="text-foreground">14-day money-back guarantee</strong>{' '}
                from the date of your initial purchase or subscription renewal. If you are not
                satisfied for any reason, contact us within 14 days of the charge and we will
                issue a full refund — no questions asked.
              </p>
              <p>
                Refund requests submitted after 14 days of the billing date will not be eligible
                for a refund except in cases of billing error or exceptional circumstances at
                our sole discretion.
              </p>
            </Section>

            <Section id="qualifies" title="2. What Qualifies for a Refund">
              <ul className="space-y-2 pl-4">
                {[
                  'First-time subscription purchase — request within 14 days of charge.',
                  'Subscription renewal — request within 14 days of the renewal charge.',
                  'Duplicate charges or billing errors caused by a technical fault.',
                  'Situations where the Service was materially unavailable for an extended period due to our fault.',
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-sm">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="not-qualifies" title="3. What Does Not Qualify for a Refund">
              <ul className="space-y-2 pl-4">
                {[
                  'Requests made more than 14 days after the billing date.',
                  'Accounts that have been suspended or terminated for violation of our Terms of Service.',
                  'Partial-month usage — we do not pro-rate refunds for unused days within a billing period.',
                  'Dissatisfaction with features that were accurately described on our Pricing page at the time of purchase.',
                  'Refunds on a second or subsequent renewal of the same subscription plan (only the most recent renewal is eligible).',
                  'Free plan users (there is nothing to refund).',
                  'Charges for add-ons or one-time purchases that have been fully consumed.',
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-sm">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="how-to-request" title="4. How to Request a Refund">
              <p>
                Because all payments are processed by{' '}
                <strong className="text-foreground">Paddle.com Market Ltd</strong>, our
                authorised Merchant of Record, refunds are also issued by Paddle on our behalf.
              </p>
              <p>To request a refund:</p>
              <ol className="space-y-3 pl-4">
                {[
                  ['Email us', 'Send a refund request to contact@mademeinvoice.com with your registered email address and the date of the charge you want refunded.'],
                  ['We verify and approve', 'We will confirm your eligibility within 2 business days and instruct Paddle to process the refund.'],
                  ['Paddle issues the refund', 'Paddle will refund the amount to your original payment method. You will receive a confirmation email from Paddle.'],
                ].map(([step, desc], i) => (
                  <li key={step as string} className="flex gap-3 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{i + 1}</span>
                    <span><strong className="text-foreground">{step}:</strong> {desc}</span>
                  </li>
                ))}
              </ol>
              <p>
                You may also contact Paddle directly through their buyer support portal at{' '}
                <a href="https://www.paddle.com/help/payments" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  paddle.com/help/payments
                </a>
                .
              </p>
            </Section>

            <Section id="processing-time" title="5. Processing Time">
              <p>
                Once a refund is approved, Paddle typically processes it within{' '}
                <strong className="text-foreground">5–10 business days</strong>. The time for
                the funds to appear in your account depends on your bank or card issuer and may
                take longer for international transfers.
              </p>
            </Section>

            <Section id="cancellation" title="6. Subscription Cancellation vs. Refund">
              <p>
                <strong className="text-foreground">Cancellation</strong> stops your
                Subscription from renewing at the end of the current billing period. You retain
                access to paid features until the period ends, but you will not be charged again.
                Cancellation alone does not entitle you to a refund of the current period&apos;s
                fee.
              </p>
              <p>
                <strong className="text-foreground">A refund</strong> returns the money already
                charged for the current period and, upon approval, typically results in immediate
                downgrade to the free plan.
              </p>
              <p>
                You can cancel your Subscription at any time from your account settings or by
                contacting us at{' '}
                <a href="mailto:contact@mademeinvoice.com" className="text-primary hover:underline">
                  contact@mademeinvoice.com
                </a>
                .
              </p>
            </Section>

            <Section id="prorated" title="7. Pro-rated Refunds">
              <p>
                We do <strong className="text-foreground">not</strong> offer pro-rated refunds
                for unused days within a billing period. If you cancel mid-cycle, you will
                continue to have access until the end of the period you paid for. If you request
                a full refund within the 14-day window, the entire period charge is refunded and
                access is revoked.
              </p>
            </Section>

            <Section id="chargebacks" title="8. Chargebacks">
              <p>
                We strongly encourage you to contact us before initiating a chargeback with your
                bank. We resolve genuine disputes quickly and a chargeback adds unnecessary
                delay for you.
              </p>
              <p>
                If a chargeback is filed, we reserve the right to suspend the associated Account
                pending investigation. Accounts found to have filed fraudulent chargebacks may be
                permanently banned from the Service.
              </p>
            </Section>

            <Section id="contact" title="9. Contact">
              <p>For refund requests or billing questions, contact us at:</p>
              <div className="rounded-xl border border-border bg-muted/40 p-5 text-sm">
                <p className="font-semibold text-foreground">MadeMeInvoice</p>
                <p>
                  Email:{' '}
                  <a href="mailto:contact@mademeinvoice.com" className="text-primary hover:underline">
                    contact@mademeinvoice.com
                  </a>
                </p>
                <p>We aim to respond within 2 business days.</p>
              </div>
            </Section>

          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
