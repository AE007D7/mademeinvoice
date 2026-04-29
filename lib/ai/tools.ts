import type { Tool } from '@anthropic-ai/sdk/resources/messages'
import { createInvoiceCore } from '@/app/actions/invoices'
import { PlanLimitError } from './errors'
import type {
  ToolContext,
  ClientRecord,
  ProductRecord,
  CreatedInvoiceResult,
} from './types'

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.mademeinvoice.com'

// ─── Anthropic tool schemas ───────────────────────────────────────────────────

export const TOOL_DEFINITIONS: Tool[] = [
  {
    name: 'get_client',
    description:
      'Look up a client by name (fuzzy) or by exact email address. Returns the matching client record, or null if not found. Call this when the user mentions a client name to resolve it to an ID and confirm spelling.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Client name (partial OK) or exact email address.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'list_recent_clients',
    description:
      'Return the most recently invoiced clients for this user. Useful when the user hasn\'t specified a client — show them the list to pick from.',
    input_schema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'How many clients to return (default 10, max 20).',
        },
      },
      required: [],
    },
  },
  {
    name: 'list_products',
    description:
      'Return saved products/services from the catalog. Pass a query to fuzzy-search by name, or omit it to get all products. Use this to check if a service the user mentioned matches a saved product with a set price.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Optional partial product name to search for.',
        },
      },
      required: [],
    },
  },
  {
    name: 'create_invoice',
    description:
      'Create a draft invoice. Only call this AFTER the user has confirmed the details (client, items, amounts). Returns the invoice ID, share URL, and invoice number.',
    input_schema: {
      type: 'object',
      properties: {
        clientId: {
          type: 'string',
          description: 'Client UUID from get_client. Omit if no client.',
        },
        currency: {
          type: 'string',
          description: 'Three-letter ISO currency code, e.g. USD, EUR, INR.',
        },
        taxRate: {
          type: 'number',
          description: 'Tax percentage (0–100). Default 0.',
        },
        items: {
          type: 'array',
          description: 'Line items on the invoice.',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              quantity:    { type: 'number' },
              price:       { type: 'number', description: 'Unit price.' },
            },
            required: ['description', 'quantity', 'price'],
          },
        },
        dueDate: {
          type: 'string',
          description: 'ISO 8601 date string (YYYY-MM-DD). Optional.',
        },
        notes: {
          type: 'string',
          description: 'Footer notes, payment instructions, etc. Optional.',
        },
      },
      required: ['currency', 'items'],
    },
  },
]

// ─── Tool handlers ────────────────────────────────────────────────────────────

async function handleGetClient(
  input: { query: string },
  ctx: ToolContext
): Promise<ClientRecord | null> {
  const { supabase, userId } = ctx
  const q = input.query.trim()

  // Try name fuzzy match first, then exact email
  const { data } = await supabase
    .from('clients')
    .select('id, name, email, address')
    .eq('user_id', userId)
    .or(`name.ilike.%${q}%,email.eq.${q}`)
    .limit(1)

  const row = data?.[0]
  if (!row) return null
  return { id: row.id, name: row.name, email: row.email ?? null, address: row.address ?? null }
}

async function handleListRecentClients(
  input: { limit?: number },
  ctx: ToolContext
): Promise<ClientRecord[]> {
  const { supabase, userId } = ctx
  const limit = Math.min(input.limit ?? 10, 20)

  // Pull recent invoices and deduplicate clients
  const { data } = await supabase
    .from('invoices')
    .select('client_id, clients(id, name, email, address)')
    .eq('user_id', userId)
    .not('client_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(60)

  const seen = new Set<string>()
  const clients: ClientRecord[] = []
  for (const row of data ?? []) {
    const c = row.clients as unknown as ClientRecord | null
    if (c && !seen.has(c.id)) {
      seen.add(c.id)
      clients.push(c)
      if (clients.length >= limit) break
    }
  }
  return clients
}

async function handleListProducts(
  input: { query?: string },
  ctx: ToolContext
): Promise<ProductRecord[]> {
  const { supabase, userId } = ctx

  let q = supabase
    .from('products')
    .select('id, name, description, price, unit')
    .eq('user_id', userId)
    .order('name')
    .limit(20)

  if (input.query?.trim()) {
    q = q.ilike('name', `%${input.query.trim()}%`)
  }

  const { data } = await q
  return (data ?? []) as ProductRecord[]
}

async function handleCreateInvoice(
  input: {
    clientId?: string
    currency: string
    taxRate?: number
    items: { description: string; quantity: number; price: number }[]
    dueDate?: string
    notes?: string
  },
  ctx: ToolContext
): Promise<CreatedInvoiceResult | { error: string; code: 'plan_limit' | 'db_error' }> {
  const { userId, supabase } = ctx
  try {
    const result = await createInvoiceCore(
      {
        clientId: input.clientId ?? null,
        currency: input.currency,
        taxRate: input.taxRate ?? 0,
        items: input.items,
        dueDate: input.dueDate ?? null,
        notes: input.notes ?? null,
        template: 'modern',
        accentColor: '#6366f1',
        docType: 'invoice',
      },
      userId,
      supabase
    )
    return {
      id: result.id,
      share_token: result.share_token,
      share_url: `${APP_URL}/invoice/${result.share_token}`,
      invoice_number: result.invoice_number,
    }
  } catch (err) {
    if (err instanceof PlanLimitError) {
      return { error: err.message, code: 'plan_limit' }
    }
    return {
      error: err instanceof Error ? err.message : 'Failed to create invoice.',
      code: 'db_error',
    }
  }
}

// ─── Dispatch ─────────────────────────────────────────────────────────────────

export async function executeToolCall(
  name: string,
  input: Record<string, unknown>,
  ctx: ToolContext
): Promise<unknown> {
  switch (name) {
    case 'get_client':
      return handleGetClient(input as { query: string }, ctx)
    case 'list_recent_clients':
      return handleListRecentClients(input as { limit?: number }, ctx)
    case 'list_products':
      return handleListProducts(input as { query?: string }, ctx)
    case 'create_invoice':
      return handleCreateInvoice(
        input as Parameters<typeof handleCreateInvoice>[0],
        ctx
      )
    default:
      return { error: `Unknown tool: ${name}` }
  }
}
