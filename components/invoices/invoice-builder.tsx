'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SlidersHorizontal, Eye } from 'lucide-react'
import { createInvoiceAction, updateInvoiceAction } from '@/app/actions/invoices'
import LineItemsTable, { type LineItem } from './line-items-table'
import TaxSelector from './tax-selector'
import TemplateSelector from './template-selector'
import ColorSelector from './color-selector'
import { TemplateRenderer, type TemplateId } from './invoice-templates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'INR']

type Client = { id: string; name: string; email?: string | null; address?: string | null }
type Product = { id: string; name: string; description?: string | null; price: number; unit: string }
type InitialValues = {
  clientId?: string
  currency?: string
  taxRate?: number
  dueDate?: string
  notes?: string
  template?: string
  accentColor?: string
  docType?: 'invoice' | 'estimation'
  items?: { id: string; description: string; quantity: number; price: number }[]
}

type Props = {
  invoiceId?: string
  initialValues?: InitialValues
  clients: Client[]
  products?: Product[]
  companyName?: string | null
  logoUrl?: string | null
  companyPhone?: string | null
  companyEmail?: string | null
  companyWebsite?: string | null
  companyAddress?: string | null
  paymentIban?: string | null
  paymentRib?: string | null
  paymentPaypal?: string | null
  invoiceLang?: string | null
}

