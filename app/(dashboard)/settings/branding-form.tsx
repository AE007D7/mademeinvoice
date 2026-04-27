'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LANGUAGES, type LangCode, type UiT } from '@/lib/i18n'
import { setUiLanguage } from '@/app/actions/language'

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
  ui_language?: string | null
} | null

type Props = {
  branding: Branding
  userId: string
  t: UiT['settings']
}

export default function BrandingForm({ branding, userId, t }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [companyName, setCompanyName] = useState(branding?.company_name ?? '')
  const [phone, setPhone] = useState(branding?.phone ?? '')
  const [email, setEmail] = useState(branding?.email ?? '')
  const [website, setWebsite] = useState(branding?.website ?? '')
  const [address, setAddress] = useState(branding?.address ?? '')
  const [iban, setIban] = useState(branding?.iban ?? '')
  const [rib, setRib] = useState(branding?.rib ?? '')
  const [paypal, setPaypal] = useState(branding?.paypal ?? '')
  const [invoiceLang, setInvoiceLang] = useState<LangCode>((branding?.invoice_language as LangCode) ?? 'en')
  const [uiLang, setUiLang] = useState<LangCode>((branding?.ui_language as LangCode) ?? 'en')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function uploadFile(bucket: string, file: File): Promise<string | null> {
    const supabase = createClient()
    const path = `${userId}/${file.name}`
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true })
    if (error) return null
    return path
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setIsPending(true)

    const supabase = createClient()
    let logoUrl = branding?.logo_url ?? null
    let watermarkUrl = branding?.watermark_url ?? null
    if (logoFile) {
      const path = await uploadFile('logos', logoFile)
      if (!path) {
        setError('Failed to upload logo.')
        setIsPending(false)
        return
      }
      logoUrl = path
    }

    if (watermarkFile) {
      const path = await uploadFile('watermarks', watermarkFile)
      if (!path) {
        setError('Failed to upload watermark.')
        setIsPending(false)
        return
      }
      watermarkUrl = path
    }

    const { error } = await supabase.from('branding').upsert(
      {
        user_id: userId,
        company_name: companyName.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        website: website.trim() || null,
        address: address.trim() || null,
        iban: iban.trim() || null,
        rib: rib.trim() || null,
        paypal: paypal.trim() || null,
        invoice_language: invoiceLang,
        ui_language: uiLang,
        logo_url: logoUrl,
        watermark_url: watermarkUrl,
      },
      { onConflict: 'user_id' }
    )

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      startTransition(async () => {
        await setUiLanguage(uiLang)
        router.refresh()
      })
    }
    setIsPending(false)
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-base">{t.branding}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="companyName">{t.companyName}</Label>
            <Input
              id="companyName"
              placeholder="Acme Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="invoiceLang">{t.invoiceLang}</Label>
              <select
                id="invoiceLang"
                value={invoiceLang}
                onChange={(e) => setInvoiceLang(e.target.value as LangCode)}
                disabled={isPending}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="uiLang">{t.uiLang}</Label>
              <select
                id="uiLang"
                value={uiLang}
                onChange={(e) => setUiLang(e.target.value as LangCode)}
                disabled={isPending}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs font-medium text-muted-foreground pt-1">{t.paymentHint}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t.phone}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 555 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactEmail">{t.email}</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="hello@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="website">{t.website}</Label>
            <Input
              id="website"
              type="text"
              placeholder="acme.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">{t.address}</Label>
            <Input
              id="address"
              placeholder="123 Main St, City, Country"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isPending}
            />
          </div>

          <p className="text-xs font-medium text-muted-foreground pt-1">{t.payment}</p>

          <div className="space-y-1.5">
            <Label htmlFor="iban">IBAN</Label>
            <Input
              id="iban"
              placeholder="FR76 3000 6000 0112 3456 7890 189"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              disabled={isPending}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rib">RIB</Label>
            <Input
              id="rib"
              placeholder="30006 00001 12345678901 89"
              value={rib}
              onChange={(e) => setRib(e.target.value)}
              disabled={isPending}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="paypal">PayPal</Label>
            <Input
              id="paypal"
              placeholder="payments@yourcompany.com"
              value={paypal}
              onChange={(e) => setPaypal(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="logo">{t.logo}</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              disabled={isPending}
            />
            {branding?.logo_url && (
              <p className="text-xs text-muted-foreground">{t.logoHint}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="watermark">{t.watermark}</Label>
            <Input
              id="watermark"
              type="file"
              accept="image/*"
              onChange={(e) => setWatermarkFile(e.target.files?.[0] ?? null)}
              disabled={isPending}
            />
            {branding?.watermark_url && (
              <p className="text-xs text-muted-foreground">{t.logoHint}</p>
            )}
            <p className="text-xs text-muted-foreground">{t.watermarkHint}</p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && (
            <p className="text-sm text-green-600">{t.saved}</p>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? t.saving : t.save}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
