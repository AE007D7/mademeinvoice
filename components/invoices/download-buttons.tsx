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
   * Capture the invoice element as a JPEG data-URL.
   *
   * We capture the live `.invoice-print-area` element directly so that all
   * CSS positioning contexts (absolute children, overflow-hidden clipping) are
   * preserved exactly as they appear on screen.
   *
   * Before capture we override the wrapper's decorative inline styles — the
   * `mx-auto` margin and `ring`/`shadow`/`rounded-xl` classes — because these
   * can skew html-to-image's SVG-foreignObject canvas boundary, producing
   * blank left-side space.  All overrides are restored after capture.
   */
  async function captureJpeg(el: HTMLElement): Promise<string> {
    const { toJpeg } = await import('html-to-image')

    const saved = {
      width:        el.style.width,
      minWidth:     el.style.minWidth,
      maxWidth:     el.style.maxWidth,
      margin:       el.style.margin,
      marginLeft:   el.style.marginLeft,
      marginRight:  el.style.marginRight,
      boxShadow:    el.style.boxShadow,
      outline:      el.style.outline,
      borderRadius: el.style.borderRadius,
    }

    el.style.width        = `${A4_WIDTH_PX}px`
    el.style.minWidth     = `${A4_WIDTH_PX}px`
    el.style.maxWidth     = `${A4_WIDTH_PX}px`
    el.style.margin       = '0'
    el.style.marginLeft   = '0'
    el.style.marginRight  = '0'
    el.style.boxShadow    = 'none'
    el.style.outline      = 'none'
    el.style.borderRadius = '0'

    await document.fonts.ready

    try {
      // Double-call: first pass lets html-to-image embed cross-origin resources
      // (web fonts, Supabase-signed image URLs); second pass is the final output.
      await toJpeg(el, { quality: 0.95, pixelRatio: PIXEL_RATIO, cacheBust: true })
      return await toJpeg(el, { quality: 0.95, pixelRatio: PIXEL_RATIO, cacheBust: true })
    } finally {
      Object.assign(el.style, saved)
    }
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
      // Page height matches invoice content height so nothing is clipped.
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
        <Button variant="outline" size="sm" onClick={downloadPdf} disabled={loadingPdf} className="gap-1.5">
          <FileDown className="h-3.5 w-3.5" />
          {loadingPdf ? 'Saving…' : 'Save PDF'}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
