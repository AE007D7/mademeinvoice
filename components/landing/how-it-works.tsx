const steps = [
  {
    number: '01',
    title: 'Add your client and line items',
    body: 'Enter your client\'s name and contact details, add what you delivered, and set your rate and currency. Made Me Invoice supports USD, EUR, GBP, CAD, AUD and more — plus all 50 US state tax rates and custom international rates. The whole thing takes under 60 seconds.',
  },
  {
    number: '02',
    title: 'Customize your branding',
    body: 'Upload your logo, choose an accent color, and pick from 10 professional invoice templates. Every invoice looks like it came from an established business — not a spreadsheet. You can also add a watermark, company stamp, and payment details like IBAN or PayPal.',
  },
  {
    number: '03',
    title: 'Send or print in one click',
    body: 'Email the invoice directly from the app, copy a shareable link your client can open in any browser, or export a print-ready PDF. Your client receives a clean, professional document — no account required on their end. Mark it paid when the money arrives.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            How it works
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            From zero to sent invoice
            <br />
            <span className="gradient-text">in three steps</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            No setup, no learning curve. Create your first invoice before you finish your coffee.
          </p>
        </div>

        <ol className="relative grid gap-8 md:grid-cols-3">
          {/* Connector line — desktop only */}
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-border md:block" style={{ left: '8%', right: '8%' }} aria-hidden="true" />

          {steps.map((step) => (
            <li key={step.number} className="relative flex flex-col gap-4">
              {/* Step number */}
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background shadow-sm">
                <span className="gradient-text text-xl font-bold tabular-nums">{step.number}</span>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
