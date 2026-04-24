import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    // Redirect new users (no branding yet) to onboarding
    const { data: { user } } = await supabase.auth.getUser()
    if (user && next === '/dashboard') {
      const { data: branding } = await supabase
        .from('branding')
        .select('company_name')
        .eq('user_id', user.id)
        .single()

      if (!branding?.company_name) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url))
}
