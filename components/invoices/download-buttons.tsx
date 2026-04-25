'use client'

import { useState } from 'react'
import { Download, ImageIcon, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DownloadButtons({ invoiceLabel }: { invoiceLabel: string }) {
  const [loadingJpeg, setLoadingJpeg] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)

  async function getCanvas() {
    const el = document.getElementById('invoice-preview')
    if (!el) throw new Error('Invoice element not found')
    const { default: html2canvas } = await import('html2canvas')
    return html2canvas(el, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' })
  }

  async function downloadJpeg() {
    setLoadingJpeg(true)
    try {
      const canvas = await getCanvas()
      const link = document.createElement('a')
      link.download = `${invoiceLabel}.jpg`
      link.href = canvas.toDataURL('image/jpeg', 0.92)
      link.click()
    } finally {
      setLoadingJpeg(false)
    }
  }

  async function downloadPdf() {
    setLoadingPdf(true)
    try {
      const canvas = await getCanvas()
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = (canvas.height * pageW) / canvas.width
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pageW, pageH)
      pdf.save(`${invoiceLabel}.pdf`)
    } finally {
      setLoadingPdf(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={downloadJpeg} disabled={loadingJpeg} className="gap-1.5 print:hidden">
        <ImageIcon className="h-3.5 w-3.5" />
        {loadingJpeg ? 'Saving…' : 'Save JPEG'}
      </Button>
      <Button variant="outline" size="sm" onClick={downloadPdf} disabled={loadingPdf} className="gap-1.5 print:hidden">
        <FileDown className="h-3.5 w-3.5" />
        {loadingPdf ? 'Saving…' : 'Save PDF'}
      </Button>
    </>
  )
}
