import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/sidebar'
import { getUiLang } from '@/lib/get-lang'
import { getUiT } from '@/lib/i18n'
import { isTrialActive } from '@/lib/subscription'
import { TrialExpiredOverlay } from '@/components/dashboard/trial-expired-overlay'
import { FloatingChatButton } from '@/components/ai-chat/FloatingChatButton'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [langResult, userDataRes] = await Promise.all([
    getUiLang(),
    supabase.from('users').select('plan, trial_ends_at').eq('id', user.id).single(),
  ])

  const lang = langResult
  const t = getUiT(lang)

  const userData = userDataRes.data
  const plan = userData?.plan ?? 'free'
  const trialExpired = plan === 'free' && !isTrialActive(userData?.trial_ends_at ?? null)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Sidebar (desktop) + mobile top bar */}
        <Sidebar t={t.nav} />
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
      {/* Blocking overlay shown when free trial has expired */}
      {trialExpired && <TrialExpiredOverlay />}
      {/* Floating AI chat button — hidden on /chat page */}
      <FloatingChatButton />
    </div>
  )
}
