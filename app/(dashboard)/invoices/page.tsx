import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getUiLang } from '@/lib/get-lang'
import { getUiT } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { MarkPaidButton } from './mark-paid-button'
import { StatusFilter } from './status-filter'
import { formatDate } from '@/lib/format-date'

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
}

type SearchParams = Promise<{ status?: string }>

export default async function InvoicesPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { status: filterStatus } = await searchParams

  let query = supabase
    .from('invoices')
    .select('id, invoice_number, total, currency, status, created_at, clients(name)')
    .eq('user_id', user.id)
    .eq('document_type', 'invoice')
    .order('created_at', { ascending: false })

  if (filterStatus && filterStatus !== 'all') {
    query = query.eq('status', filterStatus)
  }

  const [lang, { data: invoices }] = await Promise.all([getUiLang(), query])

  const t = getUiT(lang)
  const empty = !invoices || invoices.length === 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t.invoices.title}</h1>
        <Button render={<Link href="/invoices/new" />} className="gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t.invoices.newInvoice}</span>
          <span className="sm:hidden">+</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>{t.invoices.allInvoices}</CardTitle>
          <Suspense>
            <StatusFilter />
          </Suspense>
        </CardHeader>
        <CardContent>
          {empty ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {filterStatus && filterStatus !== 'all' ? (
                <>No {filterStatus} invoices.</>
              ) : (
                <>{t.invoices.noInvoices}{' '}
                  <Link href="/invoices/new" className="text-foreground underline underline-offset-2">
                    {t.invoices.createFirst}
                  </Link>.</>
              )}
            </div>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="divide-y divide-border sm:hidden">
                {invoices.map((inv) => {
                  const client = (inv.clients as unknown) as { name: string } | null
                  const statusLabel = t.invoices.status[inv.status as keyof typeof t.invoices.status] ?? inv.status
                  return (
                    <div key={inv.id} className="flex items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground text-sm">
                          {client?.name ?? '—'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(inv.created_at, lang)} &middot; {inv.invoice_number ?? '#' + inv.id.slice(0, 6).toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-foreground">
                          {inv.currency} {Number(inv.total).toFixed(2)}
                        </p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[inv.status] ?? ''}`}>
                          {statusLabel}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {inv.status !== 'paid' && <MarkPaidButton invoiceId={inv.id} />}
                        <Button variant="ghost" size="sm" render={<Link href={`/invoices/${inv.id}`} />}>
                          {t.common.view}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <th className="pb-2 pr-4">{t.invoices.cols.number}</th>
                      <th className="pb-2 pr-4">{t.invoices.cols.client}</th>
                      <th className="pb-2 pr-4">{t.invoices.cols.date}</th>
                      <th className="pb-2 pr-4">{t.invoices.cols.amount}</th>
                      <th className="pb-2 pr-4">{t.invoices.cols.status}</th>
                      <th className="pb-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoices.map((inv) => {
                      const client = (inv.clients as unknown) as { name: string } | null
                      const statusLabel = t.invoices.status[inv.status as keyof typeof t.invoices.status] ?? inv.status
                      return (
                        <tr key={inv.id} className="hover:bg-muted/40">
                          <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                            {inv.invoice_number ?? '#' + inv.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="py-3 pr-4 font-medium">{client?.name ?? '—'}</td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            {formatDate(inv.created_at, lang)}
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
                            <div className="flex items-center justify-end gap-1">
                              {inv.status !== 'paid' && <MarkPaidButton invoiceId={inv.id} />}
                              <Button variant="ghost" size="sm" render={<Link href={`/invoices/${inv.id}`} />}>
                                {t.common.view}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
