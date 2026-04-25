'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewProductPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('unit')
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required.'); return }
    if (!price || isNaN(parseFloat(price))) { setError('Valid price is required.'); return }
    setError('')
    setIsPending(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated.'); setIsPending(false); return }
    const { error: dbError } = await supabase.from('products').insert({
      user_id: user.id,
      name: name.trim(),
      description: description.trim() || null,
      price: parseFloat(price),
      unit: unit.trim() || 'unit',
    })
    if (dbError) { setError(dbError.message); setIsPending(false) }
    else router.push('/products')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add Product</h1>
        <p className="text-sm text-muted-foreground">Add a reusable product to your catalog.</p>
      </div>
      <Card className="max-w-lg">
        <CardHeader><CardTitle className="text-base">Product Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
              <Input id="name" placeholder="Web Design" value={name} onChange={e => setName(e.target.value)} required disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Custom website design and development" value={description} onChange={e => setDescription(e.target.value)} disabled={isPending} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price">Price <span className="text-destructive">*</span></Label>
                <Input id="price" type="number" min="0" step="0.01" placeholder="99.00" value={price} onChange={e => setPrice(e.target.value)} required disabled={isPending} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" placeholder="hour / page / unit" value={unit} onChange={e => setUnit(e.target.value)} disabled={isPending} />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" disabled={isPending}>{isPending ? 'Saving…' : 'Add Product'}</Button>
              <Button type="button" variant="outline" onClick={() => router.push('/products')} disabled={isPending}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
