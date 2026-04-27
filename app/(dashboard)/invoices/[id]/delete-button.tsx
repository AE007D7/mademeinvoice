'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteInvoiceAction } from '@/app/actions/invoices'
import { Button } from '@/components/ui/button'

export function DeleteButton({ invoiceId }: { invoiceId: string }) {
  const [isPending, setIsPending] = useState(false)

  async function handleClick() {
    if (!confirm('Delete this invoice? This cannot be undone.')) return
    setIsPending(true)
    const result = await deleteInvoiceAction(invoiceId)
    if (result?.error) {
      alert(result.error)
      setIsPending(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {isPending ? 'Deleting…' : 'Delete'}
    </Button>
  )
}
