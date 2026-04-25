import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InvoiceBuilder from '@/components/invoices/invoice-builder'

type Params = Promise<{ id: string }>

export default async function EditInvoicePage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [invoiceRes, itemsRes, clientsRes, brandingRes, productsRes] = await Promise.all([
    supabase.from('invoices').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('invoice_items').select('*').eq('invoice_id', id).order('id'),
    supabase.from('clients').select('id, name, email, address').eq('user_id', user.id).order('name'),
    supabase.from('branding').select('company_name, logo_url, phone, email, website, address, iban, rib, paypal, invoice_language').eq('user_id', user.id).single(),
    supabase.from('products').select('id, name, description, price, unit').eq('user_id', user.id).order('name'),
  ])

  if (!invoiceRes.data) notFound()

  const invoice = invoiceRes.data
  const branding = brandingRes.data ?? null

  let logoSignedUrl: string | null = null
  if (branding?.logo_url) {
    const { data } = await supabase.storage.from('logos').createSignedUrl(branding.logo_url, 3600)
    logoSignedUrl = data?.signedUrl ?? null
  }

  const items = (itemsRes.data ?? []).map(i => ({
    id: i.id,
    description: i.description,
    quantity: Number(i.quantity),
    price: Number(i.price),
  }))

  return (
    <div className="flex flex-col gap-4 lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-foreground">Edit Invoice</h1>
        <p className="text-sm text-muted-foreground">Update invoice details and line items.</p>
      </div>
      <div className="lg:min-h-0 lg:flex-1">
        <InvoiceBuilder
          invoiceId={invoice.id}
          clients={clientsRes.data ?? []}
          products={productsRes.data ?? []}
          companyName={branding?.company_name}
          logoUrl={logoSignedUrl}
          companyPhone={branding?.phone}
          companyEmail={branding?.email}
          companyWebsite={branding?.website}
          companyAddress={branding?.address}
          paymentIban={branding?.iban}
          paymentRib={branding?.rib}
          paymentPaypal={branding?.paypal}
          invoiceLang={branding?.invoice_language}
          initialValues={{
            clientId: invoice.client_id ?? '',
            currency: invoice.currency,
            taxRate: Number(invoice.tax),
            dueDate: invoice.due_date ?? '',
            notes: invoice.notes ?? '',
            template: invoice.template ?? 'modern',
            accentColor: invoice.accent_color ?? '#6366f1',
            items,
          }}
        />
      </div>
    </div>
  )
}
