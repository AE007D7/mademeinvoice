import { TemplateRenderer, type TemplateId, type TemplateData } from './invoice-templates'

type LineItem = {
  id: string
  description: string
  quantity: number
  price: number
}

type Client = {
  name: string
  email?: string | null
  address?: string | null
} | null

type Invoice = {
  id: string
  amount: number
  tax: number
  total: number
  currency: string
  status: string
  created_at: string
  due_date?: string | null
  notes?: string | null
  template?: string | null
  accent_color?: string | null
}

type Branding = {
  company_name?: string | null
  logo_url?: string | null
  watermark_url?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  address?: string | null
  iban?: string | null
  rib?: string | null
  paypal?: string | null
  invoice_language?: string | null
} | null

type Props = {
  invoice: Invoice
  items: LineItem[]
  client: Client
  branding: Branding
  logoSignedUrl?: string | null
  watermarkSignedUrl?: string | null
  letterheadSignedUrl?: string | null
}

export default function InvoicePreview({ invoice, items, client, branding, logoSignedUrl, watermarkSignedUrl, letterheadSignedUrl }: Props) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0)
  const taxAmount = subtotal * (Number(invoice.tax) / 100)

  const issueDate = new Date(invoice.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const dueDate = invoice.due_date
    ? new Date(invoice.due_date + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  const data: TemplateData = {
    companyName: branding?.company_name ?? 'Made Me Invoice',
    logoUrl: logoSignedUrl ?? undefined,
    companyPhone: branding?.phone ?? undefined,
    companyEmail: branding?.email ?? undefined,
    companyWebsite: branding?.website ?? undefined,
    companyAddress: branding?.address ?? undefined,
    paymentIban: branding?.iban ?? undefined,
    paymentRib: branding?.rib ?? undefined,
    paymentPaypal: branding?.paypal ?? undefined,
    lang: branding?.invoice_language ?? 'en',
    letterheadUrl: letterheadSignedUrl ?? undefined,
    invoiceNumber: invoice.id.slice(0, 8).toUpperCase(),
    issueDate,
    dueDate,
    notes: invoice.notes,
    clientName: client?.name ?? '',
    clientEmail: client?.email,
    clientAddress: client?.address,
    items: items.map((i) => ({ ...i, price: Number(i.price) })),
    currency: invoice.currency,
    taxRate: Number(invoice.tax),
    subtotal,
    taxAmount,
    total: Number(invoice.total),
    accentColor: invoice.accent_color ?? '#6366f1',
    status: invoice.status,
  }

  const templateId = (invoice.template ?? 'modern') as TemplateId

  return (
    <div className="invoice-print-area relative mx-auto max-w-3xl overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-border print:max-w-none print:rounded-none print:shadow-none print:ring-0">
      {/* Watermark */}
      {watermarkSignedUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={watermarkSignedUrl}
          alt=""
          className="invoice-watermark pointer-events-none select-none"
        />
      )}
      <div className="relative z-10">
        <TemplateRenderer templateId={templateId} data={data} />
      </div>
    </div>
  )
}
