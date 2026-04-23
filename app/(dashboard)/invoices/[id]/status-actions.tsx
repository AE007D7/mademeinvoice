'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Send, AlertTriangle } from 'lucide-react'
import { updateInvoiceStatus } from '@/app/actions/invoices'
import { Button } from '@/components/ui/button'

const TRANSITIONS: Record<string, { label: string; next: string; icon: React.ReactNode; variant: 'default' | 'outline' }[]> = {
  draft: [
    { label: 'Mark as Sent', next: 'sent', icon: <Send className="h-4 w-4" />, variant: 'outline' },
    { label: 'Mark as Paid', next: 'paid', icon: <CheckCircle className="h-4 w-4" />, variant: 'default' },
  ],
  sent: [
    { label: 'Mark as Paid', next: 'paid', icon: <CheckCircle className="h-4 w-4" />, variant: 'default' },
    { label: 'Mark as Overdue', next: 'overdue', icon: <AlertTriangle className="h-4 w-4" />, variant: 'outline' },
  ],
  overdue: [
    { label: 'Mark as Paid', next: 'paid', icon: <CheckCircle className="h-4 w-4" />, variant: 'default' },
  ],
  paid: [],
}

type Props = {
  invoiceId: string
  currentStatus: string
}

export function StatusActions({ invoiceId, currentStatus }: Props) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const transitions = TRANSITIONS[currentStatus] ?? []

  if (transitions.length === 0) return null

  async function handleUpdate(next: string) {
    setIsPending(true)
    await updateInvoiceStatus(invoiceId, next)
    router.refresh()
    setIsPending(false)
  }

  return (
    <>
      {transitions.map((t) => (
        <Button
          key={t.next}
          variant={t.variant}
          onClick={() => handleUpdate(t.next)}
          disabled={isPending}
          className={`gap-2 ${t.next === 'paid' ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800' : ''}`}
        >
          {t.icon}
          {t.label}
        </Button>
      ))}
    </>
  )
}
