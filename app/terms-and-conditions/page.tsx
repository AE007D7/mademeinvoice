import type { Metadata } from 'next'
import Header from '@/components/landing/header'
import Footer from '@/components/landing/footer'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions governing your use of Made Me Invoice.',
  alternates: { canonical: '/terms-and-conditions' },
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

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-background">
        <section className="border-b border-border py-16">
          <div className="mx-auto max-w-3xl px-5">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Terms of Service</h1>
            <p className="mt-3 text-sm text-muted-foreground">Last updated: 3 May 2026</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Please read these Terms carefully before using Made Me Invoice. By creating an account
              or using the Service you agree to be bound by them.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-3xl space-y-14 px-5">

            <Section id="definitions" title="1. Definitions">
              <p>Throughout these Terms the following words have specific meanings:</p>
              <ul className="space-y-2 pl-4">
                {[
                  ['"Service"', 'The Made Me Invoice web application, website at www.mademeinvoice.com, and all related features and APIs.'],
                  ['"Company" / "we" / "us"', 'MadeMeInvoice, a business based in Morocco.'],
                  ['"User" / "you"', 'Any individual or entity that accesses or uses the Service.'],
                  ['"Account"', 'The registered profile created by a User to access the Service.'],
                  ['"Subscription"', 'A paid plan that grants access to premium features on a recurring basis.'],
                  ['"Content"', 'Any data, text, or files uploaded, created, or stored by a User via the Service, including invoices and client records.'],
                  ['"Paddle"', 'Paddle.com Market Ltd, our authorised reseller and Merchant of Record for all purchases made through the Service.'],
                ].map(([term, def]) => (
                  <li key={term as string} className="flex gap-2 text-sm">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span><strong className="text-foreground">{term}</strong> — {def}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="acceptance" title="2. Acceptance of Terms">
              <p>
                By registering an account, clicking "I agree," or otherwise accessing or using the
                Service, you confirm that you are at least 16 years old, have the legal capacity to
                enter into binding contracts, and agree to these Terms and our Privacy Policy.
              </p>
              <p>
                If you are using the Service on behalf of an organisation, you represent that you
                have authority to bind that organisation to these Terms.
              </p>
            </Section>

            <Section id="account" title="3. Account Registration and Responsibilities">
              <p>
                You must provide accurate, current, and complete information when creating an Account
                and keep it updated. You are responsible for maintaining the confidentiality of your
                login credentials and for all activity that occurs under your Account.
              </p>
              <p>
                Notify us immediately at{' '}
                <a href="mailto:contact@mademeinvoice.com" className="text-primary hover:underline">
                  contact@mademeinvoice.com
                </a>{' '}
                if you suspect unauthorised use of your Account. We are not liable for any loss
                resulting from unauthorised access caused by your failure to keep credentials secure.
              </p>
              <p>
                You may not share your Account with others or create multiple free Accounts to
                circumvent usage limits.
              </p>
            </Section>

            <Section id="acceptable-use" title="4. Acceptable Use Policy">
              <p>You agree to use the Service only for lawful purposes. You must not:</p>
              <ul className="space-y-2 pl-4">
                {[
                  'Create or send fraudulent, misleading, or deceptive invoices.',
                  'Use the Service to facilitate money laundering, tax evasion, or any other illegal activity.',
                  'Attempt to reverse-engineer, copy, or create derivative works from the Service.',
                  'Introduce malware, viruses, or any other harmful code.',
                  'Scrape, crawl, or otherwise harvest data from the Service without prior written consent.',
                  'Impersonate any person, business, or entity.',
                  'Violate any applicable law or regulation in your jurisdiction or that of your clients.',
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-sm">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                We reserve the right to suspend or terminate Accounts that violate this policy
                without prior notice and without refund.
              </p>
            </Section>

            <Section id="billing" title="5. Subscriptions, Billing, and Payments">
              <Sub title="5.1 Merchant of Record">
                <p>
                  All purchases, subscription billing, and payment processing for Made Me Invoice
                  are handled exclusively by{' '}
                  <strong className="text-foreground">Paddle.com Market Ltd ("Paddle")</strong>,
                  who acts as the authorised reseller and <strong className="text-foreground">Merchant of Record</strong>{' '}
                  for all transactions. When you purchase a Subscription, your contract of sale is
                  with Paddle, not directly with us. Paddle collects and remits applicable sales
                  taxes and VAT on our behalf.
                </p>
                <p>
                  Paddle's own terms of service and privacy policy also apply to your purchase and
                  are available at{' '}
                  <a href="https://www.paddle.com/legal/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    paddle.com/legal/terms
                  </a>
                  .
                </p>
              </Sub>
              <Sub title="5.2 Plans and Pricing">
                <p>
                  We offer a free plan with limited features and one or more paid Subscription
                  plans. Current pricing is published on our Pricing page. We reserve the right
                  to change prices with at least 30 days&apos; notice to existing subscribers.
                </p>
              </Sub>
              <Sub title="5.3 Billing Cycle and Auto-Renewal">
                <p>
                  Paid Subscriptions are billed in advance on a monthly or annual cycle depending
                  on the plan you select. Your Subscription renews automatically at the end of
                  each billing period unless you cancel before the renewal date. You authorise
                  Paddle to charge your payment method on each renewal date.
                </p>
              </Sub>
              <Sub title="5.4 Free Trial">
                <p>
                  We may offer a free trial period. At the end of the trial, your Account
                  automatically converts to the selected paid plan and your payment method is
                  charged unless you cancel before the trial ends.
                </p>
              </Sub>
              <Sub title="5.5 Taxes">
                <p>
                  Prices displayed may be exclusive of applicable taxes. Paddle calculates and
                  collects the correct tax based on your billing location.
                </p>
              </Sub>
            </Section>

            <Section id="ip" title="6. Intellectual Property">
              <p>
                The Service, including its design, code, trademarks, and branding, is owned by
                MadeMeInvoice and protected by applicable intellectual property laws. Nothing in
                these Terms transfers ownership of our intellectual property to you.
              </p>
              <p>
                You retain full ownership of all Content you create using the Service, including
                your invoices, client data, and uploaded assets. By using the Service you grant
                us a limited, non-exclusive licence to store and process your Content solely to
                provide the Service to you.
              </p>
            </Section>

            <Section id="availability" title="7. Service Availability and Modifications">
              <p>
                We aim to keep the Service available at all times but do not guarantee uninterrupted
                access. We may perform maintenance, updates, or modifications that temporarily
                affect availability. We will endeavour to give advance notice of planned downtime
                where practicable.
              </p>
              <p>
                We reserve the right to modify, suspend, or discontinue any part of the Service at
                any time. If we make material changes that negatively affect your Subscription, we
                will notify you and provide a pro-rated refund or credit where appropriate.
              </p>
            </Section>

            <Section id="termination" title="8. Account Termination">
              <Sub title="8.1 Termination by you">
                <p>
                  You may cancel your Subscription and close your Account at any time through your
                  account settings or by contacting us. Cancellation stops future billing; it does
                  not entitle you to a refund of fees already paid except as described in our
                  Refund Policy.
                </p>
              </Sub>
              <Sub title="8.2 Termination by us">
                <p>
                  We may suspend or terminate your Account immediately and without notice if you
                  breach these Terms, fail to pay fees when due, or if we reasonably believe your
                  use poses legal or security risks.
                </p>
              </Sub>
              <Sub title="8.3 Effect of termination">
                <p>
                  Upon termination, your right to access the Service ceases. We may delete your
                  Content after a grace period of 30 days. It is your responsibility to export any
                  data you need before your Account is closed.
                </p>
              </Sub>
            </Section>

            <Section id="disclaimers" title="9. Disclaimer of Warranties">
              <p>
                The Service is provided <strong className="text-foreground">"as is"</strong> and{' '}
                <strong className="text-foreground">"as available"</strong> without warranties of
                any kind, whether express or implied, including but not limited to warranties of
                merchantability, fitness for a particular purpose, or non-infringement.
              </p>
              <p>
                We do not warrant that the Service will be error-free, uninterrupted, or free from
                viruses or other harmful components. We do not provide legal, accounting, or tax
                advice — invoices generated through the Service are your responsibility to review
                and comply with applicable regulations.
              </p>
            </Section>

            <Section id="liability" title="10. Limitation of Liability">
              <p>
                To the maximum extent permitted by applicable law, MadeMeInvoice shall not be
                liable for any indirect, incidental, special, consequential, or punitive damages
                arising out of or related to your use of the Service, even if we have been advised
                of the possibility of such damages.
              </p>
              <p>
                Our total aggregate liability to you for any claim arising out of these Terms or
                your use of the Service shall not exceed the greater of (a) the amount you paid
                us in the three months preceding the claim or (b) USD 50.
              </p>
              <p>
                Some jurisdictions do not allow limitations on implied warranties or exclusion of
                certain damages. In such jurisdictions our liability is limited to the fullest
                extent permitted by law.
              </p>
            </Section>

            <Section id="indemnification" title="11. Indemnification">
              <p>
                You agree to indemnify and hold harmless MadeMeInvoice, its officers, employees,
                and agents from any claims, losses, damages, or expenses (including reasonable
                legal fees) arising from your use of the Service, your Content, or your breach of
                these Terms.
              </p>
            </Section>

            <Section id="governing-law" title="12. Governing Law and Dispute Resolution">
              <p>
                These Terms are governed by and construed in accordance with the laws of Morocco.
                Any dispute arising under or in connection with these Terms shall be subject to
                the exclusive jurisdiction of the competent courts in Morocco.
              </p>
              <p>
                If you are a consumer resident in the European Union, you may also have the right
                to bring a claim in the courts of your country of residence.
              </p>
            </Section>

            <Section id="changes" title="13. Changes to These Terms">
              <p>
                We may update these Terms from time to time. We will notify you of material changes
                by email or by posting a notice in the Service at least 14 days before they take
                effect. Continued use of the Service after changes take effect constitutes
                acceptance of the revised Terms.
              </p>
            </Section>

            <Section id="contact" title="14. Contact Information">
              <p>For questions about these Terms, please contact us:</p>
              <div className="rounded-xl border border-border bg-muted/40 p-5 text-sm">
                <p className="font-semibold text-foreground">MadeMeInvoice</p>
                <p>Morocco</p>
                <p>
                  Email:{' '}
                  <a href="mailto:contact@mademeinvoice.com" className="text-primary hover:underline">
                    contact@mademeinvoice.com
                  </a>
                </p>
                <p>Website: www.mademeinvoice.com</p>
              </div>
            </Section>

          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
