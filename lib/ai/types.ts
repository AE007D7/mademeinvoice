import type { SupabaseClient } from '@supabase/supabase-js'
import type { MessageParam, ToolUseBlock } from '@anthropic-ai/sdk/resources/messages'

// ── Re-export Anthropic message type so callers don't import SDK directly ──
export type { MessageParam as AnthropicMessage }

// ── Invoice extraction ────────────────────────────────────────────────────

export type ExtractedItem = {
  description: string
  quantity: number
  price: number
}

export type ExtractedInvoice = {
  clientName?: string
  items: ExtractedItem[]
  currency: string
  taxRate?: number
  dueDate?: string | null
  notes?: string | null
}

// ── Chat context passed to every tool handler ─────────────────────────────

export type ToolContext = {
  userId: string
  supabase: SupabaseClient
  defaultCurrency: string
}

// ── SSE event shapes (sent to the client) ────────────────────────────────

export type SSETextEvent     = { type: 'text';        content: string }
export type SSEToolCallEvent = { type: 'tool_call';   name: string; input: Record<string, unknown> }
export type SSEToolResultEvent = { type: 'tool_result'; name: string; output: unknown }
export type SSEDoneEvent     = { type: 'done' }
export type SSEErrorEvent    = { type: 'error';       message: string }

export type SSEEvent =
  | SSETextEvent
  | SSEToolCallEvent
  | SSEToolResultEvent
  | SSEDoneEvent
  | SSEErrorEvent

// ── Tool output shapes ────────────────────────────────────────────────────

export type ClientRecord = {
  id: string
  name: string
  email: string | null
  address: string | null
}

export type ProductRecord = {
  id: string
  name: string
  description: string | null
  price: number
  unit: string
}

export type CreatedInvoiceResult = {
  id: string
  share_token: string
  share_url: string
  invoice_number: string | null
}

// ── Internal agentic-loop helper ──────────────────────────────────────────

export type { ToolUseBlock }
