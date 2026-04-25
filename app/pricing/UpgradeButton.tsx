'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

export default function UpgradeButton({ clientId, planId }: { clientId: string; planId: string }) {
  const router = useRouter()
  const [error, setError] = useState('')

  if (!clientId || !planId) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Payment not configured yet.
      </p>
    )
  }

  return (
    <div>
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
              setError(body.error ?? 'Failed to activate. Please contact support.')
            }
          }}
          onError={() => setError('A PayPal error occurred. Please try again.')}
          onCancel={() => setError('')}
        />
      </PayPalScriptProvider>
      {error && (
        <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
