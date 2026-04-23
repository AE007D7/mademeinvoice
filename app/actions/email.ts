'use server'

import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { buildInvoiceEmailHtml } from '@/components/emails/invoice-email'

export async function sendInvoiceEmailAction(invoiceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const [invoiceRes, brandingRes] = await Promise.all([
    supabase
      .from('invoices')
      .select('*, clients(name, email)')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('branding')
      .select('company_name, email')
      .eq('user_id', user.id)
      .single(),
  ])

  if (!invoiceRes.data) return { error: 'Invoice not found.' }

  const invoice = invoiceRes.data
  const client = invoice.clients as { name: string; email?: string | null } | null
  const branding = brandingRes.data

  if (!client?.email) return { error: 'Client has no email address. Add one in Clients.' }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return { error: 'Email not configured (RESEND_API_KEY missing).' }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const viewUrl = `${appUrl}/invoice/${invoice.share_token}`
  const companyName = branding?.company_name ?? 'Made Me Invoice'
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@mademeinvoice.com'

  const dueDate = invoice.due_date
    ? new Date(invoice.due_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  const html = buildInvoiceEmailHtml({
    invoiceNumber: invoice.invoice_number ?? invoice.id.slice(0, 8).toUpperCase(),
    companyName,
    clientName: client.name,
    total: Number(invoice.total).toFixed(2),
    currency: invoice.currency,
    dueDate,
    viewUrl,
  })

  const resend = new Resend(resendKey)
  const { error } = await resend.emails.send({
    from: `${companyName} <${fromEmail}>`,
    to: client.email,
    subject: `Invoice ${invoice.invoice_number ?? '#' + invoice.id.slice(0, 8).toUpperCase()} from ${companyName}`,
    html,
  })

  if (error) return { error: error.message }

  await supabase
    .from('invoices')
    .update({ status: 'sent', email_sent_at: new Date().toISOString() })
    .eq('id', invoiceId)

  return { ok: true }
}
