'use client'

import { useState } from 'react'
import { US_STATES, getTaxRate } from '@/lib/taxes'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = {
  value: number
  onChange: (rate: number) => void
}

type Mode = 'us-state' | 'custom'

export default function TaxSelector({ value, onChange }: Props) {
  const [mode, setMode] = useState<Mode>('us-state')
  const [selectedState, setSelectedState] = useState('')

  function handleStateChange(code: string) {
    setSelectedState(code)
    onChange(code ? getTaxRate(code) : 0)
  }

  function handleCustomChange(val: string) {
    const rate = parseFloat(val)
    onChange(isNaN(rate) ? 0 : Math.max(0, Math.min(100, rate)))
  }

  return (
    <div className="space-y-3">
      <Label>Tax</Label>

      {/* Toggle */}
      <div className="inline-flex rounded-lg border border-border bg-muted p-0.5">
        {(['us-state', 'custom'] as Mode[]).map((m) => (
          <Button
            key={m}
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setMode(m)}
            className={cn(
              'rounded-md text-xs capitalize',
              mode === m && 'bg-background text-foreground shadow-sm'
            )}
          >
            {m === 'us-state' ? 'US State' : 'Custom %'}
          </Button>
        ))}
      </div>

      {mode === 'us-state' ? (
        <div className="flex items-center gap-3">
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="h-8 rounded-md border border-border bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select state</option>
            {US_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name} ({getTaxRate(s.code)}%)
              </option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground">
            {value > 0 ? `${value}%` : '0%'}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="0.00"
            value={value || ''}
            onChange={(e) => handleCustomChange(e.target.value)}
            className="w-28"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      )}
    </div>
  )
}
