import {
  FileText,
  Users,
  Globe,
  DollarSign,
  Palette,
  Zap,
} from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Professional Invoices',
    description:
      'PDF-ready invoices with your logo, watermark, and company branding. Print or send in seconds.',
    color: 'bg-indigo-500',
  },
  {
    icon: Users,
    title: 'Client Management',
    description:
      'Keep all client details, billing history, and contact info organized in one place.',
    color: 'bg-violet-500',
  },
  {
    icon: Globe,
    title: 'Global Tax Support',
    description:
      'All 50 US state rates built-in, plus custom international tax for any country.',
    color: 'bg-sky-500',
  },
  {
    icon: DollarSign,
    title: 'Multi-Currency',
    description:
      'Bill clients in USD, EUR, GBP, CAD, AUD, and more. Currency shown on every invoice.',
    color: 'bg-emerald-500',
  },
  {
    icon: Palette,
    title: 'Custom Branding',
    description:
      'Upload your logo and watermark. Every invoice is on-brand — professional and consistent.',
    color: 'bg-pink-500',
  },
  {
    icon: Zap,
    title: 'Free Trial',
    description:
      'Full Pro access for 1 day, no credit card required. Upgrade when you\'re ready.',
    color: 'bg-amber-500',
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
            No bloat, no complexity — just the tools you need to create invoices
            and get paid.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
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
