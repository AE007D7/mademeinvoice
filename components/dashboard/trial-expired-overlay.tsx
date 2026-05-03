'use client'

import { Zap, Lock } from 'lucide-react'
import { PayPalSubscribeButton } from '@/components/billing/paypal-button'
import { PaddleCheckoutButton } from '@/components/billing/paddle-button'

const paypalPlanId  = process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_PRO_MONTHLY ?? ''
const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ''

export function TrialExpiredOverlay() {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      className="flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Icon */}
        <div className="mb-5 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
            <Lock className="h-7 w-7 text-indigo-600" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="mb-2 text-center text-2xl font-bold text-foreground">
          Your free trial has ended
        </h2>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Upgrade to Pro to keep creating unlimited invoices, estimates, and more.
        </p>

        {/* Pro plan highlight */}
        <div className="mb-5 rounded-xl border-2 border-indigo-500 bg-indigo-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Pro Plan</p>
              <p className="text-xs text-muted-foreground">$4.99 / month</p>
            </div>
            <span className="ml-auto rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-medium text-white">
              Popular
            </span>
          </div>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {[
              'Unlimited invoices & estimates',
              'Custom branding (logo + watermark)',
              'PDF & JPEG export',
              'Multi-currency support',
              '7 invoice languages',
              'Priority support',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Payment options */}
        <div className="space-y-3">
          <PaddleCheckoutButton />
          {paypalPlanId && paypalClientId && (
            <>
              <div className="flex items-center gap-2">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <PayPalSubscribeButton planId={paypalPlanId} clientId={paypalClientId} />
            </>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Cancel anytime. No hidden fees.
        </p>
      </div>
    </div>
  )
}
