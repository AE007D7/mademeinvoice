'use client'

import { useState } from 'react'
import { ImageIcon, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * How export works (why previous approaches failed):
 *
 * html2canvas clones the DOM into its own headless iframe. That iframe does not
 * inherit Tailwind v4's CSS custom properties (--spacing, --color-*, etc.) so
 * every calc(var(--spacing) * N) resolves to 0 → all padding/gap collapses.
 *
 * html-to-image (SVG/foreignObject) uses the browser's native CSS engine, so
 * custom properties work — BUT it bakes getComputedStyle() values into the clone.
 * On a wide desktop viewport, mx-auto resolves to e.g. margin-left:595px which
 * is copied into the clone, shifting content right and leaving a black gap.
 *
 * THE SOLUTION: load /print/[id] in a hidden same-origin iframe.
 *   • The print page renders the invoice inside a 794 px container, so mx-auto → 0.
 *   • html-to-image runs INSIDE that iframe (full CSS loaded) via CaptureClient.
 *   • CaptureClient posts the finished dataUrl back via postMessage.
 *   • We receive it here and trigger the download — zero custom rendering logic.
 *
 * Result: exported JPEG/PDF is pixel-for-pixel identical to the browser preview.
 */

export function DownloadButtons({ invoiceLabel, invoiceId }: { invoiceLabel: string; invoiceId: string }) {
  const [loadingJpeg, setLoadingJpeg] = useState(false)
  const [loadingPdf, setLoadingPdf]   = useState(false)
  const [error, setError]             = useState('')

  function captureViaIframe(): Promise<string> {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe')
      iframe.style.cssText =
        'position:fixed;top:0;left:-9999px;width:794px;height:1px;border:none;' +
        'opacity:0;pointer-events:none;z-index:-1;'
      document.body.appendChild(iframe)

      const cleanup = () => {
        window.removeEventListener('message', handler)
        if (document.body.contains(iframe)) document.body.removeChild(iframe)
      }

      const timer = setTimeout(() => {
        cleanup()
        reject(new Error('Export timed out — please try again.'))
      }, 45_000)

      function handler(e: MessageEvent) {
        if (e.data?.type === 'invoiceCaptured') {
          clearTimeout(timer)
          cleanup()
          resolve(e.data.dataUrl as string)
        } else if (e.data?.type === 'invoiceCaptureFailed') {
          clearTimeout(timer)
          cleanup()
          reject(new Error(e.data.error ?? 'Capture failed.'))
        }
      }

      window.addEventListener('message', handler)
      iframe.src = `/print/${invoiceId}`
    })
  }

  async function downloadJpeg() {
    setLoadingJpeg(true)
    setError('')
    try {
      const dataUrl = await captureViaIframe()
      const a = document.createElement('a')
      a.href     = dataUrl
      a.download = `${invoiceLabel}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
    } finally {
      setLoadingJpeg(false)
    }
  }

  async function downloadPdf() {
    setLoadingPdf(true)
    setError('')
    try {
      const dataUrl = await captureViaIframe()

      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image()
        i.onload  = () => res(i)
        i.onerror = rej
        i.src     = dataUrl
      })

      const { jsPDF } = await import('jspdf')
      const pdfW = 210
      const pdfH = Math.round((img.naturalHeight / img.naturalWidth) * pdfW)
      const pdf  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pdfW, pdfH] })
      pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfW, pdfH)
      pdf.save(`${invoiceLabel}.pdf`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
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
