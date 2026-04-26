'use client'

import { useState } from 'react'
import { ImageIcon, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

const A4_WIDTH_PX = 794
const PIXEL_RATIO = 2

export function DownloadButtons({ invoiceLabel }: { invoiceLabel: string }) {
  const [loadingJpeg, setLoadingJpeg] = useState(false)
  const [loadingPdf, setLoadingPdf]   = useState(false)
  const [error, setError]             = useState('')

  function getEl(): HTMLElement | null {
    return (
      (document.querySelector('.invoice-print-area') as HTMLElement | null) ??
      document.getElementById('invoice-preview')
    )
  }

  /**
   * Capture the invoice as a JPEG data-URL using html-to-image.
   *
   * ROOT CAUSE OF THE RIGHT-SHIFT / BLACK-BAR BUG
   * ─────────────────────────────────────────────
   * html-to-image copies the element's fully-computed styles onto the clone
   * via getComputedStyle().  `mx-auto` resolves to a concrete pixel value at
   * that instant (e.g. margin-left: 183 px on a 1440 px viewport).  The clone
   * therefore has an explicit left margin, so its content renders that many
   * pixels from the left edge of the fixed-width canvas.  The gap (no HTML
   * there) is transparent in the SVG and shows as solid black in the JPEG.
   *
   * THE FIX
   * ───────
   * Use html-to-image's `style` option.  It is applied to the clone *after*
   * the computed-style copy, so it is the last write and is guaranteed to win.
   * Also pass `backgroundColor` (fills the canvas before drawing) and `width`
   * (locks the canvas to exactly A4 width, bypassing clientWidth).
   */
  async function captureJpeg(el: HTMLElement): Promise<string> {
    const { toJpeg } = await import('html-to-image')
    await document.fonts.ready

    const opts = {
      quality:         0.95,
      pixelRatio:      PIXEL_RATIO,
      cacheBust:       true,
      backgroundColor: '#ffffff',   // fill canvas before drawing → no black gaps
      width:           A4_WIDTH_PX, // canvas = exactly A4 width, bypasses clientWidth
      style: {
        // Applied to the cloned root element after getComputedStyle copy.
        // Sets margin to 0 so the clone is not offset from the canvas edge.
        margin:       '0',
        marginLeft:   '0',
        marginRight:  '0',
        boxShadow:    'none',
        outline:      'none',
        borderRadius: '0',
      } as Partial<CSSStyleDeclaration>,
    }

    // Double-call: first pass lets html-to-image embed cross-origin resources
    // (web fonts, Supabase signed image URLs); second pass is the final output.
    await toJpeg(el, opts)
    return toJpeg(el, opts)
  }

  async function downloadJpeg() {
    setLoadingJpeg(true)
    setError('')
    try {
      const el = getEl()
      if (!el) throw new Error('Invoice element not found.')
      const dataUrl = await captureJpeg(el)
      const a = document.createElement('a')
      a.href     = dataUrl
      a.download = `${invoiceLabel}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed — try Print instead.')
    } finally {
      setLoadingJpeg(false)
    }
  }

  async function downloadPdf() {
    setLoadingPdf(true)
    setError('')
    try {
      const el = getEl()
      if (!el) throw new Error('Invoice element not found.')
      const dataUrl = await captureJpeg(el)

      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image()
        i.onload = () => res(i)
        i.onerror = rej
        i.src = dataUrl
      })

      const { jsPDF } = await import('jspdf')
      // Map the captured image proportionally to A4 width (210 mm).
      const pdfW = 210
      const pdfH = Math.round((img.naturalHeight / img.naturalWidth) * pdfW)
      const pdf  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pdfW, pdfH] })
      pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfW, pdfH)
      pdf.save(`${invoiceLabel}.pdf`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed — try Print instead.')
    } finally {
      setLoadingPdf(false)
    }
  }

  return (
    <div className="print:hidden flex flex-col gap-1">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={downloadJpeg} disabled={loadingJpeg} className="gap-1.5">
          <ImageIcon className="h-3.5 w-3.5" />
          {loadingJpeg ? 'Saving…' : 'Save JPEG'}
        </Button>
        <Button data-pdf-download variant="outline" size="sm" onClick={downloadPdf} disabled={loadingPdf} className="gap-1.5">
          <FileDown className="h-3.5 w-3.5" />
          {loadingPdf ? 'Saving…' : 'Save PDF'}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
