'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LANGUAGES, type LangCode } from '@/lib/i18n'
import { setUiLanguage } from '@/app/actions/language'
import { Globe } from 'lucide-react'

type Props = {
  current: LangCode
  label?: string
}

export default function LanguageSwitcher({ current, label }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const lang = e.target.value as LangCode
    startTransition(async () => {
      await setUiLanguage(lang)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <div className="relative flex items-center">
        <Globe className="pointer-events-none absolute left-2 h-3.5 w-3.5 text-muted-foreground" />
        <select
          value={current}
          onChange={handleChange}
          disabled={isPending}
          className="h-8 w-full appearance-none rounded-lg border border-input bg-background py-0 pl-7 pr-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
