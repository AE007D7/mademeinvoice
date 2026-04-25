export type PayPalSubscription = {
  id: string
  status: string
  plan_id: string
  billing_info?: {
    next_billing_time?: string
  }
}

function getApiBase(): string {
  return process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

// Module-level token cache — survives across requests in the same serverless instance
let _cachedToken: string | null = null
let _tokenExpiresAt = 0

async function getAccessToken(): Promise<string> {
  if (_cachedToken && Date.now() < _tokenExpiresAt) return _cachedToken

  const clientId = process.env.PAYPAL_CLIENT_ID!
  const secret = process.env.PAYPAL_CLIENT_SECRET!
  const credentials = Buffer.from(`${clientId}:${secret}`).toString('base64')

  const res = await fetch(`${getApiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })

  if (!res.ok) throw new Error(`PayPal token request failed: ${res.status}`)

  const data = (await res.json()) as { access_token: string; expires_in: number }
  _cachedToken = data.access_token
  // Expire 60 s early to avoid using a token right at the edge of expiry
  _tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000
  return _cachedToken
}

// Keep old name for backward compatibility with billing-actions
export { getAccessToken as getPayPalAccessToken }

export async function getSubscription(id: string): Promise<PayPalSubscription> {
  const token = await getAccessToken()
  const res = await fetch(`${getApiBase()}/v1/billing/subscriptions/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`PayPal getSubscription failed: ${res.status}`)
  return res.json() as Promise<PayPalSubscription>
}

export async function verifyWebhook(
  headers: Headers,
  rawBody: string,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) {
    console.warn('[PayPal] PAYPAL_WEBHOOK_ID not set — skipping signature verification (dev/sandbox only)')
    return true
  }

  let parsedBody: unknown
  try {
    parsedBody = JSON.parse(rawBody)
  } catch {
    return false
  }

  const token = await getAccessToken()
  const res = await fetch(`${getApiBase()}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: headers.get('paypal-auth-algo'),
      cert_url: headers.get('paypal-cert-url'),
      client_id: process.env.PAYPAL_CLIENT_ID,
      transmission_id: headers.get('paypal-transmission-id'),
      transmission_sig: headers.get('paypal-transmission-sig'),
      transmission_time: headers.get('paypal-transmission-time'),
      webhook_id: webhookId,
      webhook_event: parsedBody,
    }),
    cache: 'no-store',
  })

  if (!res.ok) return false
  const data = (await res.json()) as { verification_status: string }
  return data.verification_status === 'SUCCESS'
}

export async function cancelPayPalSubscription(subId: string): Promise<void> {
  const token = await getAccessToken()
  await fetch(`${getApiBase()}/v1/billing/subscriptions/${subId}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason: 'User requested cancellation.' }),
  })
}
