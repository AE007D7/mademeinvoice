'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Check } from 'lucide-react'
import { sendInvoiceEmailAction } from '@/app/actions/email'
import { Button } from '@/components/ui/button'

export function SendEmailButton({ invoiceId, clientEmail }: { invoiceId: string; clientEmail?: string | null }) {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  if (!clientEmail) {
    return (
      <p className="text-xs text-muted-foreground">
        No client email — <a href="/clients" className="underline underline-offset-2">add one</a> to send by email.
      </p>
    )
  }

  function handleSend() {
    setError('')
    startTransition(async () => {
      const result = await sendInvoiceEmailAction(invoiceId)
      if (result?.error) {
        setError(result.error)
      } else {
        setSent(true)
        router.refresh()
      }
    })
  }

  if (sent) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-green-600">
        <Check className="h-4 w-4" />
        Sent to {clientEmail}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <Button variant="outline" onClick={handleSend} disabled={isPending} className="gap-2">
        <Send className="h-4 w-4" />
        {isPending ? 'Sending…' : `Send to ${clientEmail}`}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
