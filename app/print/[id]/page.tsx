import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InvoicePreview from '@/components/invoices/invoice-preview'
import CaptureClient from './capture-client'

type Params = Promise<{ id: string }>

export default async function PrintPage({ params }: { params: Params }) {
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
    supabase
      .from('branding')
      .select('company_name, logo_url, watermark_url, phone, email, website, address, iban, rib, paypal, invoice_language')
      .eq('user_id', user.id)
      .single(),
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

  return (
    // Exact 794 px container — mx-auto on .invoice-print-area resolves to 0
    // because container width == element width, eliminating the right-shift bug.
    <div style={{ width: 794, background: '#fff', margin: 0, padding: 0, overflow: 'hidden' }}>
      {/* CaptureClient auto-runs html-to-image inside this iframe context
          (full CSS + fonts loaded) then posts the dataUrl to the parent frame. */}
      <CaptureClient />
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
  )
}
