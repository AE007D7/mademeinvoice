import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = createClient(request, response)

  // getClaims() verifies JWT locally — no network call, correct for proxy
  const { data } = await supabase.auth.getClaims()
  const isAuthenticated = !!data?.claims

  const { pathname } = request.nextUrl
  const protectedPaths = ['/dashboard', '/invoices', '/clients', '/settings', '/billing', '/onboarding']
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(pathname)

  if (isProtected && !isAuthenticated) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
