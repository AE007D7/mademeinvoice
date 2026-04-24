import * as React from 'react'

type Props = {
  invoiceNumber: string
  companyName: string
  clientName: string
  total: string
  currency: string
  dueDate?: string | null
  viewUrl: string
}

export function InvoiceEmail({ invoiceNumber, companyName, clientName, total, currency, dueDate, viewUrl }: Props) {
  return (
    <html>
      <head />
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#f9fafb', margin: 0, padding: '40px 16px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ background: '#6366f1', padding: '28px 32px' }}>
            <p style={{ margin: 0, color: '#fff', fontSize: 20, fontWeight: 700 }}>{companyName}</p>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Invoice {invoiceNumber}</p>
          </div>
          <div style={{ padding: 32 }}>
            <p style={{ margin: '0 0 16px', fontSize: 15, color: '#111827' }}>Hi {clientName},</p>
            <p style={{ margin: '0 0 24px', fontSize: 15, color: '#374151', lineHeight: 1.6 }}>
              Please find your invoice from <strong>{companyName}</strong> below.
            </p>
            <div style={{ background: '#f3f4f6', borderRadius: 8, padding: '16px 20px', marginBottom: 24 }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount Due</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#111827' }}>{currency} {total}</p>
              {dueDate && <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6b7280' }}>Due {dueDate}</p>}
            </div>
            <a href={viewUrl} style={{ display: 'inline-block', background: '#6366f1', color: '#fff', padding: '12px 28px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              View Invoice
            </a>
            <p style={{ margin: '24px 0 0', fontSize: 13, color: '#9ca3af' }}>Or copy: {viewUrl}</p>
          </div>
          <div style={{ borderTop: '1px solid #e5e7eb', padding: '16px 32px' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Sent via Made Me Invoice</p>
          </div>
        </div>
      </body>
    </html>
  )
}
