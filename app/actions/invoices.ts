'use server'

import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { checkInvoiceLimit } from '@/lib/subscription'
import { PlanLimitError } from '@/lib/ai/errors'
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
  invoiceDate?: string | null
  dueDate?: string | null
  notes?: string | null
  template?: string
  accentColor?: string
  docType?: 'invoice' | 'estimation'
}

// ─── Core: no redirect, no auth — caller provides verified userId + supabase ───
// Throws PlanLimitError if the monthly limit is reached.
// Throws Error for any other DB failure.
export async function createInvoiceCore(
  input: CreateInvoiceInput,
  userId: string,
  supabase: SupabaseClient
): Promise<{ id: string; share_token: string; invoice_number: string | null }> {
  const limit = await checkInvoiceLimit(supabase, userId)
  if (!limit.allowed) throw new PlanLimitError(limit.reason ?? 'Invoice limit reached.')

  const items = input.items.filter(
    (i) => i.description.trim() !== '' || i.price > 0
  )

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  )
  const taxAmount = subtotal * (input.taxRate / 100)
  const total = subtotal + taxAmount

  const { data: numData } = await supabase.rpc('next_invoice_number', { p_user_id: userId })

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      user_id: userId,
      client_id: input.clientId || null,
      amount: subtotal,
      tax: input.taxRate,
      total,
      currency: input.currency,
      status: 'draft',
      invoice_date: input.invoiceDate || null,
      due_date: input.dueDate || null,
      notes: input.notes || null,
      template: input.template ?? 'modern',
      accent_color: input.accentColor ?? '#6366f1',
      document_type: input.docType ?? 'invoice',
      invoice_number: numData ?? null,
    })
    .select('id, share_token, invoice_number')
    .single()

  if (invoiceError || !invoice) {
    throw new Error(invoiceError?.message ?? 'Failed to create invoice.')
  }

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from('invoice_items').insert(
      items.map((item) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
      }))
    )
    if (itemsError) throw new Error(itemsError.message)
  }

  return {
    id: invoice.id,
    share_token: invoice.share_token,
    invoice_number: invoice.invoice_number,
  }
}

// ─── Server action: auth → core → redirect ────────────────────────────────────
export async function createInvoiceAction(input: CreateInvoiceInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  let invoiceId: string
  try {
    const invoice = await createInvoiceCore(input, user.id, supabase)
    invoiceId = invoice.id
  } catch (err) {
    if (err instanceof PlanLimitError) return { error: err.message }
    throw err
  }

  redirect(`/invoices/${invoiceId}`)
}

export type UpdateInvoiceInput = CreateInvoiceInput & { invoiceId: string }

export async function updateInvoiceAction(input: UpdateInvoiceInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const items = input.items.filter(
    (i) => i.description.trim() !== '' || i.price > 0
  )

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const taxAmount = subtotal * (input.taxRate / 100)
  const total = subtotal + taxAmount

  const { error: invoiceError } = await supabase
    .from('invoices')
    .update({
      client_id: input.clientId || null,
      amount: subtotal,
      tax: input.taxRate,
      total,
      currency: input.currency,
      due_date: input.dueDate || null,
      notes: input.notes || null,
      template: input.template ?? 'modern',
      accent_color: input.accentColor ?? '#6366f1',
      document_type: input.docType ?? 'invoice',
    })
    .eq('id', input.invoiceId)
    .eq('user_id', user.id)

  if (invoiceError) return { error: invoiceError.message }

  await supabase.from('invoice_items').delete().eq('invoice_id', input.invoiceId)

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from('invoice_items').insert(
      items.map((item) => ({
        invoice_id: input.invoiceId,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
      }))
    )
    if (itemsError) return { error: itemsError.message }
  }

  redirect(`/invoices/${input.invoiceId}`)
}

export async function convertToInvoiceAction(invoiceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase
    .from('invoices')
    .update({ document_type: 'invoice' })
    .eq('id', invoiceId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function duplicateInvoiceAction(invoiceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const limit = await checkInvoiceLimit(supabase, user.id)
  if (!limit.allowed) return { error: limit.reason }

  const [invoiceRes, itemsRes] = await Promise.all([
    supabase.from('invoices').select('*').eq('id', invoiceId).eq('user_id', user.id).single(),
    supabase.from('invoice_items').select('description, quantity, price').eq('invoice_id', invoiceId),
  ])

  if (!invoiceRes.data) return { error: 'Invoice not found.' }
  const orig = invoiceRes.data

  const { data: numData } = await supabase.rpc('next_invoice_number', { p_user_id: user.id })

  const { data: newInvoice, error: invError } = await supabase
    .from('invoices')
    .insert({
      user_id: user.id,
      client_id: orig.client_id,
      amount: orig.amount,
      tax: orig.tax,
      total: orig.total,
      currency: orig.currency,
      status: 'draft',
      notes: orig.notes,
      template: orig.template,
      accent_color: orig.accent_color,
      document_type: orig.document_type,
      due_date: null,
      invoice_number: numData ?? null,
    })
    .select('id')
    .single()

  if (invError || !newInvoice) return { error: invError?.message ?? 'Failed to duplicate.' }

  const items = itemsRes.data ?? []
  if (items.length > 0) {
    await supabase.from('invoice_items').insert(
      items.map((item) => ({ invoice_id: newInvoice.id, ...item }))
    )
  }

  redirect(`/invoices/${newInvoice.id}/edit`)
}

export async function deleteInvoiceAction(invoiceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  redirect('/invoices')
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
