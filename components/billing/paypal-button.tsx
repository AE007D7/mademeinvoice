'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

export function PayPalSubscribeButton({ planId, clientId }: { planId: string; clientId: string; userId?: string }) {
  const router = useRouter()
  const [error, setError] = useState('')

  if (!clientId) return null

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        intent: 'subscription',
        vault: true,
        currency: 'USD',
      }}
    >
      <PayPalButtons
        style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'subscribe' }}
        createSubscription={(_data, actions) =>
          actions.subscription.create({ plan_id: planId })
        }
        onApprove={async (data) => {
          setError('')
          const res = await fetch('/api/paypal/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscriptionID: data.subscriptionID }),
          })
          if (res.ok) {
            router.push('/dashboard?upgraded=1')
          } else {
            const body = await res.json().catch(() => ({})) as { error?: string }
            setError(body.error ?? 'Failed to activate subscription. Please contact support.')
          }
        }}
        onError={() => setError('A PayPal error occurred. Please try again.')}
        onCancel={() => setError('Subscription cancelled.')}
      />
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </PayPalScriptProvider>
  )
}
