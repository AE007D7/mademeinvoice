import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, FileText, Clock } from 'lucide-react'
import { RevenueChart } from '@/components/analytics/revenue-chart'

function getLastSixMonths() {
  const months: { key: string; label: string }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    })
  }
  return months
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [invoicesRes, clientsRes] = await Promise.all([
    supabase
      .from('invoices')
      .select('id, total, status, created_at, clients(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ])

  const invoices = invoicesRes.data ?? []

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0)
  const pending = invoices.filter(i => i.status === 'sent').reduce((s, i) => s + Number(i.total), 0)
  const paidCount = invoices.filter(i => i.status === 'paid').length
  const overdueCount = invoices.filter(i => i.status === 'overdue').length
  const avgInvoice = paidCount > 0 ? totalRevenue / paidCount : 0

  // Monthly revenue (last 6 months)
  const months = getLastSixMonths()
  const revenueByMonth = months.map(({ key, label }) => ({
    month: label,
    revenue: invoices
      .filter(i => i.status === 'paid' && i.created_at.slice(0, 7) === key)
      .reduce((s, i) => s + Number(i.total), 0),
  }))

  // Status breakdown
  const statusCounts = {
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: paidCount,
    overdue: overdueCount,
  }

  // Top clients by revenue
  const clientRevMap: Record<string, { name: string; revenue: number; count: number }> = {}
  for (const inv of invoices) {
    if (inv.status !== 'paid') continue
    const client = (inv.clients as unknown as { name: string } | null)
    const name = client?.name ?? 'No client'
    if (!clientRevMap[name]) clientRevMap[name] = { name, revenue: 0, count: 0 }
    clientRevMap[name].revenue += Number(inv.total)
    clientRevMap[name].count++
  }
  const topClients = Object.values(clientRevMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Your invoicing performance at a glance.</p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{paidCount} paid invoice{paidCount !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${pending.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Invoice</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${avgInvoice.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Per paid invoice</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{invoices.length}</p>
            <p className="text-xs text-muted-foreground">{overdueCount} overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue — Last 6 Months</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenueByMonth} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Status breakdown */}
        <Card>
          <CardHeader><CardTitle>Invoice Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {([
              { label: 'Paid', key: 'paid', color: 'bg-green-500' },
              { label: 'Sent', key: 'sent', color: 'bg-blue-500' },
              { label: 'Draft', key: 'draft', color: 'bg-muted-foreground' },
              { label: 'Overdue', key: 'overdue', color: 'bg-red-500' },
            ] as const).map(({ label, key, color }) => {
              const count = statusCounts[key]
              const pct = invoices.length > 0 ? (count / invoices.length) * 100 : 0
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Top clients */}
        <Card>
          <CardHeader><CardTitle>Top Clients by Revenue</CardTitle></CardHeader>
          <CardContent>
            {topClients.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No paid invoices yet.</p>
            ) : (
              <div className="space-y-3">
                {topClients.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.count} invoice{c.count !== 1 ? 's' : ''}</p>
                    </div>
                    <span className="font-semibold text-foreground">${c.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
