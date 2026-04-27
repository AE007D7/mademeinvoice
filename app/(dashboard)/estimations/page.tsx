import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'

const STATUS_BADGE: Record<string, string> = {
  draft:   'bg-muted text-muted-foreground',
  sent:    'bg-blue-100 text-blue-700',
  paid:    'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
}

export default async function EstimationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: estimations } = await supabase
    .from('invoices')
    .select('id, invoice_number, total, currency, status, created_at, clients(name)')
    .eq('user_id', user.id)
    .eq('document_type', 'estimation')
    .order('created_at', { ascending: false })

  const empty = !estimations || estimations.length === 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Estimates</h1>
        <Button render={<Link href="/invoices/new?docType=estimation" />} className="gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Estimate</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Estimates</CardTitle>
        </CardHeader>
        <CardContent>
          {empty ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No estimates yet.{' '}
              <Link
                href="/invoices/new?docType=estimation"
                className="text-foreground underline underline-offset-2"
              >
                Create your first estimate
              </Link>
              .
            </div>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="divide-y divide-border sm:hidden">
                {estimations.map((est) => {
                  const client = (est.clients as unknown) as { name: string } | null
                  return (
                    <div key={est.id} className="flex items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground text-sm">
                          {client?.name ?? '—'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(est.created_at).toLocaleDateString()} &middot; {est.invoice_number ?? '#' + est.id.slice(0, 6).toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-foreground">
                          {est.currency} {Number(est.total).toFixed(2)}
                        </p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[est.status] ?? ''}`}>
                          {est.status}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" render={<Link href={`/invoices/${est.id}`} />}>
                        View
                      </Button>
                    </div>
                  )
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <th className="pb-2 pr-4">Estimate #</th>
                      <th className="pb-2 pr-4">Client</th>
                      <th className="pb-2 pr-4">Date</th>
                      <th className="pb-2 pr-4">Amount</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {estimations.map((est) => {
                      const client = (est.clients as unknown) as { name: string } | null
                      return (
                        <tr key={est.id} className="hover:bg-muted/40">
                          <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                            {est.invoice_number ?? '#' + est.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="py-3 pr-4 font-medium">{client?.name ?? '—'}</td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            {new Date(est.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 pr-4 font-medium">
                            {est.currency} {Number(est.total).toFixed(2)}
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[est.status] ?? ''}`}>
                              {est.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <Button variant="ghost" size="sm" render={<Link href={`/invoices/${est.id}`} />}>
                              View
                            </Button>
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
