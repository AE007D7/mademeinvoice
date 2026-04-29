'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { ChatPanel } from './ChatPanel'

export function FloatingChatButton() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Don't show the button when already on the full chat page
  if (pathname === '/chat') return null

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 group">
        {/* Tooltip */}
        <span className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100">
          Make Invoice with AI
        </span>

        {/* Button */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Make invoice with AI"
          className="chat-pulse flex h-14 w-14 items-center justify-center rounded-full gradient-primary shadow-lg transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Sparkles className="h-6 w-6 text-white" />
        </button>
      </div>

      {open && <ChatPanel onClose={() => setOpen(false)} />}
    </>
  )
}
