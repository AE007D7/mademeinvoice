import Header from '@/components/landing/header'
import Hero from '@/components/landing/hero'
import HowItWorks from '@/components/landing/how-it-works'
import Features from '@/components/landing/features'
import Testimonials from '@/components/landing/testimonials'
import Pricing from '@/components/landing/pricing'
import Footer from '@/components/landing/footer'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://mademeinvoice.com/#website',
      url: 'https://mademeinvoice.com',
      name: 'Made Me Invoice',
      description: 'Free invoice generator for freelancers and small businesses — print-ready PDFs, instant email delivery, custom branding, and multi-currency support.',
      publisher: { '@id': 'https://mademeinvoice.com/#organization' },
    },
    {
      '@type': 'Organization',
      '@id': 'https://mademeinvoice.com/#organization',
      name: 'Made Me Invoice',
      url: 'https://mademeinvoice.com',
      sameAs: ['https://www.instagram.com/mademeinvoice/'],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'hello@mademeinvoice.com',
        contactType: 'customer support',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://mademeinvoice.com/#app',
      name: 'Made Me Invoice',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://mademeinvoice.com',
      description:
        'Create professional invoices online in under a minute. Made Me Invoice supports multi-currency billing, all 50 US state tax rates, custom branding with logo and watermark, 10 invoice templates, 7 invoice languages, and instant email delivery. Free 7-day trial — no credit card required.',
      screenshot: 'https://mademeinvoice.com/opengraph-image',
      featureList:
        'AI invoice assistant, Voice input with transcription, Print-ready PDF invoices, Email invoice delivery, 10 professional invoice templates, Invoices and estimates, Product catalog, Revenue analytics dashboard, Custom branding with logo watermark and stamp, Multi-currency support (USD EUR GBP CAD AUD), All 50 US state tax rates, Custom international tax rates, 7 invoice languages, Client management, Estimate to invoice conversion',
      offers: [
        {
          '@type': 'Offer',
          name: 'Free Trial',
          price: '0',
          priceCurrency: 'USD',
          description: '7-day full-access free trial. No credit card required. Up to 2 invoices per month on the free plan after the trial.',
        },
        {
          '@type': 'Offer',
          name: 'Pro',
          price: '4.99',
          priceCurrency: 'USD',
          description: 'Unlimited invoices, custom branding, global tax rates, multi-currency, priority support. Billed monthly.',
        },
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '2000',
        bestRating: '5',
        worstRating: '1',
      },
      review: [
        {
          '@type': 'Review',
          reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
          author: { '@type': 'Person', name: 'Sarah K.' },
          reviewBody: 'I used to spend 20 minutes formatting every invoice. Now it takes 90 seconds and looks ten times more professional.',
        },
        {
          '@type': 'Review',
          reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
          author: { '@type': 'Person', name: 'Marc T.' },
          reviewBody: 'The PDF export is cleaner than what I was getting from accounting software I was paying $40/month for.',
        },
        {
          '@type': 'Review',
          reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
          author: { '@type': 'Person', name: 'Nina R.' },
          reviewBody: 'Finally an invoicing tool that does not require a tutorial. Set up, uploaded my logo, sent my first invoice in under five minutes.',
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to create and send a professional invoice with Made Me Invoice',
      description: 'Create a professional invoice, customize it with your branding, and send it to your client — all in under a minute.',
      totalTime: 'PT1M',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Add your client and line items',
          text: 'Enter your client\'s name and contact details, add what you delivered, and set your rate and currency. Made Me Invoice supports USD, EUR, GBP, CAD, AUD and more — plus all 50 US state tax rates and custom international rates.',
          url: 'https://mademeinvoice.com/#how-it-works',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Customize your branding',
          text: 'Upload your logo, choose an accent color, and pick from 10 professional invoice templates. Add a watermark, company stamp, and payment details like IBAN or PayPal.',
          url: 'https://mademeinvoice.com/#how-it-works',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Send or print in one click',
          text: 'Email the invoice directly from the app, copy a shareable link, or export a print-ready PDF. Your client receives a clean, professional document — no account required on their end.',
          url: 'https://mademeinvoice.com/#how-it-works',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How fast can I create an invoice with Made Me Invoice?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can create and send a professional invoice in under a minute. Enter your client details, add your line items and rate, pick a currency and tax rate, then hit send. The invoice is emailed to your client instantly, and you can also export a print-ready PDF with one click.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is Made Me Invoice free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes — Made Me Invoice starts with a free 7-day trial that gives you full access to all features, no credit card required. After the trial, the free plan lets you create up to 2 invoices per month. The Pro plan is $4.99/month and gives you unlimited invoices, custom branding, and priority support.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I print my invoice as a PDF?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Every invoice is print-optimised and formatted for A4 paper. You can export a PDF directly from the invoice page, or use the browser print dialog to save as PDF. The exported file is clean — no UI chrome, no watermarks on free plans, just your professional invoice.',
          },
        },
        {
          '@type': 'Question',
          name: 'What currencies does Made Me Invoice support?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Made Me Invoice supports USD, EUR, GBP, CAD, AUD, and several more currencies. The currency symbol and code appear on every invoice. You can bill different clients in different currencies — there is no restriction per account.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does it support different tax rates?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Made Me Invoice has all 50 US state sales tax rates built in — just pick your state and the rate is applied automatically. For international invoices you can enter any custom tax rate as a percentage. The invoice shows the tax line and the total including tax.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I add my company logo to invoices?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Upload your logo in the branding settings and it will appear on every invoice you create. You can also set the logo size (small, medium, or large), add a background watermark, and upload a company stamp image. All branding is applied automatically to every new invoice.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I send invoices directly to clients by email?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Every invoice has a Send Email button. Enter or confirm the client\'s email address, and the invoice is delivered immediately with a link to view and print it online. The client does not need a Made Me Invoice account to view or download the invoice.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does Made Me Invoice support multiple languages?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes — invoices can be generated in English, French, Spanish, German, Arabic, Portuguese, or Italian. The language setting applies to all invoice labels and date formats. You can set a default invoice language in your branding settings, or change it per invoice.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I create estimates or quotes in addition to invoices?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Made Me Invoice supports both invoices and estimates. Create an estimate for a project, share it with your client for approval, and convert it to a final invoice with one click when the work is done — no re-entering of data required.',
          },
        },
        {
          '@type': 'Question',
          name: 'What invoice templates are available?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Made Me Invoice offers 10 professional invoice templates: Modern, Minimal, Classic, Bold, Corporate, Elegant, Creative, Executive, Noir, and Retro. Each template supports your logo, accent color, and all invoice fields. You can switch templates at any time, including when editing an existing invoice.',
          },
        },
      ],
    },
  ],
}

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
    </>
  )
}
