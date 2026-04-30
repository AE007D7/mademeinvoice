import { TemplateRenderer, type TemplateId, type TemplateData } from './invoice-templates'
import { formatDateLong } from '@/lib/format-date'
import type { LangCode } from '@/lib/i18n'

type LineItem = {
  id: string
  description: string
  quantity: number
  price: number
}

type Client = {
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
} | null

type Invoice = {
  id: string
  invoice_number?: string | null
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
  document_type?: string | null
}

type Branding = {
  company_name?: string | null
  logo_url?: string | null
  logo_size?: string | null
  watermark_url?: string | null
  stamp_url?: string | null
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
  stampSignedUrl?: string | null
}

export default function InvoicePreview({ invoice, items, client, branding, logoSignedUrl, watermarkSignedUrl, stampSignedUrl }: Props) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0)
  const taxAmount = subtotal * (Number(invoice.tax) / 100)

  const invoiceLang = (branding?.invoice_language ?? 'en') as LangCode
  const issueDate = formatDateLong(invoice.created_at, invoiceLang)
  const dueDate = invoice.due_date ? formatDateLong(invoice.due_date + 'T00:00:00', invoiceLang) : null

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
    invoiceNumber: invoice.invoice_number ?? invoice.id.slice(0, 8).toUpperCase(),
    issueDate,
    dueDate,
    notes: invoice.notes,
    clientName: client?.name ?? '',
    clientEmail: client?.email,
    clientPhone: client?.phone ?? undefined,
    clientAddress: client?.address,
    logoSize: branding?.logo_size ?? 'medium',
    items: items.map((i) => ({ ...i, price: Number(i.price) })),
    currency: invoice.currency,
    taxRate: Number(invoice.tax),
    subtotal,
    taxAmount,
    total: Number(invoice.total),
    accentColor: invoice.accent_color ?? '#6366f1',
    docType: (invoice.document_type === 'estimation' ? 'estimation' : 'invoice') as 'invoice' | 'estimation',
    status: invoice.status,
  }

  const templateId = (invoice.template ?? 'modern') as TemplateId

  return (
    <div className="invoice-print-area relative mx-auto w-[794px] max-w-full overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-border print:w-full print:max-w-none print:rounded-none print:shadow-none print:ring-0">
      {/* Watermark */}
      {watermarkSignedUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={watermarkSignedUrl}
          alt=""
          className="invoice-watermark pointer-events-none select-none"
        />
      )}
      {/* Stamp */}
      {stampSignedUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={stampSignedUrl}
          alt=""
          className="pointer-events-none select-none"
          style={{ position: 'absolute', bottom: 72, right: 52, width: 130, height: 130, objectFit: 'contain', opacity: 0.85, transform: 'rotate(-10deg)', zIndex: 20 }}
        />
      )}
      <div className="relative z-10">
        <TemplateRenderer templateId={templateId} data={data} />
      </div>
    </div>
  )
}
