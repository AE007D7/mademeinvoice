import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    const { data: { user } } = await supabase.auth.getUser()
    if (user && next === '/dashboard') {
      const meta = user.user_metadata as { company_name?: string; phone?: string } | null

      // If signup form provided business info, save to branding and go straight to dashboard
      if (meta?.company_name) {
        await supabase.from('branding').upsert(
          { user_id: user.id, company_name: meta.company_name, phone: meta.phone ?? null },
          { onConflict: 'user_id' }
        )
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      // Otherwise redirect to onboarding (Google OAuth / old signups)
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
