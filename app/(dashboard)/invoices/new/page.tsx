import { createClient } from '@/lib/supabase/server'
import InvoiceBuilder from '@/components/invoices/invoice-builder'

export default async function NewInvoicePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [clientsRes, brandingRes] = await Promise.all([
    supabase.from('clients').select('id, name, email, address').eq('user_id', user.id).order('name'),
    supabase.from('branding').select('company_name, logo_url, letterhead_url, phone, email, website, address, iban, rib, paypal, invoice_language').eq('user_id', user.id).single(),
  ])

  const branding = brandingRes.data ?? null

  let logoSignedUrl: string | null = null
  if (branding?.logo_url) {
    const { data } = await supabase.storage.from('logos').createSignedUrl(branding.logo_url, 3600)
    logoSignedUrl = data?.signedUrl ?? null
  }

  let letterheadSignedUrl: string | null = null
  if (branding?.letterhead_url) {
    const { data } = await supabase.storage.from('letterheads').createSignedUrl(branding.letterhead_url, 3600)
    letterheadSignedUrl = data?.signedUrl ?? null
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
          companyName={branding?.company_name}
          logoUrl={logoSignedUrl}
          letterheadUrl={letterheadSignedUrl}
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
