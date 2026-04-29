'use client'

import { useEffect, useRef } from 'react'
import { X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ChatInterface from '@/components/chat/chat-interface'

type Props = {
  onClose: () => void
}

export function ChatPanel({ onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative flex h-full w-full flex-col bg-background shadow-2xl sm:w-[420px]"
        style={{ animation: 'slideInRight 0.2s ease-out' }}
      >
        {/* Panel header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Make Invoice with AI</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat content */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface compact />
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}
