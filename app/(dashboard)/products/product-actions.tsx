'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this product?')) return
    setIsPending(true)
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', productId)
    router.refresh()
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isPending}
      className="text-muted-foreground hover:text-destructive">
      {isPending ? '…' : 'Delete'}
    </Button>
  )
}