export default function InvoiceBuilder({ invoiceId, initialValues, clients, products = [], companyName, logoUrl, companyPhone, companyEmail, companyWebsite, companyAddress, paymentIban, paymentRib, paymentPaypal, invoiceLang }: Props) {
  const router = useRouter()
  const isEditing = !!invoiceId

  const [clientId, setClientId] = useState(initialValues?.clientId ?? '')
  const [currency, setCurrency] = useState(initialValues?.currency ?? 'USD')
  const [taxRate, setTaxRate] = useState(initialValues?.taxRate ?? 0)
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? '')
  const [notes, setNotes] = useState(initialValues?.notes ?? '')
  const [items, setItems] = useState<LineItem[]>(
    initialValues?.items?.length
      ? initialValues.items
      : [{ id: crypto.randomUUID(), description: '', quantity: 1, price: 0 }]
  )
  const [template, setTemplate] = useState<TemplateId>((initialValues?.template ?? 'modern') as TemplateId)
  const [accentColor, setAccentColor] = useState(initialValues?.accentColor ?? '#6366f1')
  const [docType, setDocType] = useState<'invoice' | 'estimation'>(initialValues?.docType ?? 'invoice')
  const [mobileTab, setMobileTab] = useState<'details' | 'preview'>('details')
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)
  // eslint-disable-next-line react-hooks/purity
  const [invoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`)
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])

  const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount
  const selectedClient = clients.find((c) => c.id === clientId) ?? null
  const issueDateFormatted = new Date(invoiceDate + 'T00:00:00').toLocaleDateString(
    invoiceLang === 'fr' ? 'fr-FR' : invoiceLang === 'es' ? 'es-ES' : invoiceLang === 'de' ? 'de-DE' : invoiceLang === 'ar' ? 'ar-SA' : invoiceLang === 'pt' ? 'pt-PT' : invoiceLang === 'it' ? 'it-IT' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )
  const dueDateFormatted = dueDate
    ? new Date(dueDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : undefined

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsPending(true)
    const payload = {
      clientId: clientId || null,
      currency,
      taxRate,
      invoiceDate: invoiceDate || null,
      dueDate: dueDate || null,
      notes: notes || null,
      template,
      accentColor,
      docType,
      items: items.map(({ description, quantity, price }) => ({ description, quantity, price })),
    }
    const result = isEditing
      ? await updateInvoiceAction({ ...payload, invoiceId: invoiceId! })
      : await createInvoiceAction(payload)
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
  }

  const templateData = {
    companyName: companyName ?? 'Made Me Invoice',
    logoUrl,
    companyPhone: companyPhone ?? undefined,
    companyEmail: companyEmail ?? undefined,
    companyWebsite: companyWebsite ?? undefined,
    companyAddress: companyAddress ?? undefined,
    paymentIban: paymentIban ?? undefined,
    paymentRib: paymentRib ?? undefined,
    paymentPaypal: paymentPaypal ?? undefined,
    lang: invoiceLang ?? 'en',
    invoiceNumber,
    issueDate: issueDateFormatted,
    dueDate: dueDateFormatted,
    notes: notes || null,
    clientName: selectedClient?.name ?? '',
    clientEmail: selectedClient?.email,
    clientAddress: selectedClient?.address,
    items: items.map((i) => ({ ...i, price: Number(i.price) })),
    currency,
    taxRate,
    subtotal,
    taxAmount,
    total,
    accentColor,
    docType,
  }

  const detailsPanel = (
    <div className="space-y-6 px-4 pt-5 pb-8 sm:px-5">

      {/* Document type toggle */}
      <div className="space-y-1.5">
        <Label>Document Type</Label>
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-input bg-muted/40 p-1">
          {(['invoice', 'estimation'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setDocType(type)}
              className={`rounded-md py-1.5 text-sm font-medium capitalize transition-colors ${
                docType === type
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {type === 'invoice' ? 'Invoice' : 'Estimation'}
            </button>
          ))}
        </div>
      </div>

      <TemplateSelector value={template} onChange={setTemplate} accentColor={accentColor} />
      <ColorSelector value={accentColor} onChange={setAccentColor} />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="client">Client</Label>
          <select
            id="client"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">No client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            <Link href="/clients/new" className="underline underline-offset-2">+ Add client</Link>
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currency">Currency</Label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="invoiceDate">Invoice Date</Label>
          <Input id="invoiceDate" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dueDate">Due Date <span className="text-muted-foreground">(optional)</span></Label>
          <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>

      <Card style={{ overflow: 'visible' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <LineItemsTable items={items} onChange={setItems} products={products} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <TaxSelector value={taxRate} onChange={setTaxRate} />
        </CardContent>
      </Card>

      <div className="rounded-xl bg-muted/40 p-4 text-sm space-y-1">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{currency} {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax ({taxRate}%)</span>
          <span>{currency} {taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-1.5 text-base font-bold text-foreground">
          <span>Total</span>
          <span>{currency} {total.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes <span className="text-muted-foreground">(optional)</span></Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Payment terms, bank details, thank-you note…"
          className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isPending}
          className="flex-1 gradient-primary border-0 text-white shadow-md shadow-primary/30 hover:opacity-90 transition-opacity"
        >
          {isPending ? 'Saving…' : isEditing ? 'Update Invoice' : 'Save Invoice'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push(isEditing ? `/invoices/${invoiceId}` : '/invoices')} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </div>
  )

  const previewPanel = (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto w-[794px] max-w-full overflow-hidden rounded-xl shadow-xl shadow-black/10 ring-1 ring-border">
        <TemplateRenderer templateId={template} data={templateData} />
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row lg:h-[calc(100vh-9rem)] gap-0 lg:gap-5">

      {/* ── Mobile tab bar ── */}
      <div className="flex shrink-0 rounded-xl border border-border bg-card overflow-hidden lg:hidden">
        <button
          type="button"
          onClick={() => setMobileTab('details')}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            mobileTab === 'details'
              ? 'gradient-primary text-white'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Details
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            mobileTab === 'preview'
              ? 'gradient-primary text-white'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
      </div>

      {/* ── Mobile: single active panel ── */}
      <div className="lg:hidden">
        {mobileTab === 'details' ? (
          <div className="mt-3 rounded-xl border border-border bg-card">
            {detailsPanel}
          </div>
        ) : (
          <div className="mt-3 min-h-[70vh] rounded-xl border border-border bg-muted/30">
            {previewPanel}
          </div>
        )}
      </div>

      {/* ── Desktop: side by side ── */}
      <div className="hidden lg:flex lg:w-[420px] lg:shrink-0 lg:flex-col lg:overflow-y-auto rounded-xl border border-border bg-card pb-6">
        <div className="sticky top-0 z-10 border-b border-border bg-card px-5 py-3.5">
          <p className="text-sm font-semibold text-foreground">Invoice Details</p>
        </div>
        {detailsPanel}
      </div>

      <div className="hidden lg:flex lg:flex-1 lg:flex-col overflow-hidden rounded-xl border border-border bg-muted/30">
        <div className="flex items-center justify-between border-b border-border bg-card px-5 py-3.5">
          <p className="text-sm font-semibold text-foreground">Live Preview</p>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <span className="text-xs text-muted-foreground">Updates as you type</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto w-[794px] max-w-full overflow-hidden rounded-xl shadow-xl shadow-black/10 ring-1 ring-border">
            <TemplateRenderer templateId={template} data={templateData} />
          </div>
        </div>
      </div>
    </form>
  )
}
