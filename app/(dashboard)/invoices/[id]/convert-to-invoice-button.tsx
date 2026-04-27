'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { convertToInvoiceAction } from '@/app/actions/invoices'

export function ConvertToInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  async function handleConvert() {
    setIsPending(true)
    await convertToInvoiceAction(invoiceId)
    router.refresh()
    setIsPending(false)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleConvert}
      disabled={isPending}
      className="gap-1.5 border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800"
    >
      <FileText className="h-3.5 w-3.5" />
      {isPending ? 'Converting…' : 'Convert to Invoice'}
    </Button>
  )
}
