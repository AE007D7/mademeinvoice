const testimonials = [
  {
    quote: "I used to spend 20 minutes formatting every invoice in Google Docs. Now it takes me 90 seconds and looks ten times more professional. My clients actually comment on how clean it looks.",
    name: 'Sarah K.',
    role: 'Freelance UI/UX Designer',
    initials: 'SK',
    color: 'bg-indigo-500',
  },
  {
    quote: "The PDF export is cleaner than what I was getting from accounting software I was paying $40/month for. The multi-currency support alone saved me several awkward client conversations.",
    name: 'Marc T.',
    role: 'Independent Strategy Consultant',
    initials: 'MT',
    color: 'bg-violet-500',
  },
  {
    quote: "Finally an invoicing tool that doesn't require a tutorial. I set it up, uploaded my logo, and sent my first invoice in under five minutes. The email delivery is instant — clients get it before I even close the tab.",
    name: 'Nina R.',
    role: 'Freelance Web Developer',
    initials: 'NR',
    color: 'bg-sky-500',
  },
]

function Stars() {
  return (
    <div className="flex gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-amber-400" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
  return (
    <section className="bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            User reviews
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Trusted by freelancers
            <br />
            <span className="gradient-text">who actually get paid</span>
          </h2>
          {/* Aggregate visible rating */}
          <div className="mt-5 flex items-center justify-center gap-2.5">
            <div className="flex gap-0.5" aria-label="4.9 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-amber-400" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm font-semibold text-foreground">4.9</span>
            <span className="text-sm text-muted-foreground">· 2,000+ freelancers</span>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-7 shadow-sm"
            >
              <Stars />
              <blockquote className="flex-1">
                <p className="text-sm leading-relaxed text-foreground/80">&ldquo;{t.quote}&rdquo;</p>
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${t.color} text-xs font-bold text-white`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
