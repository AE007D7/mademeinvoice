'use client'

import type { TemplateId } from './invoice-templates'

const TEMPLATES: {
  id: TemplateId
  name: string
  preview: React.ReactNode
}[] = [
  {
    id: 'classic',
    name: 'Classic',
    preview: (
      <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="120" height="160" fill="white" />
        {/* Header area */}
        <rect x="8" y="10" width="40" height="6" rx="2" fill="#e2e8f0" />
        <rect x="76" y="10" width="36" height="8" rx="2" fill="#334155" />
        <rect x="82" y="20" width="24" height="3" rx="1" fill="#94a3b8" />
        <rect x="8" y="22" width="104" height="2.5" rx="1" fill="currentColor" />
        {/* Bill to */}
        <rect x="8" y="30" width="20" height="2.5" rx="1" fill="#e2e8f0" />
        <rect x="8" y="35" width="32" height="3" rx="1" fill="#334155" />
        <rect x="8" y="40" width="24" height="2.5" rx="1" fill="#cbd5e1" />
        {/* Table header */}
        <rect x="8" y="52" width="104" height="0.5" fill="currentColor" opacity="0.4" />
        <rect x="8" y="48" width="50" height="2.5" rx="1" fill="#e2e8f0" />
        <rect x="88" y="48" width="24" height="2.5" rx="1" fill="#e2e8f0" />
        {/* Rows */}
        {[0, 1, 2].map(i => (
          <g key={i}>
            <rect x="8" y={57 + i * 12} width="60" height="2.5" rx="1" fill="#cbd5e1" />
            <rect x="96" y={57 + i * 12} width="16" height="2.5" rx="1" fill="#94a3b8" />
            <rect x="8" y={63 + i * 12} width="112" height="0.5" fill="#f1f5f9" />
          </g>
        ))}
        {/* Totals */}
        <rect x="70" y="98" width="42" height="0.5" fill="#e2e8f0" />
        <rect x="70" y="101" width="20" height="2.5" rx="1" fill="#e2e8f0" />
        <rect x="100" y="101" width="12" height="2.5" rx="1" fill="#94a3b8" />
        <rect x="70" y="107" width="20" height="2.5" rx="1" fill="#334155" fontWeight="bold" />
        <rect x="100" y="107" width="12" height="2.5" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'modern',
    name: 'Modern',
    preview: (
      <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="120" height="160" fill="white" />
        {/* Colored header */}
        <rect width="120" height="40" fill="currentColor" />
        <rect x="8" y="12" width="30" height="4" rx="2" fill="white" opacity="0.8" />
        <rect x="8" y="18" width="18" height="2.5" rx="1" fill="white" opacity="0.5" />
        <rect x="72" y="10" width="40" height="8" rx="2" fill="white" opacity="0.9" />
        <rect x="80" y="21" width="24" height="2.5" rx="1" fill="white" opacity="0.5" />
        {/* Bill to card */}
        <rect x="8" y="46" width="56" height="22" rx="4" fill="#f8fafc" />
        <rect x="12" y="50" width="16" height="2" rx="1" fill="#e2e8f0" />
        <rect x="12" y="54" width="36" height="3" rx="1" fill="#334155" />
        <rect x="12" y="59" width="28" height="2.5" rx="1" fill="#94a3b8" />
        {/* Table */}
        {[0, 1, 2].map(i => (
          <g key={i}>
            <rect x="8" y={76 + i * 10} width="60" height="2.5" rx="1" fill={i % 2 ? '#f8fafc' : 'white'} />
            <rect x="8" y={74 + i * 10} width="104" height="8" rx="0" fill={i % 2 ? '#f8fafc' : 'transparent'} />
            <rect x="8" y={76 + i * 10} width="52" height="2.5" rx="1" fill="#cbd5e1" />
            <rect x="98" y={76 + i * 10} width="14" height="2.5" rx="1" fill="#94a3b8" />
          </g>
        ))}
        {/* Total badge */}
        <rect x="62" y="112" width="50" height="18" rx="6" fill="currentColor" />
        <rect x="66" y="116" width="14" height="3" rx="1" fill="white" opacity="0.7" />
        <rect x="82" y="115" width="26" height="5" rx="1" fill="white" />
      </svg>
    ),
  },
  {
    id: 'minimal',
    name: 'Minimal',
    preview: (
      <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="120" height="160" fill="white" />
        {/* Company name */}
        <rect x="8" y="12" width="50" height="2.5" rx="1" fill="#e2e8f0" />
        {/* Invoice pill */}
        <rect x="88" y="10" width="24" height="7" rx="3.5" fill="currentColor" />
        {/* Divider */}
        <rect x="8" y="24" width="104" height="0.5" fill="#e2e8f0" />
        {/* Client */}
        <rect x="8" y="30" width="36" height="3" rx="1" fill="#334155" />
        <rect x="8" y="35" width="24" height="2.5" rx="1" fill="#cbd5e1" />
        {/* Invoice meta */}
        <rect x="84" y="30" width="28" height="2.5" rx="1" fill="#e2e8f0" />
        <rect x="88" y="35" width="24" height="2.5" rx="1" fill="#e2e8f0" />
        {/* Dashed divider */}
        {[0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104].map(x => (
          <rect key={x} x={x} y="44" width="5" height="0.5" fill="#e2e8f0" />
        ))}
        {/* Items — no borders */}
        {[0, 1, 2, 3].map(i => (
          <g key={i}>
            <rect x="8" y={50 + i * 11} width="52" height="2.5" rx="1" fill="#cbd5e1" />
            <rect x="96" y={50 + i * 11} width="16" height="2.5" rx="1" fill="#94a3b8" />
          </g>
        ))}
        {/* Dashed divider */}
        {[0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104].map(x => (
          <rect key={x} x={x} y="98" width="5" height="0.5" fill="#e2e8f0" />
        ))}
        {/* Totals */}
        <rect x="8" y="103" width="16" height="2.5" rx="1" fill="#e2e8f0" />
        <rect x="96" y="103" width="16" height="2.5" rx="1" fill="#e2e8f0" />
        <rect x="8" y="110" width="14" height="3.5" rx="1" fill="currentColor" />
        <rect x="94" y="110" width="18" height="3.5" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'bold',
    name: 'Bold',
    preview: (
      <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="120" height="160" fill="white" />
        {/* Dark header */}
        <rect width="120" height="50" fill="currentColor" />
        <rect width="120" height="50" fill="black" opacity="0.3" />
        {/* INVOICE large text area */}
        <rect x="8" y="28" width="60" height="10" rx="2" fill="white" opacity="0.9" />
        <rect x="8" y="14" width="24" height="3" rx="1" fill="white" opacity="0.6" />
        <rect x="88" y="13" width="24" height="5" rx="1" fill="white" opacity="0.7" />
        <rect x="92" y="21" width="16" height="2.5" rx="1" fill="white" opacity="0.4" />
        {/* Bill to + amount */}
        <rect x="8" y="58" width="14" height="2" rx="1" fill="#e2e8f0" />
        <rect x="8" y="62" width="44" height="4" rx="1" fill="#334155" />
        <rect x="8" y="68" width="30" height="2.5" rx="1" fill="#94a3b8" />
        {/* Amount due badge */}
        <rect x="66" y="57" width="46" height="16" rx="5" fill="currentColor" />
        <rect x="70" y="61" width="20" height="3" rx="1" fill="white" opacity="0.7" />
        <rect x="70" y="66" width="36" height="4" rx="1" fill="white" />
        {/* Table header */}
        <rect x="8" y="82" width="104" height="1.5" fill="#1e293b" />
        <rect x="8" y="86" width="50" height="2.5" rx="1" fill="#334155" />
        <rect x="8" y="84" width="104" height="1.5" fill="#1e293b" />
        {/* Rows */}
        {[0, 1, 2].map(i => (
          <g key={i}>
            <rect x="8" y={92 + i * 10} width="52" height="2.5" rx="1" fill="#cbd5e1" />
            <rect x="96" y={92 + i * 10} width="16" height="2.5" rx="1" fill="#94a3b8" />
            <rect x="8" y={97.5 + i * 10} width="104" height="0.5" fill="#f1f5f9" />
          </g>
        ))}
        {/* Total */}
        <rect x="70" y="128" width="42" height="1.5" fill="#1e293b" />
        <rect x="70" y="132" width="18" height="3.5" rx="1" fill="#334155" />
        <rect x="96" y="131" width="16" height="4" rx="1" fill="#334155" />
      </svg>
    ),
  },
  {
    id: 'stripe',
    name: 'Stripe',
    preview: (
      <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="120" height="160" fill="white" />
        {/* Left accent stripe */}
        <rect x="0" y="0" width="9" height="160" fill="currentColor" />
        {/* Company name */}
        <rect x="16" y="12" width="40" height="4" rx="2" fill="#334155" />
        <rect x="16" y="19" width="28" height="2.5" rx="1" fill="#94a3b8" />
        {/* Invoice label */}
        <rect x="80" y="11" width="32" height="5" rx="1" fill="currentColor" opacity="0.15" />
        <rect x="82" y="12.5" width="28" height="2.5" rx="1" fill="currentColor" />
        <rect x="82" y="19" width="20" height="2" rx="1" fill="#94a3b8" />
        {/* Divider */}
        <rect x="16" y="28" width="96" height="0.5" fill="#e2e8f0" />
        {/* Bill to label */}
        <rect x="16" y="33" width="18" height="2" rx="1" fill="currentColor" />
        <rect x="16" y="37" width="36" height="3" rx="1" fill="#334155" />
        <rect x="16" y="42" width="26" height="2" rx="1" fill="#94a3b8" />
        {/* Table header */}
        <rect x="16" y="54" width="96" height="0.5" fill="#e2e8f0" />
        <rect x="16" y="50" width="40" height="2.5" rx="1" fill="#e2e8f0" />
        <rect x="94" y="50" width="18" height="2.5" rx="1" fill="#e2e8f0" />
        <rect x="16" y="57" width="96" height="0.5" fill="#e2e8f0" />
        {/* Rows */}
        {[0, 1, 2].map(i => (
          <g key={i}>
            <rect x="16" y={63 + i * 11} width="52" height="2.5" rx="1" fill="#cbd5e1" />
            <rect x="96" y={63 + i * 11} width="16" height="2.5" rx="1" fill="#94a3b8" />
            <rect x="16" y={68 + i * 11} width="96" height="0.5" fill="#f1f5f9" />
          </g>
        ))}
        {/* Totals */}
        <rect x="72" y="102" width="40" height="0.5" fill="#e2e8f0" />
        <rect x="72" y="105" width="18" height="2.5" rx="1" fill="#e2e8f0" />
        <rect x="98" y="105" width="14" height="2.5" rx="1" fill="#94a3b8" />
        <rect x="72" y="111" width="18" height="3" rx="1" fill="currentColor" opacity="0.15" />
        <rect x="98" y="110" width="14" height="4" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'ruled',
    name: 'Ruled',
    preview: (
      <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="120" height="160" fill="white" />
        {/* Top accent bar */}
        <rect x="0" y="0" width="120" height="5" fill="currentColor" />
        {/* Company name */}
        <rect x="8" y="12" width="40" height="4" rx="2" fill="#334155" />
        <rect x="8" y="18" width="28" height="2.5" rx="1" fill="#94a3b8" />
        {/* Invoice # right */}
        <rect x="82" y="12" width="30" height="5" rx="1" fill="#334155" />
        <rect x="84" y="20" width="22" height="2" rx="1" fill="#94a3b8" />
        {/* Double border header bottom */}
        <rect x="8" y="27" width="104" height="1" fill="#cbd5e1" />
        <rect x="8" y="29.5" width="104" height="0.5" fill="currentColor" opacity="0.4" />
        {/* Bill to */}
        <rect x="8" y="35" width="16" height="2" rx="1" fill="#e2e8f0" />
        <rect x="8" y="39" width="38" height="3" rx="1" fill="#334155" />
        <rect x="8" y="44" width="26" height="2" rx="1" fill="#94a3b8" />
        {/* Table header row */}
        <rect x="8" y="56" width="104" height="7" fill="#f8fafc" />
        <rect x="8" y="56" width="104" height="0.5" fill="#cbd5e1" />
        <rect x="12" y="58.5" width="40" height="2" rx="1" fill="#e2e8f0" />
        <rect x="96" y="58.5" width="14" height="2" rx="1" fill="#e2e8f0" />
        <rect x="8" y="63" width="104" height="0.5" fill="#cbd5e1" />
        {/* Ruled rows */}
        {[0, 1, 2, 3].map(i => (
          <g key={i}>
            <rect x="12" y={68 + i * 10} width="50" height="2.5" rx="1" fill="#cbd5e1" />
            <rect x="96" y={68 + i * 10} width="16" height="2.5" rx="1" fill="#94a3b8" />
            <rect x="8" y={73 + i * 10} width="104" height="0.5" fill="#e2e8f0" />
          </g>
        ))}
        {/* Totals */}
        <rect x="70" y="114" width="42" height="1" fill="#94a3b8" />
        <rect x="72" y="117" width="18" height="2.5" rx="1" fill="#e2e8f0" />
        <rect x="98" y="117" width="14" height="2.5" rx="1" fill="#94a3b8" />
        <rect x="70" y="122" width="42" height="8" rx="2" fill="currentColor" opacity="0.1" />
        <rect x="72" y="124.5" width="18" height="3" rx="1" fill="currentColor" />
        <rect x="98" y="124" width="14" height="4" rx="1" fill="currentColor" />
        {/* Bottom accent bar */}
        <rect x="0" y="155" width="120" height="5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'corporate',
    name: 'Corporate',
    preview: (
      <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="120" height="160" fill="white" />
        {/* Full header band */}
        <rect width="120" height="36" fill="currentColor" />
        <rect x="8" y="10" width="34" height="5" rx="2" fill="white" opacity="0.9" />
        <rect x="8" y="17" width="22" height="2.5" rx="1" fill="white" opacity="0.5" />
        <rect x="78" y="9" width="34" height="7" rx="2" fill="white" opacity="0.15" />
        <rect x="80" y="10.5" width="30" height="4" rx="1" fill="white" opacity="0.9" />
        <rect x="84" y="17" width="22" height="2" rx="1" fill="white" opacity="0.5" />
        {/* 3-column info grid */}
        <rect x="8" y="40" width="33" height="18" rx="2" fill="#f8fafc" />
        <rect x="10" y="42" width="14" height="2" rx="1" fill="currentColor" opacity="0.5" />
        <rect x="10" y="46" width="26" height="2.5" rx="1" fill="#334155" />
        <rect x="10" y="50" width="20" height="2" rx="1" fill="#94a3b8" />
        <rect x="44" y="40" width="33" height="18" rx="2" fill="#f8fafc" />
        <rect x="46" y="42" width="14" height="2" rx="1" fill="currentColor" opacity="0.5" />
        <rect x="46" y="46" width="26" height="2.5" rx="1" fill="#334155" />
        <rect x="46" y="50" width="20" height="2" rx="1" fill="#94a3b8" />
        <rect x="80" y="40" width="32" height="18" rx="2" fill="#f8fafc" />
        <rect x="82" y="42" width="14" height="2" rx="1" fill="currentColor" opacity="0.5" />
        <rect x="82" y="46" width="24" height="2.5" rx="1" fill="#334155" />
        <rect x="82" y="50" width="18" height="2" rx="1" fill="#94a3b8" />
        {/* Grid-lined table */}
        <rect x="8" y="63" width="104" height="7" fill="currentColor" opacity="0.08" />
        <rect x="8" y="63" width="104" height="0.5" fill="currentColor" opacity="0.3" />
        <rect x="10" y="65.5" width="50" height="2" rx="1" fill="currentColor" opacity="0.5" />
        <rect x="100" y="65.5" width="10" height="2" rx="1" fill="currentColor" opacity="0.5" />
        <rect x="8" y="70" width="104" height="0.5" fill="currentColor" opacity="0.3" />
        {/* Vertical column dividers */}
        <rect x="90" y="63" width="0.5" height="57" fill="#e2e8f0" />
        {/* Rows */}
        {[0, 1, 2, 3].map(i => (
          <g key={i}>
            <rect x="10" y={75 + i * 9} width="48" height="2.5" rx="1" fill="#cbd5e1" />
            <rect x="92" y={75 + i * 9} width="18" height="2.5" rx="1" fill="#94a3b8" />
            <rect x="8" y={80 + i * 9} width="104" height="0.5" fill="#e2e8f0" />
          </g>
        ))}
        {/* Total footer */}
        <rect x="8" y="120" width="104" height="14" fill="currentColor" opacity="0.08" />
        <rect x="8" y="120" width="104" height="0.5" fill="currentColor" opacity="0.4" />
        <rect x="12" y="124" width="22" height="3" rx="1" fill="currentColor" />
        <rect x="94" y="123" width="16" height="5" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'letterhead',
    name: 'Letterhead',
    preview: (
      <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="120" height="160" fill="white" />
        {/* Letterhead image placeholder */}
        <rect width="120" height="42" fill="#f1f5f9" />
        <rect x="8" y="8" width="50" height="6" rx="2" fill="#e2e8f0" />
        <rect x="8" y="17" width="36" height="3" rx="1" fill="#e2e8f0" />
        <rect x="8" y="23" width="28" height="2.5" rx="1" fill="#e2e8f0" />
        <rect x="76" y="10" width="36" height="20" rx="3" fill="#e2e8f0" />
        {/* Image icon in placeholder */}
        <circle cx="94" cy="20" r="5" fill="#cbd5e1" />
        <rect x="8" y="34" width="104" height="0.5" fill="#94a3b8" opacity="0.5" />
        {/* Invoice number line */}
        <rect x="8" y="48" width="30" height="4" rx="1" fill="#334155" />
        <rect x="82" y="49" width="30" height="2.5" rx="1" fill="#cbd5e1" />
        <rect x="8" y="56" width="104" height="0.5" fill="#e2e8f0" />
        {/* Bill to */}
        <rect x="8" y="62" width="14" height="2" rx="1" fill="#94a3b8" />
        <rect x="8" y="67" width="32" height="3" rx="1" fill="#334155" />
        <rect x="8" y="73" width="24" height="2.5" rx="1" fill="#cbd5e1" />
        <rect x="8" y="80" width="104" height="0.5" fill="#e2e8f0" />
        {/* Table header */}
        <rect x="8" y="86" width="52" height="2" rx="1" fill="#94a3b8" />
        <rect x="96" y="86" width="16" height="2" rx="1" fill="#94a3b8" />
        <rect x="8" y="91" width="104" height="1" fill="#334155" opacity="0.6" />
        {/* Clean rows */}
        {[0, 1, 2].map(i => (
          <g key={i}>
            <rect x="8" y={96 + i * 9} width="48" height="2.5" rx="1" fill="#e2e8f0" />
            <rect x="96" y={96 + i * 9} width="16" height="2.5" rx="1" fill="#cbd5e1" />
            <rect x="8" y={101 + i * 9} width="104" height="0.5" fill="#f1f5f9" />
          </g>
        ))}
        {/* Total */}
        <rect x="74" y="130" width="38" height="0.5" fill="#334155" opacity="0.6" />
        <rect x="74" y="134" width="20" height="3" rx="1" fill="#334155" />
        <rect x="96" y="133" width="16" height="5" rx="1" fill="#334155" />
      </svg>
    ),
  },
]

type Props = {
  value: TemplateId
  onChange: (id: TemplateId) => void
  accentColor: string
}

export default function TemplateSelector({ value, onChange, accentColor }: Props) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">Template</p>
      <div className="grid grid-cols-4 gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`group relative rounded-lg border-2 overflow-hidden transition-all ${
              value === t.id
                ? 'border-primary shadow-md shadow-primary/20'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <div
              className="aspect-[3/4] w-full"
              style={{ color: accentColor }}
            >
              {t.preview}
            </div>
            <div
              className={`py-1 text-center text-[10px] font-semibold transition-colors ${
                value === t.id ? 'bg-primary text-white' : 'bg-muted/60 text-muted-foreground group-hover:text-foreground'
              }`}
            >
              {t.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
