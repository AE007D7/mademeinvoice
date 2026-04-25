'use client'

import { useState } from 'react'
import { Trash2, Plus, BookOpen, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type LineItem = {
  id: string
  description: string
  quantity: number
  price: number
}

type Product = { id: string; name: string; description?: string | null; price: number; unit: string }

type Props = {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
  products?: Product[]
}

function newItem(): LineItem {
  return { id: crypto.randomUUID(), description: '', quantity: 1, price: 0 }
}

export default function LineItemsTable({ items, onChange, products = [] }: Props) {
  const [showCatalog, setShowCatalog] = useState(false)

  function addRow() {
    onChange([...items, newItem()])
  }

  function addFromProduct(product: Product) {
    onChange([...items, {
      id: crypto.randomUUID(),
      description: product.name,
      quantity: 1,
      price: product.price,
    }])
    setShowCatalog(false)
  }

  function removeRow(id: string) {
    onChange(items.filter((i) => i.id !== id))
  }

  function update(id: string, field: keyof LineItem, value: string | number) {
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0)

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="hidden grid-cols-[1fr_80px_100px_80px_32px] gap-2 text-xs font-medium text-muted-foreground sm:grid">
        <span>Description</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Price</span>
        <span className="text-right">Total</span>
        <span />
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'grid gap-2',
              'grid-cols-1 sm:grid-cols-[1fr_80px_100px_80px_32px]'
            )}
          >
            <Input
              placeholder="Item description"
              value={item.description}
              onChange={(e) => update(item.id, 'description', e.target.value)}
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="1"
              value={item.quantity}
              onChange={(e) =>
                update(item.id, 'quantity', parseFloat(e.target.value) || 0)
              }
              className="text-right"
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={item.price}
              onChange={(e) =>
                update(item.id, 'price', parseFloat(e.target.value) || 0)
              }
              className="text-right"
            />
            <div className="flex items-center justify-end text-sm font-medium">
              ${(item.quantity * item.price).toFixed(2)}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeRow(item.id)}
              aria-label="Remove item"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add row / catalog */}
      <div className="relative flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add item
        </Button>
        {products.length > 0 && (
          <Button type="button" variant="outline" size="sm" onClick={() => setShowCatalog(v => !v)} className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            From catalog
          </Button>
        )}

        {/* Catalog dropdown */}
        {showCatalog && (
          <div className="absolute left-0 top-9 z-20 w-72 rounded-xl border border-border bg-card shadow-xl shadow-black/10">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <p className="text-xs font-semibold text-foreground">Your Products</p>
              <button type="button" onClick={() => setShowCatalog(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="max-h-52 overflow-y-auto divide-y divide-border">
              {products.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addFromProduct(p)}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-muted/60 transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{p.name}</p>
                    {p.description && <p className="text-xs text-muted-foreground truncate max-w-[160px]">{p.description}</p>}
                  </div>
                  <span className="ml-3 shrink-0 font-semibold text-foreground">${Number(p.price).toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Subtotal */}
      <div className="flex justify-end border-t border-border pt-2 text-sm font-semibold">
        Subtotal: ${subtotal.toFixed(2)}
      </div>
    </div>
  )
}
