import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditProductForm from './edit-product-form'

type Params = Promise<{ id: string }>

export default async function EditProductPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!product) notFound()

  return <EditProductForm product={product} />
}
