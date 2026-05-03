'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { initializePaddle, type Paddle } from '@paddle/paddle-js'
import { CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId?: string
  userEmail?: string
}

export function PaddleCheckoutButton({ userId, userEmail }: Props) {
  const [paddle, setPaddle] = useState<Paddle | undefined>()
  const [resolvedUserId, setResolvedUserId] = useState(userId)
  const [resolvedEmail, setResolvedEmail] = useState(userEmail)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    initializePaddle({
      environment: 'production',
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
      eventCallback(event) {
        if (event.name === 'checkout.completed') {
          router.push('/dashboard?upgraded=1')
        }
      },
    }).then(setPaddle)
  }, [router])

  useEffect(() => {
    if (!userId) {
      createClient().auth.getUser().then(({ data }) => {
        setResolvedUserId(data.user?.id)
        setResolvedEmail(data.user?.email)
      })
    }
  }, [userId])

  async function handleClick() {
    if (!paddle) return
    setLoading(true)
    try {
      paddle.Checkout.open({
        items: [{ priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PRO!, quantity: 1 }],
        ...(resolvedEmail ? { customer: { email: resolvedEmail } } : {}),
        customData: { userId: resolvedUserId ?? '' },
        settings: {
          displayMode: 'overlay',
          successUrl: `${window.location.origin}/dashboard?upgraded=1`,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  if (!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || !process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PRO) {
    return null
  }

  return (
    <button
      onClick={handleClick}
      disabled={!paddle || loading}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <CreditCard className="h-4 w-4" />
      {loading ? 'Loading…' : 'Pay with Card'}
    </button>
  )
}
