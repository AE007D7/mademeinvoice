'use client'

import { useState } from 'react'
import { ImageIcon, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

const A4_WIDTH_PX = 794

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

  async function captureCanvas(el: HTMLElement) {
    const { default: html2canvas } = await import('html2canvas')

    // Force full A4 width regardless of viewport
    const prev = { width: el.style.width, maxWidth: el.style.maxWidth, minWidth: el.style.minWidth }
    el.style.width = `${A4_WIDTH_PX}px`
    el.style.maxWidth = `${A4_WIDTH_PX}px`
    el.style.minWidth = `${A4_WIDTH_PX}px`

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: A4_WIDTH_PX,
        windowWidth: 1440,
        ignoreElements: (node) => {
          // Skip print:hidden elements (toolbar buttons etc)
          return node instanceof HTMLElement && (
            node.classList.contains('print:hidden') ||
            node.getAttribute('aria-hidden') === 'true'
          )
        },
      })
      return canvas
    } finally {
      el.style.width = prev.width
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
      const canvas = await captureCanvas(el)
      canvas.toBlob(
        (blob) => {
          if (!blob) { setError('Failed to generate image.'); setLoadingJpeg(false); return }
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${invoiceLabel}.jpg`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          setLoadingJpeg(false)
        },
        'image/jpeg',
        0.95,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed — try Print instead.')
      setLoadingJpeg(false)
    }
  }

  async function downloadPdf() {
    setLoadingPdf(true)
    setError('')
    try {
      const el = getEl()
      if (!el) throw new Error('Invoice element not found.')
      const canvas = await captureCanvas(el)
      const { jsPDF } = await import('jspdf')

      // Keep proportional height relative to A4 width (210mm)
      const pdfW = 210
      const pdfH = Math.round((canvas.height / canvas.width) * pdfW)
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pdfW, pdfH] })
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfW, pdfH)
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
