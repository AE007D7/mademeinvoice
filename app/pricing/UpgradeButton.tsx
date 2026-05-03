'use client'

import Link from 'next/link'

export default function UpgradeButton() {
  return (
    <Link
      href="/billing"
      className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
    >
      Passer à Pro
    </Link>
  )
}
