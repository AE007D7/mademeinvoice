import Link from 'next/link'
import { FileText } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 font-semibold text-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="tracking-tight">Made Me Invoice</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Professional invoicing for freelancers and growing teams. Create,
              send, and get paid — faster.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground">Product</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/#features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="/signup" className="hover:text-foreground transition-colors">Get started</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground">Account</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground transition-colors">Log in</Link></li>
              <li><Link href="/signup" className="hover:text-foreground transition-colors">Sign up</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground">Legal</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="hover:text-foreground transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {year} Made Me Invoice. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link
              href="https://www.instagram.com/mademeinvoice/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              Instagram
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
