import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TemplateRenderer, type TemplateId, type TemplateData } from '@/components/invoices/invoice-templates'
import { PrintButton } from '@/components/invoices/print-button'
import { FileText } from 'lucide-react'

type Params = Promise<{ token: string }>

export default async function PublicInvoicePage({ params }: { params: Params }) {
  const { token } = await params
  const supabase = await createClient()

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, clients(name, email, address)')
    .eq('share_token', token)
    .single()

  if (!invoice) notFound()

  const [itemsRes, brandingRes] = await Promise.all([
    supabase.from('invoice_items').select('*').eq('invoice_id', invoice.id).order('id'),
    supabase.from('branding').select('company_name, logo_url, watermark_url, letterhead_url, phone, email, website, address, iban, rib, paypal, invoice_language').eq('user_id', invoice.user_id).single(),
  ])

  const branding = brandingRes.data ?? null
  const items = (itemsRes.data ?? []).map((i) => ({
    id: i.id,
    description: i.description,
    quantity: Number(i.quantity),
    price: Number(i.price),
  }))

  let logoSignedUrl: string | null = null
  let watermarkSignedUrl: string | null = null

  if (branding?.logo_url) {
    const { data } = await supabase.storage.from('logos').createSignedUrl(branding.logo_url, 3600)
    logoSignedUrl = data?.signedUrl ?? null
  }
  if (branding?.watermark_url) {
    const { data } = await supabase.storage.from('watermarks').createSignedUrl(branding.watermark_url, 3600)
    watermarkSignedUrl = data?.signedUrl ?? null
  }

  let letterheadSignedUrl: string | null = null
  if (branding?.letterhead_url) {
    const { data } = await supabase.storage.from('letterheads').createSignedUrl(branding.letterhead_url, 3600)
    letterheadSignedUrl = data?.signedUrl ?? null
  }

  const client = invoice.clients as { name: string; email?: string | null; address?: string | null } | null
  const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0)
  const taxAmount = subtotal * (Number(invoice.tax) / 100)

  const issueDate = new Date(invoice.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const dueDate = invoice.due_date
    ? new Date(invoice.due_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
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
    invoiceNumber: invoice.invoice_number ?? invoice.id.slice(0, 8).toUpperCase(),
    issueDate,
    dueDate,
    notes: invoice.notes,
    clientName: client?.name ?? '',
    clientEmail: client?.email,
    clientAddress: client?.address,
    items,
    currency: invoice.currency,
    taxRate: Number(invoice.tax),
    subtotal,
    taxAmount,
    total: Number(invoice.total),
    accentColor: invoice.accent_color ?? '#6366f1',
    status: invoice.status,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="border-b border-border bg-white px-4 py-3 print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600">
              <FileText className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">Made Me Invoice</span>
          </div>
          <PrintButton />
        </div>
      </div>

      {/* Invoice */}
      <div className="mx-auto max-w-3xl overflow-x-auto p-4 sm:p-8">
        <div className="invoice-print-area relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-border print:max-w-none print:rounded-none print:shadow-none print:ring-0">
          {watermarkSignedUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={watermarkSignedUrl} alt="" className="invoice-watermark pointer-events-none select-none" />
          )}
          <div className="relative z-10">
            <TemplateRenderer templateId={(invoice.template ?? 'modern') as TemplateId} data={data} />
          </div>
        </div>
      </div>
    </div>
  )
}
