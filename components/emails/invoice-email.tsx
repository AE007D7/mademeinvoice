type Props = {
  invoiceNumber: string
  companyName: string
  clientName: string
  total: string
  currency: string
  dueDate?: string | null
  viewUrl: string
}

export function buildInvoiceEmailHtml({ invoiceNumber, companyName, clientName, total, currency, dueDate, viewUrl }: Props): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:system-ui,sans-serif;background:#f9fafb;margin:0;padding:40px 16px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">
    <div style="background:#6366f1;padding:28px 32px">
      <p style="margin:0;color:#fff;font-size:20px;font-weight:700">${escHtml(companyName)}</p>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px">Invoice ${escHtml(invoiceNumber)}</p>
    </div>
    <div style="padding:32px">
      <p style="margin:0 0 16px;font-size:15px;color:#111827">Hi ${escHtml(clientName)},</p>
      <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6">
        Please find your invoice from <strong>${escHtml(companyName)}</strong> below.
      </p>
      <div style="background:#f3f4f6;border-radius:8px;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">Amount Due</p>
        <p style="margin:0;font-size:28px;font-weight:700;color:#111827">${escHtml(currency)} ${escHtml(total)}</p>
        ${dueDate ? `<p style="margin:6px 0 0;font-size:13px;color:#6b7280">Due ${escHtml(dueDate)}</p>` : ''}
      </div>
      <a href="${escHtml(viewUrl)}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none">
        View Invoice
      </a>
      <p style="margin:24px 0 0;font-size:13px;color:#9ca3af">Or copy this link: ${escHtml(viewUrl)}</p>
    </div>
    <div style="border-top:1px solid #e5e7eb;padding:16px 32px">
      <p style="margin:0;font-size:12px;color:#9ca3af">Sent via Made Me Invoice</p>
    </div>
  </div>
</body>
</html>`
}

function escHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
