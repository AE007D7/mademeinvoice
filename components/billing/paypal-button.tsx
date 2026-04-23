'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    paypal?: {
      Buttons: (opts: {
        createSubscription: (data: unknown, actions: { subscription: { create: (o: { plan_id: string; custom_id: string }) => Promise<string> } }) => Promise<string>
        onApprove: () => void
        onError: (err: unknown) => void
        style?: Record<string, unknown>
      }) => { render: (el: HTMLElement) => void }
    }
  }
}

export function PayPalSubscribeButton({ planId, userId }: { planId: string; userId: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  useEffect(() => {
    if (!clientId || !containerRef.current) return
    if (document.getElementById('paypal-sdk')) {
      renderButtons()
      return
    }
    const script = document.createElement('script')
    script.id = 'paypal-sdk'
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`
    script.setAttribute('data-sdk-integration-source', 'button-factory')
    script.onload = renderButtons
    document.body.appendChild(script)

    function renderButtons() {
      if (!window.paypal || !containerRef.current) return
      containerRef.current.innerHTML = ''
      window.paypal.Buttons({
        createSubscription: (_data, actions) =>
          actions.subscription.create({ plan_id: planId, custom_id: userId }),
        onApprove: () => { window.location.href = '/billing?success=1' },
        onError: (err) => { console.error('PayPal error', err) },
        style: { shape: 'rect', color: 'blue', layout: 'vertical', label: 'subscribe' },
      }).render(containerRef.current!)
    }
  }, [clientId, planId, userId])

  if (!clientId) return null

  return <div ref={containerRef} className="w-full" />
}
