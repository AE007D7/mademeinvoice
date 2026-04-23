'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cancelSubscriptionAction, deleteAccountAction } from '@/app/actions/billing'
import { Button } from '@/components/ui/button'

export function CancelSubscriptionButton() {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const router = useRouter()

  function handleCancel() {
    if (!confirm('Cancel your Pro subscription? You will revert to the free plan.')) return
    startTransition(async () => {
      await cancelSubscriptionAction()
      setDone(true)
      router.refresh()
    })
  }

  if (done) return <p className="text-sm text-muted-foreground">Subscription cancelled.</p>
  return (
    <Button variant="outline" size="sm" onClick={handleCancel} disabled={isPending}>
      {isPending ? 'Cancelling…' : 'Cancel subscription'}
    </Button>
  )
}

export function DeleteAccountButton() {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Permanently delete your account? This cannot be undone.')) return
    startTransition(async () => {
      await deleteAccountAction()
    })
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
      {isPending ? 'Deleting…' : 'Delete account'}
    </Button>
  )
}

export function StripeCheckoutButton({
  label,
  priceId,
  mode,
}: {
  label: string
  priceId: string
  mode: 'subscription' | 'payment'
}) {
  const [isPending, setIsPending] = useState(false)

  async function handleClick() {
    setIsPending(true)
    const res = await fetch('/api/billing/stripe-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, mode }),
    })
    const data = await res.json() as { url?: string }
    if (data.url) window.location.href = data.url
    else setIsPending(false)
  }

  return (
    <Button onClick={handleClick} disabled={isPending} className="w-full">
      {isPending ? 'Redirecting…' : label}
    </Button>
  )
}
