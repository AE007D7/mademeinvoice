'use client'

import { Check } from 'lucide-react'

export const PALETTE = [
  { label: 'Indigo',  value: '#6366f1' },
  { label: 'Violet',  value: '#8b5cf6' },
  { label: 'Rose',    value: '#f43f5e' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Amber',   value: '#f59e0b' },
  { label: 'Slate',   value: '#475569' },
]

type Props = {
  value: string
  onChange: (color: string) => void
}

export default function ColorSelector({ value, onChange }: Props) {
  const isPreset = PALETTE.some((p) => p.value === value)

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">Accent Color</p>
      <div className="flex items-center gap-2 flex-wrap">
        {PALETTE.map((color) => (
          <button
            key={color.value}
            type="button"
            title={color.label}
            onClick={() => onChange(color.value)}
            className="relative h-7 w-7 rounded-full ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            style={{ background: color.value }}
          >
            {value === color.value && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Check className="h-3.5 w-3.5 text-white drop-shadow" strokeWidth={3} />
              </span>
            )}
            <span className="sr-only">{color.label}</span>
          </button>
        ))}

        {/* Custom color picker */}
        <label
          className="relative h-7 w-7 cursor-pointer rounded-full ring-offset-background transition-all focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
          title="Custom color"
          style={{
            background: isPreset
              ? 'conic-gradient(from 0deg, #f43f5e, #f59e0b, #10b981, #6366f1, #8b5cf6, #f43f5e)'
              : value,
          }}
        >
          {!isPreset && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Check className="h-3.5 w-3.5 text-white drop-shadow" strokeWidth={3} />
            </span>
          )}
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer rounded-full opacity-0"
          />
          <span className="sr-only">Pick custom color</span>
        </label>

        <span
          className="ml-1 rounded-md border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground"
          style={{ borderColor: value, color: value }}
        >
          {value}
        </span>
      </div>
    </div>
  )
}
