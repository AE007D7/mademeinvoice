'use client'

import { useState } from 'react'
import { ImageIcon, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

const A4_WIDTH_PX  = 794
const A4_HEIGHT_PX = 1123   // A4 at 96 dpi
const PIXEL_RATIO  = 2

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
   * Clone the invoice HTML into a clean off-screen proxy div.
   *
   * We deliberately avoid capturing the live `.invoice-print-area` wrapper
   * because its `mx-auto` margin and `ring-1` / `shadow-sm` decorations can
   * shift the canvas origin inside html-to-image's SVG foreignObject context,
   * producing blank left-side space (content appears to the right).
   *
   * The proxy sits at `left: -9999px` so it is rendered by the browser (layout
   * is live) but completely invisible.  All Tailwind classes resolve correctly
   * because the proxy is still part of the same document and stylesheet.
   */
  async function buildProxy(el: HTMLElement): Promise<HTMLElement> {
    const proxy = document.createElement('div')
    proxy.style.cssText = [
      'position:absolute',
      'top:0',
      'left:-9999px',
      `width:${A4_WIDTH_PX}px`,
      `min-width:${A4_WIDTH_PX}px`,
      `max-width:${A4_WIDTH_PX}px`,
      `min-height:${A4_HEIGHT_PX}px`,
      'background:#ffffff',
      'overflow:visible',
    ].join(';')
    proxy.innerHTML = el.innerHTML
    document.body.appendChild(proxy)
    return proxy
  }

  async function captureJpeg(proxy: HTMLElement): Promise<string> {
    const { toJpeg } = await import('html-to-image')
    await document.fonts.ready
    // Double-call: first pass embeds cross-origin resources (fonts, signed
    // image URLs); second pass produces the final pixel-correct output.
    await toJpeg(proxy, { quality: 0.95, pixelRatio: PIXEL_RATIO, cacheBust: true })
    return toJpeg(proxy, { quality: 0.95, pixelRatio: PIXEL_RATIO, cacheBust: true })
  }

  async function downloadJpeg() {
    setLoadingJpeg(true)
    setError('')
    let proxy: HTMLElement | null = null
    try {
      const el = getEl()
      if (!el) throw new Error('Invoice element not found.')
      proxy = await buildProxy(el)
      const dataUrl = await captureJpeg(proxy)
      const a = document.createElement('a')
      a.href     = dataUrl
      a.download = `${invoiceLabel}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed — try Print instead.')
    } finally {
      if (proxy) document.body.removeChild(proxy)
      setLoadingJpeg(false)
    }
  }

  async function downloadPdf() {
    setLoadingPdf(true)
    setError('')
    let proxy: HTMLElement | null = null
    try {
      const el = getEl()
      if (!el) throw new Error('Invoice element not found.')
      proxy = await buildProxy(el)
      const dataUrl = await captureJpeg(proxy)

      // Load the image to get natural pixel dimensions.
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image()
        i.onload = () => res(i)
        i.onerror = rej
        i.src = dataUrl
      })

      const { jsPDF } = await import('jspdf')
      // Map the captured image proportionally onto A4 width (210 mm).
      // Page height matches the invoice content height so nothing is clipped.
      const pdfW = 210
      const pdfH = Math.round((img.naturalHeight / img.naturalWidth) * pdfW)
      const pdf  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pdfW, pdfH] })
      pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfW, pdfH)
      pdf.save(`${invoiceLabel}.pdf`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed — try Print instead.')
    } finally {
      if (proxy) document.body.removeChild(proxy)
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
