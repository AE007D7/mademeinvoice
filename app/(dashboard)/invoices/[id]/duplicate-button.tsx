'use client'

import { useState } from 'react'
import { Copy } from 'lucide-react'
import { duplicateInvoiceAction } from '@/app/actions/invoices'
import { Button } from '@/components/ui/button'

export function DuplicateButton({ invoiceId }: { invoiceId: string }) {
  const [isPending, setIsPending] = useState(false)

  async function handleClick() {
    setIsPending(true)
    const result = await duplicateInvoiceAction(invoiceId)
    if (result?.error) {
      alert(result.error)
      setIsPending(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={isPending} className="gap-1.5">
      <Copy className="h-3.5 w-3.5" />
      {isPending ? 'Duplicating…' : 'Duplicate'}
    </Button>
  )
}
