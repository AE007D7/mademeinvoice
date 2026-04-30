import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InvoicePreview from '@/components/invoices/invoice-preview'
import { PrintButton } from '@/components/invoices/print-button'
import { DownloadButtons } from '@/components/invoices/download-buttons'
import { FileText } from 'lucide-react'

type Params = Promise<{ token: string }>

export default async function PublicInvoicePage({ params }: { params: Params }) {
  const { token } = await params
  const supabase = await createClient()

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, clients(name, email, phone, address)')
    .eq('share_token', token)
    .single()

  if (!invoice) notFound()

  const [itemsRes, brandingRes] = await Promise.all([
    supabase.from('invoice_items').select('*').eq('invoice_id', invoice.id).order('id'),
    supabase
      .from('branding')
      .select('company_name, logo_url, logo_size, watermark_url, stamp_url, phone, email, website, address, iban, rib, paypal, invoice_language')
      .eq('user_id', invoice.user_id)
      .single(),
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
  let stampSignedUrl: string | null = null

  await Promise.all([
    branding?.logo_url
      ? supabase.storage.from('logos').createSignedUrl(branding.logo_url, 3600).then(({ data }) => { logoSignedUrl = data?.signedUrl ?? null })
      : null,
    branding?.watermark_url
      ? supabase.storage.from('watermarks').createSignedUrl(branding.watermark_url, 3600).then(({ data }) => { watermarkSignedUrl = data?.signedUrl ?? null })
      : null,
    branding?.stamp_url
      ? supabase.storage.from('stamps').createSignedUrl(branding.stamp_url, 3600).then(({ data }) => { stampSignedUrl = data?.signedUrl ?? null })
      : null,
  ])

  const client = invoice.clients as { name: string; email?: string | null; phone?: string | null; address?: string | null } | null
  const showWatermark = invoice.show_watermark ?? true

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
          <div className="flex items-center gap-2">
            <PrintButton />
            <DownloadButtons invoiceLabel={invoice.invoice_number ?? invoice.id.slice(0, 8).toUpperCase()} invoiceId={invoice.id} />
          </div>
        </div>
      </div>

      {/* Invoice */}
      <div className="overflow-x-auto p-4 sm:p-8">
        <div id="invoice-preview">
          <InvoicePreview
            invoice={{
              id: invoice.id,
              invoice_number: invoice.invoice_number ?? null,
              amount: Number(invoice.amount),
              tax: Number(invoice.tax),
              total: Number(invoice.total),
              currency: invoice.currency,
              status: invoice.status,
              created_at: invoice.invoice_date ? invoice.invoice_date + 'T00:00:00' : invoice.created_at,
              due_date: invoice.due_date ?? null,
              notes: invoice.notes ?? null,
              template: invoice.template ?? 'modern',
              accent_color: invoice.accent_color ?? '#6366f1',
              document_type: invoice.document_type ?? 'invoice',
            }}
            items={items}
            client={client}
            branding={branding}
            logoSignedUrl={logoSignedUrl}
            watermarkSignedUrl={showWatermark ? watermarkSignedUrl : null}
            stampSignedUrl={stampSignedUrl}
            stampX={invoice.stamp_x ?? 75}
            stampY={invoice.stamp_y ?? 82}
          />
        </div>
      </div>
    </div>
  )
}
