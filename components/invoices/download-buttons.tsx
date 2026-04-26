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
   * We use html-to-image (foreignObject / SVG approach) instead of
   * html2canvas because it lets the browser render the actual HTML —
   * so fonts (Plus Jakarta Sans), oklch colors, gradients, and shadows
   * all look identical to what the user sees on screen.
   */
  async function captureJpeg(el: HTMLElement): Promise<string> {
    const { toJpeg } = await import('html-to-image')

    // Force A4 width so the export is always 794 px wide regardless of
    // the current viewport size (e.g. narrow mobile screen).
    const prev = { width: el.style.width, maxWidth: el.style.maxWidth, minWidth: el.style.minWidth }
    el.style.width    = `${A4_WIDTH_PX}px`
    el.style.maxWidth = `${A4_WIDTH_PX}px`
    el.style.minWidth = `${A4_WIDTH_PX}px`

    // Wait for all web fonts to be loaded before rendering.
    await document.fonts.ready

    try {
      // html-to-image renders the live browser layout into an SVG
      // foreignObject and converts it to a canvas.  Because the browser
      // does the rendering, every CSS feature (oklch, custom properties,
      // web fonts, gradients, shadows) works out of the box.
      //
      // We call toJpeg twice: the first call embeds external resources
      // (fonts, images) into the clone; the second call produces the
      // final pixel-correct output.  This is the recommended pattern in
      // the html-to-image docs for cross-origin resources.
      await toJpeg(el, { quality: 0.95, pixelRatio: PIXEL_RATIO, cacheBust: true })
      return await toJpeg(el, { quality: 0.95, pixelRatio: PIXEL_RATIO, cacheBust: true })
    } finally {
      el.style.width    = prev.width
      el.style.maxWidth = prev.maxWidth
      el.style.minWidth = prev.minWidth
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

      // Load the image to get natural pixel dimensions.
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image()
        i.onload = () => res(i)
        i.onerror = rej
        i.src = dataUrl
      })

      const { jsPDF } = await import('jspdf')
      // The image is A4_WIDTH_PX * PIXEL_RATIO wide.
      // Map proportionally to A4 width (210mm) to get the PDF page height.
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
