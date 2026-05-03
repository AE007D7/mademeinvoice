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
const PADDLE_PRICE = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PRO ?? ''
const PADDLE_ENV   = (process.env.NEXT_PUBLIC_PADDLE_ENV ?? 'production') as 'production' | 'sandbox'

export function PaddleCheckoutButton({ userId, userEmail }: Props) {
  const [paddle, setPaddle]                 = useState<Paddle | undefined>()
  const [initializing, setInitializing]     = useState(true)
  const [resolvedUserId, setResolvedUserId] = useState(userId ?? '')
  const [resolvedEmail,  setResolvedEmail]  = useState(userEmail ?? '')
  const [error, setError]                   = useState('')
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
    // ── Step 2: log the exact values being used ──────────────────────────────
    console.log('[PADDLE] Config check:', {
      environment: PADDLE_ENV,
      tokenPrefix:  PADDLE_TOKEN  ? PADDLE_TOKEN.slice(0, 12) + '…'  : '⚠️  NOT SET',
      priceId:      PADDLE_PRICE  ? PADDLE_PRICE                      : '⚠️  NOT SET',
      tokenMatchesEnv:
        (PADDLE_ENV === 'production' && PADDLE_TOKEN.startsWith('live_')) ||
        (PADDLE_ENV === 'sandbox'    && PADDLE_TOKEN.startsWith('test_'))
          ? '✅ match'
          : '❌ MISMATCH — env/token must both be production+live_ or sandbox+test_',
    })

    if (!PADDLE_TOKEN) {
      console.warn('[PADDLE] ⚠️  NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not set — button disabled.')
      setInitializing(false)
      return
    }

    initializePaddle({
      environment: PADDLE_ENV,
      token: PADDLE_TOKEN,
      // ── Step 3: capture ALL Paddle events including errors ─────────────────
      eventCallback(evt) {
        console.log('[PADDLE EVENT]', evt.name, evt)
        if (evt.name === 'checkout.completed') {
          router.push('/dashboard?upgraded=1')
        }
      },
    })
      .then((p) => {
        console.log('[PADDLE] ✅ Initialized successfully. Instance:', p)
        setPaddle(p)
        setInitializing(false)
      })
      .catch((err: unknown) => {
        console.error('[PADDLE] ❌ Initialization failed:', err)
        setInitializing(false)
      })
  }, [router])

  // ── Step 4: log full options + catch errors in checkout.open() ─────────────
  function handleClick() {
    if (!paddle) {
      console.warn('[PADDLE] handleClick: paddle instance is null — not initialized yet.')
      return
    }
    if (!PADDLE_PRICE) {
      console.warn('[PADDLE] ⚠️  NEXT_PUBLIC_PADDLE_PRICE_ID_PRO is not set — cannot open checkout.')
      return
    }

    const checkoutOptions = {
      items: [{ priceId: PADDLE_PRICE, quantity: 1 }],
      ...(resolvedEmail ? { customer: { email: resolvedEmail } } : {}),
      customData: { user_id: resolvedUserId },
      settings: {
        displayMode: 'overlay' as const,
        theme: 'light' as const,
        locale: 'fr',
        successUrl: `${window.location.origin}/dashboard?upgraded=1`,
      },
    }

    // ── Log the full options BEFORE calling open() ────────────────────────────
    console.log('[PADDLE] Opening checkout with:', JSON.stringify(checkoutOptions, null, 2))

    setError('')
    try {
      paddle.Checkout.open(checkoutOptions)
    } catch (err: unknown) {
      const e = err as Error
      console.error('[PADDLE] ❌ Checkout.open() threw:', e?.message, e?.stack, e)
      setError('Unable to open checkout — see console for details.')
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
