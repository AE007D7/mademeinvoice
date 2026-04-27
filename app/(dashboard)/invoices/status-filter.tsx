'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const STATUSES = ['all', 'draft', 'sent', 'paid', 'overdue'] as const

const LABELS: Record<string, string> = {
  all: 'All',
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
}

const COLORS: Record<string, string> = {
  all: 'bg-foreground text-background',
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
}

export function StatusFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('status') ?? 'all'

  function select(status: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (status === 'all') params.delete('status')
    else params.set('status', status)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => select(s)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            current === s ? COLORS[s] : 'bg-muted/60 text-muted-foreground hover:bg-muted'
          }`}
        >
          {LABELS[s]}
        </button>
      ))}
    </div>
  )
}
