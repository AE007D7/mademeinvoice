import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUiLang } from '@/lib/get-lang'
import { getUiT } from '@/lib/i18n'
import { isTrialActive } from '@/lib/subscription'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, Clock, Users, FileText, AlertTriangle } from 'lucide-react'

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [lang, invoicesRes, clientsRes, recentRes, userRes] = await Promise.all([
    getUiLang(),
    supabase.from('invoices').select('total, status').eq('user_id', user.id),
    supabase.from('clients').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('invoices').select('id, total, currency, status, created_at, clients(name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('users').select('plan, trial_ends_at').eq('id', user.id).single(),
  ])

  const t = getUiT(lang)
  const allInvoices = invoicesRes.data ?? []
  const totalRevenue = allInvoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + Number(i.total), 0)
  const pendingAmount = allInvoices.filter((i) => i.status === 'sent').reduce((sum, i) => sum + Number(i.total), 0)
  const clientCount = clientsRes.count ?? 0
  const recentInvoices = recentRes.data ?? []
  const userData = userRes.data

  const trialActive = userData ? isTrialActive(userData.trial_ends_at ?? null) : false
  const trialEndsAt = userData?.trial_ends_at ? new Date(userData.trial_ends_at) : null
  const daysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - new Date().getTime()) / 86400000)) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t.dashboard.title}</h1>
        <Button render={<Link href="/invoices/new" />}>{t.invoices.newInvoice}</Button>
      </div>

      {/* Trial banner */}
      {userData?.plan === 'free' && trialActive && (
        <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            {t.dashboard.trialEndsIn}{' '}
            <strong>{daysLeft} {daysLeft !== 1 ? t.dashboard.days : t.dashboard.day}</strong>.{' '}
            <Link href="/billing" className="font-semibold underline underline-offset-2">
              {t.dashboard.upgradePro}
            </Link>{' '}
            {t.dashboard.keepAccess}
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.dashboard.totalRevenue}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{t.dashboard.fromPaid}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.dashboard.pending}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${pendingAmount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{t.dashboard.awaitingPayment}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.dashboard.clients}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{clientCount}</p>
            <p className="text-xs text-muted-foreground">{t.dashboard.totalClients}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t.dashboard.invoices}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{allInvoices.length}</p>
            <p className="text-xs text-muted-foreground">{t.dashboard.allTime}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t.dashboard.recentInvoices}</CardTitle>
          <Button variant="ghost" size="sm" render={<Link href="/invoices" />}>
            {t.dashboard.viewAll}
          </Button>
        </CardHeader>
        <CardContent>
          {recentInvoices.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t.dashboard.noInvoices}{' '}
              <Link href="/invoices/new" className="text-foreground underline underline-offset-2">
                {t.dashboard.createFirst}
              </Link>
              .
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-medium">{t.invoices.cols.client}</th>
                    <th className="pb-2 font-medium">{t.invoices.cols.amount}</th>
                    <th className="pb-2 font-medium">{t.invoices.cols.status}</th>
                    <th className="hidden pb-2 font-medium sm:table-cell">{t.invoices.cols.date}</th>
                    <th className="pb-2 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentInvoices.map((invoice) => {
                    const client = (invoice.clients as unknown) as { name: string } | null
                    const statusLabel = t.invoices.status[invoice.status as keyof typeof t.invoices.status] ?? invoice.status
                    return (
                      <tr key={invoice.id} className="hover:bg-muted/40">
                        <td className="py-2 font-medium">{client?.name ?? t.dashboard.noClient}</td>
                        <td className="py-2 pr-4">{invoice.currency} {Number(invoice.total).toFixed(2)}</td>
                        <td className="py-2 pr-4">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[invoice.status] ?? ''}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="hidden py-2 pr-4 text-muted-foreground sm:table-cell">
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-2 text-right">
                          <Button variant="ghost" size="sm" render={<Link href={`/invoices/${invoice.id}`} />}>
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
