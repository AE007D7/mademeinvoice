'use client'

import { useState } from 'react'
import { ImageIcon, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DownloadButtons({ invoiceLabel }: { invoiceLabel: string }) {
  const [loadingJpeg, setLoadingJpeg] = useState(false)
  const [loadingPdf, setLoadingPdf]   = useState(false)
  const [error, setError]             = useState('')

  function getEl(): HTMLElement | null {
    // Prefer the specific invoice area; fall back to the wrapper id
    return (
      (document.querySelector('.invoice-print-area') as HTMLElement | null) ??
      document.getElementById('invoice-preview')
    )
  }

  async function capture(): Promise<string> {
    const el = getEl()
    if (!el) throw new Error('Invoice element not found.')
    // dom-to-image-more resolves CSS custom properties before rendering
    const { default: domtoimage } = await import('dom-to-image-more')
    return domtoimage.toJpeg(el, {
      quality: 0.95,
      scale: 2,
      bgcolor: '#ffffff',
      // Skip elements that are decorative / hidden for print
      filter: (node: Node) => {
        if (node instanceof HTMLElement) {
          if (node.classList.contains('print:hidden')) return false
          if (node.classList.contains('invoice-watermark')) return true
        }
        return true
      },
    })
  }

  async function downloadJpeg() {
    setLoadingJpeg(true)
    setError('')
    try {
      const dataUrl = await capture()
      const a = document.createElement('a')
      a.href = dataUrl
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
      const dataUrl = await capture()
      const img = new Image()
      await new Promise<void>((res, rej) => {
        img.onload = () => res()
        img.onerror = rej
        img.src = dataUrl
      })
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = (img.naturalHeight * pageW) / img.naturalWidth
      pdf.addImage(dataUrl, 'JPEG', 0, 0, pageW, pageH)
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
