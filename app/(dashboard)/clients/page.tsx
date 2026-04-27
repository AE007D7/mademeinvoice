import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUiLang } from '@/lib/get-lang'
import { getUiT } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [lang, { data: clients }] = await Promise.all([
    getUiLang(),
    supabase.from('clients').select('*').eq('user_id', user.id).order('name'),
  ])

  const t = getUiT(lang)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t.clients.title}</h1>
        <Button render={<Link href="/clients/new" />} className="gap-1.5">
          <Plus className="h-4 w-4" />
          {t.clients.newClient}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.clients.allClients}</CardTitle>
        </CardHeader>
        <CardContent>
          {!clients || clients.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {t.clients.noClients}{' '}
              <Link href="/clients/new" className="text-foreground underline underline-offset-2">
                {t.clients.addFirst}
              </Link>
              .
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <th className="pb-2 pr-4">{t.clients.colName}</th>
                    <th className="pb-2 pr-4">{t.clients.colEmail}</th>
                    <th className="pb-2 pr-4">{t.clients.colAddress}</th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-muted/40">
                      <td className="py-3 pr-4 font-medium">
                        <Link href={`/clients/${client.id}`} className="hover:underline underline-offset-2">{client.name}</Link>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{client.email ?? '—'}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{client.address ?? '—'}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" render={<Link href={`/clients/${client.id}/edit`} />}>
                            {t.clients.edit}
                          </Button>
                          <Button variant="ghost" size="sm" render={<Link href={`/invoices/new?clientId=${client.id}`} />}>
                            {t.clients.invoice}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
