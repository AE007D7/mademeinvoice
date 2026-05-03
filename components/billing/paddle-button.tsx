'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { initializePaddle, type Paddle } from '@paddle/paddle-js'
import { Zap, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PRO_PLAN, formatProPrice } from '@/lib/paddle/pricing'

interface Props {
  userId?: string
  userEmail?: string
}

const PADDLE_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? ''
const PADDLE_ENV   = (process.env.NEXT_PUBLIC_PADDLE_ENV ?? 'production') as 'production' | 'sandbox'

export function PaddleCheckoutButton({ userId, userEmail }: Props) {
  const [paddle, setPaddle]                 = useState<Paddle | undefined>()
  const [initializing, setInitializing]     = useState(true)
  const [resolvedUserId, setResolvedUserId] = useState(userId ?? '')
  const [resolvedEmail,  setResolvedEmail]  = useState(userEmail ?? '')
  const [error, setError]                   = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!userId) {
      createClient().auth.getUser().then(({ data }) => {
        setResolvedUserId(data.user?.id ?? '')
        setResolvedEmail(data.user?.email ?? '')
      })
    }
  }, [userId])

  useEffect(() => {
    if (!PADDLE_TOKEN) {
      console.warn('[Paddle] NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not set.')
      setInitializing(false)
      return
    }
    initializePaddle({
      environment: PADDLE_ENV,
      token: PADDLE_TOKEN,
      eventCallback(evt) {
        if (evt.name === 'checkout.completed') {
          router.push('/dashboard?upgraded=1')
        }
      },
    })
      .then((p) => { setPaddle(p); setInitializing(false) })
      .catch((err) => { console.error('[Paddle] Init failed:', err); setInitializing(false) })
  }, [router])

  function handleClick() {
    if (!paddle || !PRO_PLAN.priceId) return
    setError('')
    try {
      paddle.Checkout.open({
        items: [{ priceId: PRO_PLAN.priceId, quantity: 1 }],
        ...(resolvedEmail ? { customer: { email: resolvedEmail } } : {}),
        customData: { user_id: resolvedUserId },
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          locale: 'fr',
          successUrl: `${window.location.origin}/dashboard?upgraded=1`,
        },
      })
    } catch (err) {
      console.error('[Paddle] Checkout.open error:', err)
      setError('Impossible d\'ouvrir le paiement. Veuillez réessayer.')
    }
  }

  const isDisabled = initializing || !paddle || !PRO_PLAN.priceId

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className="gradient-primary flex w-full items-center justify-center gap-2 rounded-lg border-0 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {initializing ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</>
        ) : (
          <><Zap className="h-4 w-4" /> Passer à Pro — {formatProPrice()}</>
        )}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        Essai gratuit de {PRO_PLAN.trialDays} jours · Sans engagement · Annulez à tout moment
      </p>
      {error && <p className="text-center text-xs text-destructive">{error}</p>}
    </div>
  )
}
