'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { initializePaddle, type Paddle } from '@paddle/paddle-js'
import { CreditCard, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId?: string
  userEmail?: string
}

const PADDLE_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? ''
const PADDLE_PRICE  = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PRO ?? ''
const PADDLE_ENV    = (process.env.NEXT_PUBLIC_PADDLE_ENV ?? 'production') as 'production' | 'sandbox'

export function PaddleCheckoutButton({ userId, userEmail }: Props) {
  const [paddle, setPaddle]               = useState<Paddle | undefined>()
  const [initializing, setInitializing]   = useState(true)
  const [resolvedUserId, setResolvedUserId] = useState(userId ?? '')
  const [resolvedEmail,  setResolvedEmail]  = useState(userEmail ?? '')
  const [error, setError]                 = useState('')
  const router = useRouter()

  // Resolve user identity when not passed as props (e.g. trial overlay)
  useEffect(() => {
    if (!userId) {
      createClient().auth.getUser().then(({ data }) => {
        setResolvedUserId(data.user?.id ?? '')
        setResolvedEmail(data.user?.email ?? '')
      })
    }
  }, [userId])

  // Initialize Paddle.js once on mount
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
      .catch((err) => {
        console.error('[Paddle] Initialization failed:', err)
        setInitializing(false)
      })
  }, [router])

  function handleClick() {
    if (!paddle) return
    if (!PADDLE_PRICE) {
      console.warn('[Paddle] NEXT_PUBLIC_PADDLE_PRICE_ID_PRO is not set.')
      return
    }
    setError('')
    try {
      paddle.Checkout.open({
        items: [{ priceId: PADDLE_PRICE, quantity: 1 }],
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
      console.error('[Paddle] Checkout error:', err)
      setError('Unable to open checkout. Please try again.')
    }
  }

  const isReady    = !initializing && !!paddle && !!PADDLE_PRICE
  const isDisabled = !isReady

  return (
    <div className="space-y-1">
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className="gradient-primary flex w-full items-center justify-center gap-2 rounded-lg border-0 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {initializing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Initialisation…
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            S&apos;abonner avec Paddle
          </>
        )}
      </button>
      {error && <p className="text-center text-xs text-destructive">{error}</p>}
    </div>
  )
}
