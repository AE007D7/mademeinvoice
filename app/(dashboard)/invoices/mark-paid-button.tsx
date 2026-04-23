'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { updateInvoiceStatus } from '@/app/actions/invoices'
import { Button } from '@/components/ui/button'

export function MarkPaidButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  async function handleClick() {
    setIsPending(true)
    await updateInvoiceStatus(invoiceId, 'paid')
    router.refresh()
    setIsPending(false)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className="gap-1.5 text-green-600 hover:bg-green-50 hover:text-green-700"
      title="Mark as paid"
    >
      <CheckCircle className="h-4 w-4" />
      {isPending ? '…' : 'Paid'}
    </Button>
  )
}
