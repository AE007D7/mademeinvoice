import Header from '@/components/landing/header'
import Hero from '@/components/landing/hero'
import Features from '@/components/landing/features'
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
      description: 'Free invoice generator — print-ready PDFs and instant email delivery for freelancers and small businesses.',
      publisher: { '@id': 'https://mademeinvoice.com/#organization' },
    },
    {
      '@type': 'Organization',
      '@id': 'https://mademeinvoice.com/#organization',
      name: 'Made Me Invoice',
      url: 'https://mademeinvoice.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://mademeinvoice.com/og-image.png',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Made Me Invoice',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://mademeinvoice.com',
      description:
        'Create professional invoices online in seconds. Print-ready PDFs, instant email delivery, custom branding, multi-currency and global tax support.',
      offers: [
        {
          '@type': 'Offer',
          name: 'Basic',
          price: '0',
          priceCurrency: 'USD',
          description: '1-day free trial with full access.',
        },
        {
          '@type': 'Offer',
          name: 'Pro',
          price: '9.99',
          priceCurrency: 'USD',
          billingIncrement: 'P1M',
          description: 'Unlimited invoices, custom branding, global tax rates.',
        },
      ],
      featureList: [
        'Print-ready PDF invoices',
        'Send invoices by email',
        'Custom branding with logo',
        'Multi-currency support',
        'Global tax rates',
        'Client management',
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '2000',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How fast can I create an invoice?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can create a professional invoice in under a minute — fill in your client details, add line items, and download a print-ready PDF or send it by email instantly.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I print my invoice directly?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Every invoice is print-optimised and can be saved as a PDF or sent to your printer in one click.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is Made Me Invoice free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes — start with a free 1-day trial that gives you full access. Pro plans start at $9.99/month for unlimited invoices.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I send invoices by email?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolutely. Hit the Send Email button on any invoice and it will be delivered to your client instantly with a link to view and print it online.',
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
        <Features />
        <Pricing />
      </main>
      <Footer />
    </>
  )
}
