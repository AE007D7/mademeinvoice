'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function OnboardingPage() {
  const router = useRouter()
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!companyName.trim()) return
    setIsPending(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase.from('branding').upsert(
      {
        user_id: user.id,
        company_name: companyName.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        website: website.trim() || null,
      },
      { onConflict: 'user_id' }
    )

    if (error) {
      setError(error.message)
      setIsPending(false)
    } else {
      router.push('/dashboard')
    }
  }

  function handleSkip() {
    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15 blur-[120px]"
          style={{ background: 'oklch(0.511 0.262 277.7)' }}
        />
      </div>

      <div className="relative w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/30">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">Set up your business</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This info will appear on your invoices. You can change it anytime in Settings.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="companyName">
                Business Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="companyName"
                placeholder="Acme Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={isPending}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
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
              <Label htmlFor="address">Business Address</Label>
              <Input
                id="address"
                placeholder="123 Main St, City, Country"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="acme.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                disabled={isPending}
              />
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isPending || !companyName.trim()}
                className="flex-1 gradient-primary border-0 text-white shadow-md shadow-primary/30 hover:opacity-90 transition-opacity"
              >
                {isPending ? 'Saving…' : 'Get started'}
              </Button>
              <Button type="button" variant="outline" onClick={handleSkip} disabled={isPending}>
                Skip
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          You can always update this from your Settings page.
        </p>
      </div>
    </div>
  )
}
