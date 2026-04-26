'use client'

import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  shareToken?: string | null
  clientEmail?: string | null
  clientName?: string | null
  invoiceNumber: string
  invoiceTotal: number
  invoiceCurrency: string
  companyName: string
}

export function SendEmailButton({
  shareToken,
  clientEmail,
  clientName,
  invoiceNumber,
  invoiceTotal,
  invoiceCurrency,
  companyName,
}: Props) {
  function handleClick() {
    // 1. Trigger the PDF download so the user has the file ready to attach.
    const pdfBtn = document.querySelector('[data-pdf-download]') as HTMLButtonElement | null
    if (pdfBtn && !pdfBtn.disabled) pdfBtn.click()

    // 2. Build the public (no-auth) invoice link from the share token.
    const publicUrl = shareToken
      ? `${window.location.origin}/invoice/${shareToken}`
      : window.location.href

    // 3. Build a French email body — encodeURIComponent handles all special chars.
    const name    = clientName ?? ''
    const total   = invoiceTotal.toFixed(2)
    const subject = encodeURIComponent(`Facture ${invoiceNumber} - ${companyName}`)
    const body    = encodeURIComponent(
      `Bonjour ${name},\n\n` +
      `Veuillez trouver ci-joint la facture ${invoiceNumber} d'un montant de ${total} ${invoiceCurrency}.\n\n` +
      `Vous pouvez consulter et télécharger la facture ici :\n${publicUrl}\n\n` +
      `N'hésitez pas à me contacter pour toute question.\n\n` +
      `Cordialement,\n${companyName}`
    )
    const to = clientEmail ? encodeURIComponent(clientEmail) : ''

    // 4. Open the user's default email client.
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button variant="outline" size="sm" onClick={handleClick} className="gap-1.5">
        <Mail className="h-3.5 w-3.5" />
        Envoyer par email
      </Button>
      <p className="text-xs text-muted-foreground max-w-xs leading-snug">
        Votre client email s&apos;ouvrira avec le message pré-rempli. Le PDF sera
        téléchargé — vous pourrez le joindre si besoin.
      </p>
    </div>
  )
}
