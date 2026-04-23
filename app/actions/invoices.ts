'use server'

import { createClient } from '@/lib/supabase/server'
import { checkInvoiceLimit } from '@/lib/subscription'
import { redirect } from 'next/navigation'

export type LineItem = {
  description: string
  quantity: number
  price: number
}

export type CreateInvoiceInput = {
  clientId: string | null
  currency: string
  taxRate: number
  items: LineItem[]
  dueDate?: string | null
  notes?: string | null
  template?: string
  accentColor?: string
}

export async function createInvoiceAction(input: CreateInvoiceInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const limit = await checkInvoiceLimit(supabase, user.id)
  if (!limit.allowed) return { error: limit.reason }

  const subtotal = input.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  )
  const taxAmount = subtotal * (input.taxRate / 100)
  const total = subtotal + taxAmount

  // Get sequential invoice number atomically
  const { data: numData } = await supabase.rpc('next_invoice_number', { p_user_id: user.id })

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      user_id: user.id,
      client_id: input.clientId || null,
      amount: subtotal,
      tax: input.taxRate,
      total,
      currency: input.currency,
      status: 'draft',
      due_date: input.dueDate || null,
      notes: input.notes || null,
      template: input.template ?? 'modern',
      accent_color: input.accentColor ?? '#6366f1',
      invoice_number: numData ?? null,
    })
    .select()
    .single()

  if (invoiceError || !invoice) {
    return { error: invoiceError?.message ?? 'Failed to create invoice.' }
  }

  if (input.items.length > 0) {
    const { error: itemsError } = await supabase.from('invoice_items').insert(
      input.items.map((item) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
      }))
    )
    if (itemsError) return { error: itemsError.message }
  }

  redirect(`/invoices/${invoice.id}`)
}

export async function updateInvoiceStatus(invoiceId: string, status: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase
    .from('invoices')
    .update({ status })
    .eq('id', invoiceId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}
