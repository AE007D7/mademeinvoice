'use client'

import { useState } from 'react'
import { Trash2, Plus, BookOpen, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
  const [rawQty, setRawQty]     = useState<Record<string, string>>({})
  const [rawPrice, setRawPrice] = useState<Record<string, string>>({})

  function addRow() { onChange([...items, newItem()]) }

  function addFromProduct(product: Product) {
    onChange([...items, { id: crypto.randomUUID(), description: product.name, quantity: 1, price: product.price }])
    setShowCatalog(false)
  }

  function removeRow(id: string) {
    onChange(items.filter((i) => i.id !== id))
    setRawQty(r => { const n = { ...r }; delete n[id]; return n })
    setRawPrice(r => { const n = { ...r }; delete n[id]; return n })
  }

  function updateDesc(id: string, value: string) {
    onChange(items.map((i) => (i.id === id ? { ...i, description: value } : i)))
  }

  function updateQty(id: string, raw: string) {
    setRawQty(r => ({ ...r, [id]: raw }))
    const n = parseFloat(raw)
    if (!isNaN(n) && n >= 0) onChange(items.map(i => i.id === id ? { ...i, quantity: n } : i))
  }

  function updatePrice(id: string, raw: string) {
    setRawPrice(r => ({ ...r, [id]: raw }))
    const n = parseFloat(raw)
    if (!isNaN(n) && n >= 0) onChange(items.map(i => i.id === id ? { ...i, price: n } : i))
  }

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0)

  return (
    <div className="space-y-3">
      {/* Items */}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-border bg-muted/20 p-2.5 space-y-2">

            {/* Row 1: description (full width) + delete */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Item description"
                value={item.description}
                onChange={(e) => updateDesc(item.id, e.target.value)}
                className="h-9 text-sm flex-1 min-w-0"
              />
              <button
                type="button"
                onClick={() => removeRow(item.id)}
                aria-label="Remove item"
                className="shrink-0 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Row 2: qty | price | line total */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground px-0.5">Qty</p>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="1"
                  value={rawQty[item.id] ?? item.quantity}
                  onChange={(e) => updateQty(item.id, e.target.value)}
                  onBlur={() => setRawQty(r => { const n = { ...r }; delete n[item.id]; return n })}
                  className="h-8 text-center text-sm px-1"
                />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground px-0.5">Price</p>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={rawPrice[item.id] ?? item.price}
                  onChange={(e) => updatePrice(item.id, e.target.value)}
                  onBlur={() => setRawPrice(r => { const n = { ...r }; delete n[item.id]; return n })}
                  className="h-8 text-right text-sm px-2"
                />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground px-0.5">Total</p>
                <div className="flex h-8 items-center justify-end text-sm font-semibold text-foreground tabular-nums">
                  {(item.quantity * item.price).toFixed(2)}
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Add / catalog buttons */}
      <div className="relative flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1.5 h-8 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Add item
        </Button>
        {products.length > 0 && (
          <Button type="button" variant="outline" size="sm" onClick={() => setShowCatalog(v => !v)} className="gap-1.5 h-8 text-xs">
            <BookOpen className="h-3.5 w-3.5" />
            From catalog
          </Button>
        )}

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
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-muted/60 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    {p.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-[160px]">{p.description}</p>
                    )}
                  </div>
                  <span className="ml-3 shrink-0 text-sm font-semibold text-foreground">${Number(p.price).toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Subtotal */}
      <div className="flex justify-end border-t border-border pt-2 text-sm font-semibold tabular-nums">
        Subtotal: {subtotal.toFixed(2)}
      </div>
    </div>
  )
}
