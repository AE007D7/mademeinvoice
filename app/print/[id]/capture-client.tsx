'use client'

import { useEffect } from 'react'

/**
 * Runs inside the /print/[id] iframe.
 * Waits for fonts, then captures the invoice via html-to-image (SVG/foreignObject)
 * in THIS page's own CSS context — where all Tailwind variables and fonts are
 * already resolved — and sends the dataUrl to the parent frame via postMessage.
 *
 * Why this works when direct html2canvas / html-to-image on the dashboard page does not:
 *  • html2canvas clones the element into its own headless iframe where Tailwind's
 *    CSS custom properties (--spacing, --color-*, etc.) are absent → spacing collapses.
 *  • Running html-to-image inside this isolated print page means the SVG/foreignObject
 *    renderer inherits the live, fully-resolved CSS of this page — pixel-perfect output.
 *  • The invoice wrapper is inside a 794 px container, so mx-auto → margin-left: 0 —
 *    no right-shift, no black bar.
 */
export default function CaptureClient() {
  useEffect(() => {
    // Only auto-capture when loaded inside an iframe (not direct browser navigation)
    if (window.self === window.top) return

    async function capture() {
      try {
        // Wait for web fonts
        await document.fonts.ready
        // Small settle time for images / signed URLs
        await new Promise<void>((r) => setTimeout(r, 300))

        const el = document.querySelector('.invoice-print-area') as HTMLElement | null
        if (!el) throw new Error('Invoice element not found.')

        const { toJpeg } = await import('html-to-image')
        const opts = {
          quality:         0.95,
          pixelRatio:      2,
          cacheBust:       true,
          backgroundColor: '#ffffff',
        }

        // First call embeds cross-origin resources (signed image URLs, web fonts).
        // Second call produces the final, resource-embedded output.
        await toJpeg(el, opts)
        const dataUrl = await toJpeg(el, opts)

        window.parent.postMessage({ type: 'invoiceCaptured', dataUrl }, '*')
      } catch (err) {
        window.parent.postMessage({
          type:  'invoiceCaptureFailed',
          error: err instanceof Error ? err.message : String(err),
        }, '*')
      }
    }

    capture()
  }, [])

  return null
}
