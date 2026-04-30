'use client'

import { useRef, useState, useCallback } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { saveStampPosition, saveWatermarkVisibility } from '@/app/actions/invoices'

type Props = {
  invoiceId: string
  stampUrl: string | null
  initialX: number       // percentage 0-100
  initialY: number       // percentage 0-100
  initialShowWatermark: boolean
  hasWatermark: boolean
  children: React.ReactNode
}

export default function InvoiceOverlay({
  invoiceId,
  stampUrl,
  initialX,
  initialY,
  initialShowWatermark,
  hasWatermark,
  children,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: initialX, y: initialY })
  const [showWatermark, setShowWatermark] = useState(initialShowWatermark)
  const dragging = useRef(false)
  const savedPos = useRef({ x: initialX, y: initialY })

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLImageElement>) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragging.current = true
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLImageElement>) => {
    if (!dragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.min(95, Math.max(5, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.min(95, Math.max(5, ((e.clientY - rect.top) / rect.height) * 100))
    setPos({ x, y })
    savedPos.current = { x, y }
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLImageElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    dragging.current = false
    saveStampPosition(invoiceId, savedPos.current.x, savedPos.current.y)
  }, [invoiceId])

  const toggleWatermark = useCallback(() => {
    const next = !showWatermark
    setShowWatermark(next)
    saveWatermarkVisibility(invoiceId, next)
  }, [showWatermark, invoiceId])

  const showControls = stampUrl || hasWatermark

  return (
    <div>
      {showControls && (
        <div className="print:hidden mb-2 flex items-center gap-3">
          {stampUrl && (
            <span className="text-xs text-muted-foreground">Drag stamp to reposition</span>
          )}
          {hasWatermark && (
            <button
              type="button"
              onClick={toggleWatermark}
              className="ml-auto flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              {showWatermark ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
              {showWatermark ? 'Hide watermark' : 'Show watermark'}
            </button>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className="relative"
        {...(!showWatermark ? { 'data-hide-watermark': '' } : {})}
      >
        {children}

        {stampUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={stampUrl}
            alt=""
            className="pointer-events-auto absolute select-none cursor-grab active:cursor-grabbing print:pointer-events-none"
            style={{
              left: `calc(${pos.x}% - 65px)`,
              top: `calc(${pos.y}% - 65px)`,
              width: 130,
              height: 130,
              objectFit: 'contain',
              opacity: 0.85,
              transform: 'rotate(-10deg)',
              zIndex: 20,
              touchAction: 'none',
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
        )}
      </div>
    </div>
  )
}
