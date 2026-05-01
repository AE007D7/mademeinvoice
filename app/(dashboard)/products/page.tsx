'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, Check, X, Package } from 'lucide-react'

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  unit: string
}

const EMPTY_FORM = { name: '', description: '', price: '', unit: 'unit' }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  async function load() {
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('name')
    setProducts(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    void (async () => {
      const supabase = createClient()
      const { data } = await supabase.from('products').select('*').order('name')
      setProducts(data ?? [])
      setLoading(false)
    })()
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.price) { setError('Name and price are required.'); return }
    setError('')
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated.'); setSaving(false); return }
    const { data, error: dbErr } = await supabase
      .from('products')
      .insert({ user_id: user.id, name: form.name.trim(), description: form.description.trim() || null, price: parseFloat(form.price), unit: form.unit.trim() || 'unit' })
      .select()
      .single()
    if (dbErr) { setError(dbErr.message); setSaving(false); return }
    setProducts(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    setForm(EMPTY_FORM)
    setShowForm(false)
    setSaving(false)
  }

  async function handleSaveEdit(id: string) {
    if (!editForm.name.trim() || !editForm.price) return
    setSaving(true)
    const supabase = createClient()
    const { data, error: dbErr } = await supabase
      .from('products')
      .update({ name: editForm.name.trim(), description: editForm.description.trim() || null, price: parseFloat(editForm.price), unit: editForm.unit.trim() || 'unit' })
      .eq('id', id)
      .select()
      .single()
    if (!dbErr && data) {
      setProducts(prev => prev.map(p => p.id === id ? data : p).sort((a, b) => a.name.localeCompare(b.name)))
    }
    setEditId(null)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  function startEdit(p: Product) {
    setEditId(p.id)
    setEditForm({ name: p.name, description: p.description ?? '', price: String(p.price), unit: p.unit })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">Your reusable catalog — add them to invoices in one click.</p>
        </div>
        {!showForm && (
          <Button onClick={() => { setShowForm(true); setError('') }} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        )}
      </div>

      {/* Inline add form */}
      {showForm && (
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5 space-y-4">
          <p className="text-sm font-semibold text-foreground">New Product</p>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" placeholder="Web Design" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus disabled={saving} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="e.g. per page" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} disabled={saving} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="price">Price *</Label>
                <Input id="price" type="number" min="0" step="0.01" placeholder="99.00" value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))} disabled={saving} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" placeholder="hour / page / unit" value={form.unit}
                  onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} disabled={saving} />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={saving} className="gap-1.5">
                <Check className="h-3.5 w-3.5" />
                {saving ? 'Saving…' : 'Save Product'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setError('') }}>
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Products list */}
      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
      ) : products.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16 text-center">
          <Package className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No products yet</p>
          <p className="text-xs text-muted-foreground mt-1">Add your first product to use it in invoices</p>
          <Button className="mt-4 gap-1.5" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
          {products.map(p => (
            <div key={p.id} className="px-4 py-3">
              {editId === p.id ? (
                /* Inline edit row */
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Name" autoFocus disabled={saving} />
                    <Input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Description" disabled={saving} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" min="0" step="0.01" value={editForm.price}
                      onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} placeholder="Price" disabled={saving} />
                    <Input value={editForm.unit} onChange={e => setEditForm(f => ({ ...f, unit: e.target.value }))}
                      placeholder="Unit" disabled={saving} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSaveEdit(p.id)} disabled={saving} className="gap-1">
                      <Check className="h-3.5 w-3.5" />{saving ? 'Saving…' : 'Save'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditId(null)} className="gap-1">
                      <X className="h-3.5 w-3.5" />Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                /* Display row */
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.description ? `${p.description} · ` : ''}{p.unit}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-foreground shrink-0">${Number(p.price).toFixed(2)}</span>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon-sm" onClick={() => startEdit(p)} className="text-muted-foreground hover:text-foreground">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
