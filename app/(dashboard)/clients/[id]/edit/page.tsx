import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditClientForm from './edit-client-form'

type Params = Promise<{ id: string }>

export default async function EditClientPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, email, phone, address')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!client) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Client</h1>
        <p className="text-sm text-muted-foreground">Update name, email, or address.</p>
      </div>
      <EditClientForm client={client} />
    </div>
  )
}
