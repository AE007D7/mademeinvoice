import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/proxy'
import { countryToLang } from '@/lib/geo-lang'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = createClient(request, response)

  // Auto-detect language from IP country on first visit (cookie not yet set).
  // Vercel injects x-vercel-ip-country on every edge request; Cloudflare uses
  // cf-ipcountry. We only write the cookie when the user hasn't chosen manually.
  if (!request.cookies.has('mmi_ui_lang')) {
    const country =
      request.headers.get('x-vercel-ip-country') ??
      request.headers.get('cf-ipcountry')
    const lang = countryToLang(country)
    response.cookies.set('mmi_ui_lang', lang, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    })
  }

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
