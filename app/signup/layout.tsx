import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create your free account',
  description: 'Sign up for Made Me Invoice — free for 7 days, no credit card required. Create your first professional invoice in under a minute.',
  alternates: { canonical: '/signup' },
  robots: { index: true, follow: true },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
