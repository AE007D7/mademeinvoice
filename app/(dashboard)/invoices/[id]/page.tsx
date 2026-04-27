import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InvoicePreview from '@/components/invoices/invoice-preview'
import { PrintButton } from '@/components/invoices/print-button'
import { DownloadButtons } from '@/components/invoices/download-buttons'
import { StatusActions } from './status-actions'
import { SendEmailButton } from './send-email-button'
import { CopyLinkButton } from './copy-link-button'
import { ConvertToInvoiceButton } from './convert-to-invoice-button'
import { DuplicateButton } from './duplicate-button'
import { DeleteButton } from './delete-button'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'

type Params = Promise<{ id: string }>

export default async function InvoicePage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [invoiceRes, itemsRes, brandingRes] = await Promise.all([
    supabase
      .from('invoices')
      .select('*, clients(name, email, address)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    supabase.from('invoice_items').select('*').eq('invoice_id', id).order('id'),
    supabase.from('branding').select('company_name, logo_url, watermark_url, phone, email, website, address, iban, rib, paypal, invoice_language').eq('user_id', user.id).single(),
  ])

  if (!invoiceRes.data) notFound()

  const invoice = invoiceRes.data
  const rawClient = invoice.clients as { name: string; email?: string | null; address?: string | null } | null

  const items = (itemsRes.data ?? []).map((item) => ({
    id: item.id,
    description: item.description,
    quantity: Number(item.quantity),
    price: Number(item.price),
  }))

  const branding = brandingRes.data ?? null

  let watermarkSignedUrl: string | null = null
  if (branding?.watermark_url) {
    const { data } = await supabase.storage.from('watermarks').createSignedUrl(branding.watermark_url, 3600)
    watermarkSignedUrl = data?.signedUrl ?? null
  }

  let logoSignedUrl: string | null = null
  if (branding?.logo_url) {
    const { data } = await supabase.storage.from('logos').createSignedUrl(branding.logo_url, 3600)
    logoSignedUrl = data?.signedUrl ?? null
  }

  const invoiceLabel = invoice.invoice_number ?? `#${invoice.id.slice(0, 8).toUpperCase()}`

  return (
    <div className="space-y-4 pb-6">
      {/* Toolbar */}
      <div className="print:hidden space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold text-foreground">{invoiceLabel}</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
            invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
            invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
            invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
            'bg-muted text-muted-foreground'
          }`}>{invoice.status}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" render={<Link href={`/invoices/${id}/edit`} />} className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <DuplicateButton invoiceId={id} />
          <PrintButton />
          <DownloadButtons invoiceLabel={invoiceLabel} invoiceId={id} />
          <CopyLinkButton shareToken={invoice.share_token} />
          <DeleteButton invoiceId={id} />
          <SendEmailButton
            shareToken={invoice.share_token}
            clientEmail={rawClient?.email}
            clientName={rawClient?.name}
            invoiceNumber={invoiceLabel}
            invoiceTotal={Number(invoice.total)}
            invoiceCurrency={invoice.currency}
            companyName={branding?.company_name ?? 'Made Me Invoice'}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusActions invoiceId={invoice.id} currentStatus={invoice.status} />
          {invoice.document_type === 'estimation' && (
            <ConvertToInvoiceButton invoiceId={invoice.id} />
          )}
        </div>
      </div>

      {/* Preview */}
      <div id="invoice-preview" className="overflow-x-auto min-w-0">
        <InvoicePreview
          invoice={{
            id: invoice.id,
            invoice_number: invoice.invoice_number ?? null,
            amount: Number(invoice.amount),
            tax: Number(invoice.tax),
            total: Number(invoice.total),
            currency: invoice.currency,
            status: invoice.status,
            created_at: invoice.created_at,
            due_date: invoice.due_date ?? null,
            notes: invoice.notes ?? null,
            template: invoice.template ?? 'modern',
            accent_color: invoice.accent_color ?? '#6366f1',
            document_type: invoice.document_type ?? 'invoice',
          }}
          items={items}
          client={rawClient}
          branding={branding}
          logoSignedUrl={logoSignedUrl}
          watermarkSignedUrl={watermarkSignedUrl}
        />
      </div>
    </div>
  )
}
