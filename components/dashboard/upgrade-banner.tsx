'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { checkPlanAction } from '@/app/actions/billing'
import { Loader2, PartyPopper, Clock } from 'lucide-react'

function Banner() {
  const params   = useSearchParams()
  const router   = useRouter()
  const [state, setState] = useState<'idle' | 'polling' | 'success' | 'timeout'>('idle')

  const poll = useCallback(async () => {
    setState('polling')
    const deadline = Date.now() + 30_000
    while (Date.now() < deadline) {
      const plan = await checkPlanAction()
      if (plan === 'pro' || plan === 'enterprise') {
        setState('success')
        router.replace('/dashboard')
        return
      }
      await new Promise((r) => setTimeout(r, 2000))
    }
    setState('timeout')
  }, [router])

  useEffect(() => {
    if (params.get('upgraded') === '1') poll()
  }, [params, poll])

  if (state === 'idle') return null

  if (state === 'polling') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
        Activation de votre abonnement…
      </div>
    )
  }

  if (state === 'success') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
        <PartyPopper className="h-4 w-4 shrink-0" />
        Bienvenue dans Pro ! Toutes les fonctionnalités sont débloquées.
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
      <Clock className="h-4 w-4 shrink-0" />
      Votre paiement est en cours de traitement. Rafraîchissez la page dans quelques instants.
    </div>
  )
}

export function UpgradedBanner() {
  return (
    <Suspense>
      <Banner />
    </Suspense>
  )
}
