import {
  FileText,
  Users,
  Globe,
  DollarSign,
  Palette,
  Mic,
  LayoutTemplate,
  ClipboardList,
  Languages,
  Package,
  BarChart3,
  Sparkles,
} from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'AI Invoice Assistant',
    description:
      'Describe your project in plain language and the AI builds the entire invoice — line items, rates, and totals — instantly. No forms to fill.',
    color: 'bg-violet-600',
    highlight: true,
  },
  {
    icon: Mic,
    title: 'Voice Input',
    description:
      'Tap the mic and describe your work out loud. Your voice is transcribed and turned into a complete invoice draft in seconds.',
    color: 'bg-indigo-500',
    highlight: true,
  },
  {
    icon: LayoutTemplate,
    title: '10 Invoice Templates',
    description:
      'Classic, Modern, Minimal, Bold, Stripe, Corporate, Noir, Studio, Luxe, and more — each fully branded with your logo and colors.',
    color: 'bg-sky-500',
  },
  {
    icon: ClipboardList,
    title: 'Invoices & Estimates',
    description:
      'Switch between Invoice and Estimate with one click. Convert an accepted estimate to a final invoice — no re-entering data.',
    color: 'bg-teal-500',
  },
  {
    icon: Package,
    title: 'Product Catalog',
    description:
      'Save your recurring services and products as reusable items. Add them to any invoice in one click — no more retyping rates.',
    color: 'bg-amber-500',
  },
  {
    icon: BarChart3,
    title: 'Revenue Analytics',
    description:
      'Track revenue, invoice status, and client activity with built-in charts. See your earnings at a glance from the dashboard.',
    color: 'bg-emerald-500',
  },
  {
    icon: Users,
    title: 'Client Management',
    description:
      'Store client details, billing history, and contact info in one place. Pre-fill invoices with a single select.',
    color: 'bg-cyan-500',
  },
  {
    icon: Globe,
    title: 'Global Tax Support',
    description:
      'All 50 US state rates built in, plus custom international tax for any country. Tax line and totals calculated automatically.',
    color: 'bg-green-500',
  },
  {
    icon: DollarSign,
    title: 'Multi-Currency',
    description:
      'Bill clients in USD, EUR, GBP, CAD, AUD, and more. Currency symbol and code shown on every invoice.',
    color: 'bg-pink-500',
  },
  {
    icon: Languages,
    title: '7 Invoice Languages',
    description:
      'Generate invoices in English, French, Spanish, German, Arabic, Portuguese, or Italian — labels and dates switch automatically.',
    color: 'bg-orange-500',
  },
  {
    icon: Palette,
    title: 'Custom Branding',
    description:
      'Upload your logo, watermark, and company stamp. Drag the stamp to any position on the invoice. Every document is on-brand.',
    color: 'bg-rose-500',
  },
  {
    icon: FileText,
    title: 'Print-Ready PDFs',
    description:
      'Every invoice is formatted for A4 print. Export a pixel-perfect PDF, share a public link, or send by email — in one click.',
    color: 'bg-slate-500',
  },
]

export default function Features() {
  return (
    <section id="features" className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-5">
        {/* Section label */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Features
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Everything to run your
            <br />
            <span className="gradient-text">freelance business</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            AI-powered invoicing, a full client and product catalog, revenue analytics — plus all the
            professional tools you need to get paid.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                feature.highlight
                  ? 'border-primary/20 bg-primary/5 hover:border-primary/30 hover:shadow-primary/10'
                  : 'border-border bg-card hover:border-primary/20 hover:shadow-primary/5'
              }`}
            >
              <div
                className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.color}`}
              >
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
