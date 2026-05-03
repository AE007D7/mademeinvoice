import type { Metadata } from 'next'
import Header from '@/components/landing/header'
import Footer from '@/components/landing/footer'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Made Me Invoice collects, uses, and protects your personal data.',
  alternates: { canonical: '/privacy-policy' },
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

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-background">
        <section className="border-b border-border py-16">
          <div className="mx-auto max-w-3xl px-5">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
            <p className="mt-3 text-sm text-muted-foreground">Last updated: 3 May 2026</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              This Privacy Policy explains how MadeMeInvoice ("we", "us", or "our") collects,
              uses, and protects your personal data when you use our Service at
              www.mademeinvoice.com. We are committed to protecting your privacy and
              complying with the EU General Data Protection Regulation (GDPR) and applicable
              data protection laws.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-3xl space-y-14 px-5">

            <Section id="controller" title="1. Data Controller">
              <p>
                The data controller responsible for your personal data is:
              </p>
              <div className="rounded-xl border border-border bg-muted/40 p-5 text-sm">
                <p className="font-semibold text-foreground">MadeMeInvoice</p>
                <p>Morocco</p>
                <p>
                  Email:{' '}
                  <a href="mailto:contact@mademeinvoice.com" className="text-primary hover:underline">
                    contact@mademeinvoice.com
                  </a>
                </p>
              </div>
            </Section>

            <Section id="data-collected" title="2. Personal Data We Collect">
              <Sub title="2.1 Account and profile data">
                <p>
                  When you register, we collect your name, email address, and password (stored
                  as a one-way hash). You may optionally add a company name, logo, address,
                  and phone number to appear on your invoices.
                </p>
              </Sub>
              <Sub title="2.2 Billing and payment data">
                <p>
                  We do not store your payment card details. All payment transactions are handled
                  by Paddle.com Market Ltd ("Paddle"), our Merchant of Record. Paddle may collect
                  your billing address, payment method, and transaction history in accordance
                  with their own privacy policy. We receive limited billing metadata from Paddle
                  (e.g. subscription status, plan type) to manage your access to the Service.
                </p>
              </Sub>
              <Sub title="2.3 Invoice and client data">
                <p>
                  When you create invoices you may enter personal data about your clients,
                  including their name, company, email address, postal address, and phone number.
                  You are the data controller for your clients&apos; data; we process it on your
                  behalf as a data processor.
                </p>
              </Sub>
              <Sub title="2.4 Usage data">
                <p>
                  We automatically collect technical data when you use the Service, including
                  your IP address, browser type and version, device type, pages visited, actions
                  taken within the app, and timestamps. This data is used to operate and improve
                  the Service.
                </p>
              </Sub>
              <Sub title="2.5 Communications">
                <p>
                  If you contact us by email or through the app, we retain the content of your
                  message and your contact details to respond to your enquiry and for quality
                  assurance purposes.
                </p>
              </Sub>
            </Section>

            <Section id="how-collected" title="3. How We Collect Data">
              <ul className="space-y-2 pl-4">
                {[
                  'Directly from you when you register, update your profile, or contact us.',
                  'Automatically through the Service via server logs and essential cookies when you navigate the site.',
                  'From Paddle, who shares limited transactional data with us after a successful purchase.',
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-sm">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="purposes" title="4. Purposes and Legal Basis for Processing">
              <p>
                We only process your personal data where we have a lawful basis under GDPR
                Article 6:
              </p>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="p-3 text-left font-semibold text-foreground">Purpose</th>
                      <th className="p-3 text-left font-semibold text-foreground">Legal basis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      ['Providing and operating the Service', 'Art. 6(1)(b) — performance of a contract'],
                      ['Processing your subscription and billing', 'Art. 6(1)(b) — performance of a contract'],
                      ['Sending transactional emails (receipts, password reset)', 'Art. 6(1)(b) — performance of a contract'],
                      ['Improving and securing the Service', 'Art. 6(1)(f) — legitimate interests'],
                      ['Complying with legal obligations (e.g. tax records)', 'Art. 6(1)(c) — legal obligation'],
                      ['Responding to your support enquiries', 'Art. 6(1)(b) — performance of a contract'],
                      ['Fraud prevention and security monitoring', 'Art. 6(1)(f) — legitimate interests'],
                    ].map(([purpose, basis]) => (
                      <tr key={purpose as string}>
                        <td className="p-3 text-muted-foreground">{purpose}</td>
                        <td className="p-3 text-muted-foreground">{basis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section id="third-parties" title="5. Third Parties We Share Data With">
              <p>
                We do not sell your personal data. We share it only with the following trusted
                service providers who process it on our behalf:
              </p>
              <div className="space-y-4">
                {[
                  {
                    name: 'Paddle.com Market Ltd',
                    role: 'Payment processing and subscription management (Merchant of Record)',
                    location: 'United Kingdom / United States',
                    link: 'https://www.paddle.com/legal/privacy',
                  },
                  {
                    name: 'Vercel Inc.',
                    role: 'Cloud hosting and infrastructure for the Service',
                    location: 'United States',
                    link: 'https://vercel.com/legal/privacy-policy',
                  },
                  {
                    name: 'Resend Inc.',
                    role: 'Transactional email delivery (account emails, receipts)',
                    location: 'United States',
                    link: 'https://resend.com/legal/privacy-policy',
                  },
                ].map((p) => (
                  <div key={p.name} className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
                    <p className="font-semibold text-foreground">{p.name}</p>
                    <p className="text-muted-foreground">{p.role}</p>
                    <p className="text-muted-foreground">Location: {p.location}</p>
                    <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Privacy policy →
                    </a>
                  </div>
                ))}
              </div>
              <p>
                We may also disclose your data if required by law, court order, or to protect
                the rights, property, or safety of MadeMeInvoice, our users, or the public.
              </p>
            </Section>

            <Section id="retention" title="6. Data Retention">
              <p>
                We retain your personal data only for as long as necessary to fulfil the purposes
                described in this Policy:
              </p>
              <ul className="space-y-2 pl-4">
                {[
                  'Account data — for the duration of your Account, plus 30 days after deletion to allow recovery.',
                  'Invoice and client data — retained until you delete it or close your Account.',
                  'Billing records — retained for 7 years to meet tax and accounting legal obligations.',
                  'Server logs — retained for 90 days for security and debugging purposes.',
                  'Support correspondence — retained for 2 years.',
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-sm">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="rights" title="7. Your Rights">
              <p>
                Depending on your location, you have the following rights regarding your personal
                data:
              </p>
              <div className="space-y-3">
                {[
                  ['Right of access', 'Request a copy of the personal data we hold about you.'],
                  ['Right to rectification', 'Ask us to correct inaccurate or incomplete data.'],
                  ['Right to erasure', 'Request deletion of your personal data ("right to be forgotten"), subject to legal obligations.'],
                  ['Right to portability', 'Receive your data in a structured, machine-readable format.'],
                  ['Right to restriction', 'Ask us to pause processing of your data in certain circumstances.'],
                  ['Right to object', 'Object to processing based on legitimate interests.'],
                  ['Right to withdraw consent', 'Where processing is based on consent, withdraw it at any time without affecting prior processing.'],
                  ['CCPA rights (California residents)', 'Right to know, delete, and opt-out of sale of personal information (we do not sell your data).'],
                ].map(([right, desc]) => (
                  <div key={right as string} className="flex gap-3 text-sm">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span><strong className="text-foreground">{right}:</strong> {desc}</span>
                  </div>
                ))}
              </div>
              <p>
                To exercise any of these rights, email us at{' '}
                <a href="mailto:contact@mademeinvoice.com" className="text-primary hover:underline">
                  contact@mademeinvoice.com
                </a>
                . We will respond within 30 days. We may need to verify your identity before
                processing your request.
              </p>
            </Section>

            <Section id="cookies" title="8. Cookies and Tracking">
              <Sub title="8.1 What we use">
                <p>
                  We use strictly necessary cookies to operate the Service, including session
                  cookies to keep you logged in and CSRF tokens for security. We do not use
                  third-party advertising or tracking cookies.
                </p>
              </Sub>
              <Sub title="8.2 Managing cookies">
                <p>
                  You can control cookies through your browser settings. Disabling strictly
                  necessary cookies will prevent the Service from functioning correctly.
                </p>
              </Sub>
            </Section>

            <Section id="transfers" title="9. International Data Transfers">
              <p>
                Some of our service providers (Vercel, Resend, Paddle) are located outside the
                European Economic Area (EEA). Where we transfer personal data outside the EEA,
                we ensure appropriate safeguards are in place, such as Standard Contractual
                Clauses approved by the European Commission or reliance on adequacy decisions.
              </p>
              <p>
                For more information about the safeguards applicable to a specific transfer,
                contact us at{' '}
                <a href="mailto:contact@mademeinvoice.com" className="text-primary hover:underline">
                  contact@mademeinvoice.com
                </a>
                .
              </p>
            </Section>

            <Section id="children" title="10. Children's Privacy">
              <p>
                The Service is not directed at children under the age of 16. We do not knowingly
                collect personal data from anyone under 16. If you believe a child under 16 has
                provided us with personal data, please contact us immediately and we will delete
                it promptly.
              </p>
            </Section>

            <Section id="breach" title="11. Data Breach Notification">
              <p>
                In the event of a personal data breach that is likely to result in a risk to the
                rights and freedoms of individuals, we will notify the relevant supervisory
                authority within 72 hours of becoming aware, as required by GDPR Article 33.
              </p>
              <p>
                If the breach is likely to result in a high risk to you, we will also notify you
                directly without undue delay and provide information on the nature of the breach
                and the steps you can take to protect yourself.
              </p>
            </Section>

            <Section id="dpa" title="12. Supervisory Authority">
              <p>
                If you are in the EU and believe we are processing your data unlawfully, you
                have the right to lodge a complaint with your local data protection supervisory
                authority. A list of EU supervisory authorities is available at{' '}
                <a
                  href="https://edpb.europa.eu/about-edpb/about-edpb/members_en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  edpb.europa.eu
                </a>
                .
              </p>
            </Section>

            <Section id="changes" title="13. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of
                material changes by email or by posting a notice in the Service. The "Last
                updated" date at the top of this page reflects the most recent revision.
                Continued use of the Service after changes take effect constitutes acceptance.
              </p>
            </Section>

            <Section id="contact" title="14. Contact Us">
              <p>
                For any questions, data access requests, or privacy concerns, please contact:
              </p>
              <div className="rounded-xl border border-border bg-muted/40 p-5 text-sm">
                <p className="font-semibold text-foreground">MadeMeInvoice — Privacy Team</p>
                <p>Morocco</p>
                <p>
                  Email:{' '}
                  <a href="mailto:contact@mademeinvoice.com" className="text-primary hover:underline">
                    contact@mademeinvoice.com
                  </a>
                </p>
                <p>We aim to respond to all requests within 30 days.</p>
              </div>
            </Section>

          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
