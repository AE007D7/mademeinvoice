import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = createClient(request, response)

  // getUser() validates with Supabase and silently refreshes expiring tokens,
  // writing the updated cookie back via the setAll handler in lib/supabase/proxy.ts
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

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
    '/((?!_next/static|_next/image|favicon\\.ico|api/webhooks/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
