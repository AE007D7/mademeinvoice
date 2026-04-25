import { Phone, Mail, Globe, MapPin, Building2, Wallet, CreditCard } from 'lucide-react'
import { getInvoiceT } from '@/lib/i18n'

export type TemplateId = 'classic' | 'modern' | 'minimal' | 'bold' | 'stripe' | 'ruled' | 'corporate'

export type TemplateData = {
  companyName: string
  logoUrl?: string | null
  companyPhone?: string | null
  companyEmail?: string | null
  companyWebsite?: string | null
  companyAddress?: string | null
  invoiceNumber: string
  issueDate: string
  dueDate?: string | null
  notes?: string | null
  clientName: string
  clientEmail?: string | null
  clientAddress?: string | null
  items: Array<{ id: string; description: string; quantity: number; price: number }>
  currency: string
  taxRate: number
  subtotal: number
  taxAmount: number
  total: number
  accentColor: string
  status?: string
  paymentIban?: string | null
  paymentRib?: string | null
  paymentPaypal?: string | null
  lang?: string | null
}

// ─── shared helpers ───────────────────────────────────────────────────────────
function ContactFooter({ d }: { d: TemplateData }) {
  const t = getInvoiceT(d.lang)
  const hasContact = d.companyPhone || d.companyEmail || d.companyWebsite || d.companyAddress
  const hasPayment = d.paymentIban || d.paymentRib || d.paymentPaypal
  if (!hasContact && !hasPayment) return null
  return (
    <div className="space-y-3">
      {hasPayment && (
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-5 py-4 text-xs text-gray-700">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: d.accentColor }}>
            <Wallet className="h-3 w-3" />
            {t.paymentDetails}
          </p>
          <div className="space-y-1.5">
            {d.paymentIban && (
              <div className="flex items-start gap-2">
                <Building2 className="mt-0.5 h-3 w-3 shrink-0 text-gray-400" />
                <span><span className="font-semibold text-gray-500">IBAN: </span><span className="font-mono tracking-wide">{d.paymentIban}</span></span>
              </div>
            )}
            {d.paymentRib && (
              <div className="flex items-start gap-2">
                <CreditCard className="mt-0.5 h-3 w-3 shrink-0 text-gray-400" />
                <span><span className="font-semibold text-gray-500">RIB: </span><span className="font-mono tracking-wide">{d.paymentRib}</span></span>
              </div>
            )}
            {d.paymentPaypal && (
              <div className="flex items-start gap-2">
                <Wallet className="mt-0.5 h-3 w-3 shrink-0 text-gray-400" />
                <span><span className="font-semibold text-gray-500">PayPal: </span>{d.paymentPaypal}</span>
              </div>
            )}
          </div>
        </div>
      )}
      {hasContact && (
        <div className="text-center text-xs text-gray-400 space-y-1.5">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            {d.companyPhone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 shrink-0" />
                {d.companyPhone}
              </span>
            )}
            {d.companyEmail && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3 shrink-0" />
                {d.companyEmail}
              </span>
            )}
            {d.companyWebsite && (
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3 shrink-0" />
                {d.companyWebsite}
              </span>
            )}
          </div>
          {d.companyAddress && (
            <span className="flex items-center justify-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="whitespace-pre-line">{d.companyAddress}</span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// CLASSIC
// ─────────────────────────────────────────────
export function ClassicTemplate(d: TemplateData) {
  const t = getInvoiceT(d.lang)
  return (
    <div className="min-h-full bg-white font-sans text-gray-900" dir={t.dir} style={{ fontFamily: 'inherit' }}>
      <div className="px-12 pt-12 pb-4">
        <div className="flex items-start justify-between">
          <div>
            {d.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.logoUrl} alt="logo" className="mb-1 h-10 w-auto object-contain" />
            ) : (
              <p className="text-xl font-bold tracking-tight">{d.companyName}</p>
            )}
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold uppercase tracking-widest text-gray-800">{t.invoice}</h1>
            <p className="mt-0.5 text-sm text-gray-500">#{d.invoiceNumber}</p>
            <p className="text-sm text-gray-500">{d.issueDate}</p>
            {d.dueDate && <p className="text-sm text-gray-500">{t.dueDate}: {d.dueDate}</p>}
          </div>
        </div>
        <div className="mt-5 h-[3px] rounded-full" style={{ background: d.accentColor }} />
      </div>

      <div className="flex gap-16 px-12 py-5">
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">{t.billTo}</p>
          <p className="font-semibold text-gray-900">{d.clientName || 'Client Name'}</p>
          {d.clientEmail && <p className="text-sm text-gray-500">{d.clientEmail}</p>}
          {d.clientAddress && <p className="whitespace-pre-line text-sm text-gray-500">{d.clientAddress}</p>}
        </div>
        {d.logoUrl && d.companyName && (
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">{t.from}</p>
            <p className="font-semibold text-gray-900">{d.companyName}</p>
          </div>
        )}
      </div>

      <div className="px-12 pb-4">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `2px solid ${d.accentColor}` }}>
              <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t.description}</th>
              <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">{t.qty}</th>
              <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">{t.price}</th>
              <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">{t.lineTotal}</th>
            </tr>
          </thead>
          <tbody>
            {d.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-2.5 text-gray-800">{item.description || '—'}</td>
                <td className="py-2.5 text-right text-gray-600">{item.quantity}</td>
                <td className="py-2.5 text-right text-gray-600">{d.currency} {item.price.toFixed(2)}</td>
                <td className="py-2.5 text-right font-medium">{d.currency} {(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end px-12 pb-6">
        <div className="w-56 text-sm">
          <div className="flex justify-between py-1 text-gray-500">
            <span>{t.subtotal}</span><span>{d.currency} {d.subtotal.toFixed(2)}</span>
          </div>
          {d.taxRate > 0 && (
            <div className="flex justify-between py-1 text-gray-500">
              <span>{t.tax} ({d.taxRate}%)</span><span>{d.currency} {d.taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
            <span>{t.total}</span>
            <span style={{ color: d.accentColor }}>{d.currency} {d.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {d.notes && (
        <div className="mx-12 border-t border-gray-100 py-4 text-sm text-gray-600">
          <p className="mb-1 font-semibold text-gray-700">{t.notes}</p>
          <p className="whitespace-pre-line">{d.notes}</p>
        </div>
      )}

      <div className="px-12 pb-10 pt-4 border-t border-gray-100">
        <p className="text-center text-xs text-gray-400">{t.thankYou}</p>
        <ContactFooter d={d} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MODERN
// ─────────────────────────────────────────────
export function ModernTemplate(d: TemplateData) {
  const t = getInvoiceT(d.lang)
  return (
    <div className="min-h-full bg-white font-sans text-gray-900" dir={t.dir} style={{ fontFamily: 'inherit' }}>
      <div className="px-12 py-8" style={{ background: d.accentColor }}>
        <div className="flex items-center justify-between">
          <div>
            {d.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.logoUrl} alt="logo" className="h-8 w-auto object-contain brightness-0 invert" />
            ) : (
              <p className="text-lg font-bold text-white/90">{d.companyName}</p>
            )}
            <p className="mt-1 text-sm font-medium text-white/60">#{d.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-black uppercase tracking-wider text-white">{t.invoice}</h1>
            <p className="mt-1 text-sm text-white/70">{d.issueDate}</p>
            {d.dueDate && <p className="text-sm text-white/70">{t.dueDate} {d.dueDate}</p>}
          </div>
        </div>
      </div>

      <div className="px-12 py-7">
        <div className="inline-block rounded-xl bg-gray-50 px-5 py-4">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">{t.billTo}</p>
          <p className="font-semibold text-gray-900">{d.clientName || 'Client Name'}</p>
          {d.clientEmail && <p className="text-sm text-gray-500">{d.clientEmail}</p>}
          {d.clientAddress && <p className="whitespace-pre-line text-sm text-gray-500">{d.clientAddress}</p>}
        </div>
      </div>

      <div className="px-12">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">{t.description}</th>
              <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">{t.qty}</th>
              <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">{t.price}</th>
              <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">{t.lineTotal}</th>
            </tr>
          </thead>
          <tbody>
            {d.items.map((item, i) => (
              <tr key={item.id} className={i % 2 !== 0 ? 'bg-gray-50/60' : ''}>
                <td className="py-3 text-gray-800">{item.description || '—'}</td>
                <td className="py-3 text-right text-gray-500">{item.quantity}</td>
                <td className="py-3 text-right text-gray-500">{d.currency} {item.price.toFixed(2)}</td>
                <td className="py-3 text-right font-medium">{d.currency} {(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end px-12 pb-8 pt-4">
        <div className="w-60 text-sm">
          <div className="flex justify-between py-1 text-gray-500">
            <span>{t.subtotal}</span><span>{d.currency} {d.subtotal.toFixed(2)}</span>
          </div>
          {d.taxRate > 0 && (
            <div className="flex justify-between py-1 text-gray-500">
              <span>{t.tax} ({d.taxRate}%)</span><span>{d.currency} {d.taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between rounded-xl px-4 py-3 text-white" style={{ background: d.accentColor }}>
            <span className="text-sm font-semibold text-white/80">{t.total}</span>
            <span className="text-lg font-bold">{d.currency} {d.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {d.notes && (
        <div className="mx-12 border-t border-gray-100 py-4 text-sm text-gray-600">
          <p className="mb-1 font-semibold text-gray-700">{t.notes}</p>
          <p className="whitespace-pre-line">{d.notes}</p>
        </div>
      )}

      <div className="px-12 pb-8 pt-2">
        <ContactFooter d={d} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MINIMAL
// ─────────────────────────────────────────────
export function MinimalTemplate(d: TemplateData) {
  const t = getInvoiceT(d.lang)
  return (
    <div className="min-h-full bg-white font-sans text-gray-900" dir={t.dir} style={{ fontFamily: 'inherit' }}>
      <div className="px-12 pt-12">
        <div className="flex items-start justify-between">
          <div>
            {d.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.logoUrl} alt="logo" className="h-8 w-auto object-contain" />
            ) : (
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">{d.companyName}</p>
            )}
          </div>
          <div className="rounded-full px-3 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-white" style={{ background: d.accentColor }}>
            {t.invoice}
          </div>
        </div>

        <div className="my-6 border-t border-gray-200" />

        <div className="flex items-start justify-between text-sm">
          <div>
            <p className="font-semibold text-gray-900">{d.clientName || 'Client Name'}</p>
            {d.clientEmail && <p className="text-gray-400">{d.clientEmail}</p>}
            {d.clientAddress && <p className="whitespace-pre-line text-gray-400">{d.clientAddress}</p>}
          </div>
          <div className="text-right">
            <p className="font-mono text-xs text-gray-400">#{d.invoiceNumber}</p>
            <p className="text-gray-400">{d.issueDate}</p>
            {d.dueDate && <p className="text-gray-400">{t.dueDate} {d.dueDate}</p>}
          </div>
        </div>

        <div className="my-6 border-t border-dashed border-gray-200" />

        <div className="space-y-0">
          {d.items.map((item) => (
            <div key={item.id} className="flex items-baseline justify-between py-2.5 text-sm">
              <span className="text-gray-800">
                {item.description || '—'}
                {item.quantity > 1 && <span className="ml-2 text-xs text-gray-400">×{item.quantity}</span>}
              </span>
              <span className="ml-4 shrink-0 font-mono tabular-nums text-gray-700">
                {d.currency} {(item.quantity * item.price).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="my-4 border-t border-dashed border-gray-200" />

        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>{t.subtotal}</span><span className="font-mono">{d.currency} {d.subtotal.toFixed(2)}</span>
          </div>
          {d.taxRate > 0 && (
            <div className="flex justify-between text-gray-400">
              <span>{t.tax} ({d.taxRate}%)</span><span className="font-mono">{d.currency} {d.taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 text-base font-bold" style={{ color: d.accentColor }}>
            <span>{t.total}</span><span className="font-mono">{d.currency} {d.total.toFixed(2)}</span>
          </div>
        </div>

        {d.notes && (
          <>
            <div className="mt-4 border-t border-gray-200" />
            <p className="py-4 text-sm text-gray-400 whitespace-pre-line">{d.notes}</p>
          </>
        )}

        <div className="pb-10 pt-6">
          <ContactFooter d={d} />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// BOLD
// ─────────────────────────────────────────────
export function BoldTemplate(d: TemplateData) {
  const t = getInvoiceT(d.lang)
  return (
    <div className="min-h-full bg-white font-sans text-gray-900" dir={t.dir} style={{ fontFamily: 'inherit' }}>
      <div className="relative overflow-hidden px-12 py-10" style={{ background: d.accentColor }}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative flex items-end justify-between">
          <div>
            {d.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.logoUrl} alt="logo" className="mb-2 h-8 w-auto object-contain brightness-0 invert" />
            ) : (
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-white/70">{d.companyName}</p>
            )}
            <h1 className="text-5xl font-black uppercase tracking-tight text-white">{t.invoice}</h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white/90">#{d.invoiceNumber}</p>
            <p className="mt-1 text-sm text-white/60">{d.issueDate}</p>
            {d.dueDate && <p className="text-sm text-white/60">{t.dueDate}: {d.dueDate}</p>}
          </div>
        </div>
      </div>

      <div className="px-12 py-8">
        <div className="mb-8 flex items-start gap-12">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">{t.billTo}</p>
            <p className="text-lg font-bold text-gray-900">{d.clientName || 'Client Name'}</p>
            {d.clientEmail && <p className="text-sm text-gray-500">{d.clientEmail}</p>}
            {d.clientAddress && <p className="whitespace-pre-line text-sm text-gray-500">{d.clientAddress}</p>}
          </div>
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">{t.amountDue}</p>
            <p className="rounded-xl px-4 py-2 text-2xl font-black text-white" style={{ background: d.accentColor }}>
              {d.currency} {d.total.toFixed(2)}
            </p>
            {d.dueDate && <p className="mt-1 text-xs text-gray-400">{t.dueDate} {d.dueDate}</p>}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-y-2 border-gray-900">
              <th className="py-2 text-left text-xs font-bold uppercase tracking-wider">{t.description}</th>
              <th className="py-2 text-right text-xs font-bold uppercase tracking-wider">{t.qty}</th>
              <th className="py-2 text-right text-xs font-bold uppercase tracking-wider">{t.price}</th>
              <th className="py-2 text-right text-xs font-bold uppercase tracking-wider">{t.lineTotal}</th>
            </tr>
          </thead>
          <tbody>
            {d.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 text-gray-800">{item.description || '—'}</td>
                <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                <td className="py-3 text-right text-gray-600">{d.currency} {item.price.toFixed(2)}</td>
                <td className="py-3 text-right font-semibold">{d.currency} {(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-56 text-sm">
            <div className="flex justify-between py-1 text-gray-500">
              <span>{t.subtotal}</span><span>{d.currency} {d.subtotal.toFixed(2)}</span>
            </div>
            {d.taxRate > 0 && (
              <div className="flex justify-between py-1 text-gray-500">
                <span>{t.tax} ({d.taxRate}%)</span><span>{d.currency} {d.taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t-2 border-gray-900 pt-2 text-base font-black">
              <span>{t.total}</span><span>{d.currency} {d.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {d.notes && (
          <div className="mt-8 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
            <p className="mb-1 font-semibold text-gray-700">{t.notes}</p>
            <p className="whitespace-pre-line">{d.notes}</p>
          </div>
        )}
        <div className="mt-6">
          <ContactFooter d={d} />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// STRIPE  (colored left sidebar)
// ─────────────────────────────────────────────
export function StripeTemplate(d: TemplateData) {
  const t = getInvoiceT(d.lang)
  return (
    <div className="min-h-full flex bg-white font-sans text-gray-900" dir={t.dir} style={{ fontFamily: 'inherit' }}>
      {/* Left stripe */}
      <div className="w-3 shrink-0" style={{ background: d.accentColor }} />

      {/* Content */}
      <div className="flex-1 px-10 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            {d.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.logoUrl} alt="logo" className="h-10 w-auto object-contain mb-1" />
            ) : (
              <p className="text-xl font-bold tracking-tight text-gray-900">{d.companyName}</p>
            )}
            <div className="mt-2 space-y-0.5 text-xs text-gray-400">
              {d.companyEmail && <p>{d.companyEmail}</p>}
              {d.companyPhone && <p>{d.companyPhone}</p>}
              {d.companyWebsite && <p>{d.companyWebsite}</p>}
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-black uppercase tracking-widest" style={{ color: d.accentColor }}>{t.invoice}</h1>
            <p className="mt-1 text-sm text-gray-500">#{d.invoiceNumber}</p>
            <p className="text-sm text-gray-500">{d.issueDate}</p>
            {d.dueDate && <p className="text-sm text-gray-500">{t.dueDate}: {d.dueDate}</p>}
          </div>
        </div>

        {/* Divider with accent */}
        <div className="mb-7 h-px bg-gray-100" />

        {/* Bill to */}
        <div className="mb-8">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: d.accentColor }}>{t.billTo}</p>
          <p className="font-semibold text-gray-900">{d.clientName || 'Client Name'}</p>
          {d.clientEmail && <p className="text-sm text-gray-500">{d.clientEmail}</p>}
          {d.clientAddress && <p className="whitespace-pre-line text-sm text-gray-500">{d.clientAddress}</p>}
        </div>

        {/* Table */}
        <table className="w-full text-sm mb-4">
          <thead>
            <tr>
              <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200">{t.description}</th>
              <th className="pb-2 text-right text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200">{t.qty}</th>
              <th className="pb-2 text-right text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200">{t.price}</th>
              <th className="pb-2 text-right text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200">{t.lineTotal}</th>
            </tr>
          </thead>
          <tbody>
            {d.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 text-gray-800">{item.description || '—'}</td>
                <td className="py-3 text-right text-gray-500">{item.quantity}</td>
                <td className="py-3 text-right text-gray-500">{d.currency} {item.price.toFixed(2)}</td>
                <td className="py-3 text-right font-semibold text-gray-800">{d.currency} {(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-52 text-sm">
            <div className="flex justify-between py-1 text-gray-400"><span>{t.subtotal}</span><span>{d.currency} {d.subtotal.toFixed(2)}</span></div>
            {d.taxRate > 0 && (
              <div className="flex justify-between py-1 text-gray-400"><span>{t.tax} ({d.taxRate}%)</span><span>{d.currency} {d.taxAmount.toFixed(2)}</span></div>
            )}
            <div className="mt-2 flex items-center justify-between rounded-lg px-3 py-2 font-bold text-white" style={{ background: d.accentColor }}>
              <span>{t.total}</span>
              <span>{d.currency} {d.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {d.notes && (
          <div className="mt-6 border-l-4 pl-4 py-1 text-sm text-gray-600" style={{ borderColor: d.accentColor }}>
            <p className="mb-0.5 font-semibold text-gray-700">{t.notes}</p>
            <p className="whitespace-pre-line">{d.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-center text-xs text-gray-400">{t.thankYou}</p>
          <ContactFooter d={d} />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// RULED  (executive, ruled-line aesthetic)
// ─────────────────────────────────────────────
export function RuledTemplate(d: TemplateData) {
  const t = getInvoiceT(d.lang)
  return (
    <div className="min-h-full bg-white font-sans text-gray-900" dir={t.dir} style={{ fontFamily: 'inherit' }}>
      {/* Top accent bar */}
      <div className="h-1.5 w-full" style={{ background: d.accentColor }} />

      <div className="px-12 py-9">
        {/* Header */}
        <div className="flex items-end justify-between pb-4 border-b-2 border-gray-800">
          <div>
            {d.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.logoUrl} alt="logo" className="h-10 w-auto object-contain" />
            ) : (
              <p className="text-2xl font-black tracking-tight text-gray-900">{d.companyName}</p>
            )}
          </div>
          <div className="text-right">
            <h1 className="text-lg font-bold uppercase tracking-[0.3em]" style={{ color: d.accentColor }}>{t.invoice}</h1>
            <p className="text-sm text-gray-500">#{d.invoiceNumber}</p>
          </div>
        </div>

        {/* Sub-header row */}
        <div className="flex justify-between items-center border-b border-gray-200 py-3 text-sm">
          <div className="flex gap-4 text-gray-400 text-xs">
            {d.companyPhone && <span>{d.companyPhone}</span>}
            {d.companyEmail && <span>{d.companyEmail}</span>}
            {d.companyWebsite && <span>{d.companyWebsite}</span>}
          </div>
          <div className="text-right text-xs text-gray-400">
            <span>{d.issueDate}</span>
            {d.dueDate && <span className="ml-4">{t.dueDate}: {d.dueDate}</span>}
          </div>
        </div>

        {/* Bill to */}
        <div className="border-b border-gray-200 py-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">{t.billTo}</p>
          <p className="font-semibold text-gray-900">{d.clientName || 'Client Name'}</p>
          {d.clientEmail && <p className="text-sm text-gray-500">{d.clientEmail}</p>}
          {d.clientAddress && <p className="whitespace-pre-line text-sm text-gray-500">{d.clientAddress}</p>}
        </div>

        {/* Table */}
        <table className="w-full text-sm mt-1">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">{t.description}</th>
              <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-600">{t.qty}</th>
              <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-600">{t.price}</th>
              <th className="py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-600">{t.lineTotal}</th>
            </tr>
          </thead>
          <tbody>
            {d.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 text-gray-800">{item.description || '—'}</td>
                <td className="py-3 text-right text-gray-500">{item.quantity}</td>
                <td className="py-3 text-right text-gray-500">{d.currency} {item.price.toFixed(2)}</td>
                <td className="py-3 text-right font-medium text-gray-800">{d.currency} {(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mt-1">
          <div className="w-56 text-sm">
            <div className="flex justify-between border-b border-gray-100 py-2 text-gray-500">
              <span>{t.subtotal}</span><span>{d.currency} {d.subtotal.toFixed(2)}</span>
            </div>
            {d.taxRate > 0 && (
              <div className="flex justify-between border-b border-gray-100 py-2 text-gray-500">
                <span>{t.tax} ({d.taxRate}%)</span><span>{d.currency} {d.taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-b-2 border-gray-800 py-2.5 text-base font-black">
              <span>{t.total}</span>
              <span style={{ color: d.accentColor }}>{d.currency} {d.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {d.notes && (
          <div className="mt-6 text-sm text-gray-600">
            <p className="mb-1 font-semibold text-gray-700 border-b border-gray-200 pb-1">{t.notes}</p>
            <p className="whitespace-pre-line pt-2">{d.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t-2 border-gray-800">
          <p className="text-xs text-gray-400 text-center">{t.thankYou}</p>
          <ContactFooter d={d} />
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="h-1.5 w-full" style={{ background: d.accentColor }} />
    </div>
  )
}

// ─────────────────────────────────────────────
// CORPORATE  (grid lines, boxed, structured)
// ─────────────────────────────────────────────
export function CorporateTemplate(d: TemplateData) {
  const t = getInvoiceT(d.lang)
  return (
    <div className="min-h-full bg-white font-sans text-gray-900" dir={t.dir} style={{ fontFamily: 'inherit' }}>
      {/* Header band */}
      <div className="px-10 py-7" style={{ background: d.accentColor }}>
        <div className="flex items-center justify-between">
          <div>
            {d.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.logoUrl} alt="logo" className="h-8 w-auto object-contain brightness-0 invert" />
            ) : (
              <p className="text-xl font-black uppercase tracking-wider text-white">{d.companyName}</p>
            )}
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-white">{t.invoice}</h1>
            <p className="text-sm text-white/70">#{d.invoiceNumber}</p>
          </div>
        </div>
      </div>

      {/* Info row */}
      <div className="grid grid-cols-3 border-b border-gray-200">
        <div className="border-r border-gray-200 px-6 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t.billTo}</p>
          <p className="font-semibold text-gray-900 text-sm">{d.clientName || 'Client Name'}</p>
          {d.clientEmail && <p className="text-xs text-gray-500">{d.clientEmail}</p>}
          {d.clientAddress && <p className="whitespace-pre-line text-xs text-gray-500">{d.clientAddress}</p>}
        </div>
        <div className="border-r border-gray-200 px-6 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t.from}</p>
          <p className="font-semibold text-gray-900 text-sm">{d.companyName}</p>
          {d.companyEmail && <p className="text-xs text-gray-500">{d.companyEmail}</p>}
          {d.companyPhone && <p className="text-xs text-gray-500">{d.companyPhone}</p>}
          {d.companyAddress && <p className="whitespace-pre-line text-xs text-gray-500">{d.companyAddress}</p>}
        </div>
        <div className="px-6 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Details</p>
          <div className="text-xs text-gray-500 space-y-0.5">
            <p>{t.issueDate}: {d.issueDate}</p>
            {d.dueDate && <p>{t.dueDate}: {d.dueDate}</p>}
          </div>
        </div>
      </div>

      {/* Items table with full grid lines */}
      <table className="w-full text-sm border-b border-gray-200">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">{t.description}</th>
            <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500 border-l border-gray-200">{t.qty}</th>
            <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500 border-l border-gray-200">{t.price}</th>
            <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500 border-l border-gray-200">{t.lineTotal}</th>
          </tr>
        </thead>
        <tbody>
          {d.items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="px-6 py-3 text-gray-800">{item.description || '—'}</td>
              <td className="px-4 py-3 text-right text-gray-500 border-l border-gray-100">{item.quantity}</td>
              <td className="px-4 py-3 text-right text-gray-500 border-l border-gray-100">{d.currency} {item.price.toFixed(2)}</td>
              <td className="px-6 py-3 text-right font-semibold border-l border-gray-100">{d.currency} {(item.quantity * item.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end border-b border-gray-200">
        <div className="w-64 text-sm border-l border-gray-200">
          <div className="flex justify-between px-6 py-2 border-b border-gray-100 text-gray-500">
            <span>{t.subtotal}</span><span>{d.currency} {d.subtotal.toFixed(2)}</span>
          </div>
          {d.taxRate > 0 && (
            <div className="flex justify-between px-6 py-2 border-b border-gray-100 text-gray-500">
              <span>{t.tax} ({d.taxRate}%)</span><span>{d.currency} {d.taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between px-6 py-3 font-bold text-white text-base" style={{ background: d.accentColor }}>
            <span>{t.amountDue}</span><span>{d.currency} {d.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes + footer */}
      <div className="px-10 py-6 space-y-3">
        {d.notes && (
          <div className="text-sm text-gray-600 border border-gray-200 rounded-lg p-4">
            <p className="mb-1 font-semibold text-gray-700 text-xs uppercase tracking-wider">{t.notes}</p>
            <p className="whitespace-pre-line">{d.notes}</p>
          </div>
        )}
        <p className="text-center text-xs text-gray-400">{t.thankYou}</p>
        <ContactFooter d={d} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Renderer
// ─────────────────────────────────────────────
export function TemplateRenderer({ templateId, data }: { templateId: TemplateId; data: TemplateData }) {
  switch (templateId) {
    case 'classic':     return <ClassicTemplate    {...data} />
    case 'modern':      return <ModernTemplate     {...data} />
    case 'minimal':     return <MinimalTemplate    {...data} />
    case 'bold':        return <BoldTemplate       {...data} />
    case 'stripe':      return <StripeTemplate     {...data} />
    case 'ruled':       return <RuledTemplate      {...data} />
    case 'corporate':   return <CorporateTemplate  {...data} />
    default:            return <ModernTemplate     {...data} />
  }
}
