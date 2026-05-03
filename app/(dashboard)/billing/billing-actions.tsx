'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cancelSubscriptionAction, deleteAccountAction, getPaddlePortalAction } from '@/app/actions/billing'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

export function CancelSubscriptionButton() {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const router = useRouter()

  function handleCancel() {
    if (!confirm('Annuler votre abonnement Pro ? Vous conserverez l\'accès jusqu\'à la fin de la période en cours.')) return
    startTransition(async () => {
      await cancelSubscriptionAction()
      setDone(true)
      router.refresh()
    })
  }

  if (done) return <p className="text-sm text-muted-foreground">Abonnement annulé. Vous conservez l&apos;accès Pro jusqu&apos;à la fin de la période.</p>
  return (
    <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isPending} className="text-muted-foreground hover:text-destructive">
      {isPending ? 'Annulation…' : 'Annuler mon abonnement'}
    </Button>
  )
}

export function PaddlePortalButton() {
  const [isPending, setIsPending] = useState(false)

  async function handleClick() {
    setIsPending(true)
    const url = await getPaddlePortalAction()
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
    setIsPending(false)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={isPending} className="gap-1.5">
      <ExternalLink className="h-3.5 w-3.5" />
      {isPending ? 'Chargement…' : 'Gérer mon abonnement'}
    </Button>
  )
}

export function DeleteAccountButton() {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Supprimer définitivement votre compte ? Cette action est irréversible.')) return
    startTransition(async () => {
      await deleteAccountAction()
    })
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
      {isPending ? 'Suppression…' : 'Supprimer mon compte'}
    </Button>
  )
}
