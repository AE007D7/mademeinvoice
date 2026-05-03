export const PRO_PLAN = {
  priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PRO!,
  monthlyPrice: 4.99,
  currency: 'EUR',
  trialDays: 7,
  displayName: 'Pro',
} as const

export function formatProPrice(): string {
  return PRO_PLAN.monthlyPrice.toFixed(2).replace('.', ',') + ' €/mois'
}
