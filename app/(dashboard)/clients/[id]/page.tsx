import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUiLang } from '@/lib/get-lang'
import { getUiT } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail, MapPin, Pencil, Plus } from 'lucide-react'

type Params = Promise<{ id: string }>

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
}

export default async function ClientDetailPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [lang, clientRes, invoicesRes] = await Promise.all([
    getUiLang(),
    supabase.from('clients').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase
      .from('invoices')
      .select('id, invoice_number, total, currency, status, created_at, document_type')
      .eq('client_id', id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  if (!clientRes.data) notFound()
  const client = clientRes.data
  const invoices = invoicesRes.data ?? []
  const t = getUiT(lang)

  const totalRevenue = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0)
  const pending = invoices.filter((i) => i.status === 'sent').reduce((s, i) => s + Number(i.total), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" render={<Link href="/clients" />} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
        <Button variant="outline" size="sm" render={<Link href={`/clients/${id}/edit`} />} className="gap-1.5 ml-auto">
          <Pencil className="h-3.5 w-3.5" />
          {t.clients.edit}
        </Button>
        <Button size="sm" render={<Link href={`/invoices/new?clientId=${id}`} />} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          {t.invoices.newInvoice}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Client info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t.clients.colName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-semibold text-foreground text-base">{client.name}</p>
            {client.email && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <a href={`mailto:${client.email}`} className="hover:text-foreground transition-colors">{client.email}</a>
              </p>
            )}
            {client.address && (
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span className="whitespace-pre-line">{client.address}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground">{t.dashboard.totalRevenue}</p>
              <p className="mt-1 text-xl font-bold text-foreground">${totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{t.dashboard.fromPaid}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground">{t.dashboard.pending}</p>
              <p className="mt-1 text-xl font-bold text-foreground">${pending.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{t.dashboard.awaitingPayment}</p>
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground">{t.dashboard.invoices}</p>
              <p className="mt-1 text-xl font-bold text-foreground">{invoices.length}</p>
              <p className="text-xs text-muted-foreground">{t.dashboard.allTime}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invoice history */}
      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.recentInvoices}</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t.dashboard.noInvoices}{' '}
              <Link href={`/invoices/new?clientId=${id}`} className="text-foreground underline underline-offset-2">
                {t.dashboard.createFirst}
              </Link>.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <th className="pb-2 pr-4">{t.invoices.cols.number}</th>
                    <th className="pb-2 pr-4">{t.invoices.cols.date}</th>
                    <th className="pb-2 pr-4">{t.invoices.cols.amount}</th>
                    <th className="pb-2 pr-4">{t.invoices.cols.status}</th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((inv) => {
                    const statusLabel = t.invoices.status[inv.status as keyof typeof t.invoices.status] ?? inv.status
                    return (
                      <tr key={inv.id} className="hover:bg-muted/40">
                        <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                          {inv.invoice_number ?? '#' + inv.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {new Date(inv.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4 font-medium">
                          {inv.currency} {Number(inv.total).toFixed(2)}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[inv.status] ?? ''}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Button variant="ghost" size="sm" render={<Link href={`/invoices/${inv.id}`} />}>
                            {t.common.view}
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
