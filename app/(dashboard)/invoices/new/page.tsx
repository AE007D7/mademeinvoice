import { createClient } from '@/lib/supabase/server'
import InvoiceBuilder from '@/components/invoices/invoice-builder'

export default async function NewInvoicePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [clientsRes, brandingRes, productsRes] = await Promise.all([
    supabase.from('clients').select('id, name, email, address').eq('user_id', user.id).order('name'),
    supabase.from('branding').select('company_name, logo_url, phone, email, website, address, iban, rib, paypal, invoice_language').eq('user_id', user.id).single(),
    supabase.from('products').select('id, name, description, price, unit').eq('user_id', user.id).order('name'),
  ])

  const branding = brandingRes.data ?? null

  let logoSignedUrl: string | null = null
  if (branding?.logo_url) {
    const { data } = await supabase.storage.from('logos').createSignedUrl(branding.logo_url, 3600)
    logoSignedUrl = data?.signedUrl ?? null
  }

  return (
    <div className="flex flex-col gap-4 lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-foreground">New Invoice</h1>
        <p className="text-sm text-muted-foreground">Choose a template, pick colors, and build your invoice.</p>
      </div>
      <div className="lg:min-h-0 lg:flex-1">
        <InvoiceBuilder
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
        />
      </div>
    </div>
  )
}
