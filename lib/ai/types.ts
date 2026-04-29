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

export type ExtractedClient = {
  name: string | null
  email: string | null
  address: string | null
}

export type ExtractionConfidence = {
  overall: number
  missing_fields: string[]
  assumptions: string[]
}

export type ExtractedInvoice = {
  document_type: 'invoice' | 'estimation'
  client: ExtractedClient
  items: ExtractedItem[]
  currency: string
  tax_rate: number
  due_date: string | null
  notes: string | null
  confidence: ExtractionConfidence
}

// ── Chat context passed to every tool handler ─────────────────────────────

export type ToolContext = {
  userId: string
  supabase?: SupabaseClient   // required for real tools; undefined is fine for mock executors
  defaultCurrency: string
  today?: string
  userCountry?: string
  baseUrl?: string            // origin for share links, e.g. http://localhost:3000
}

// ── SSE event shapes (sent to the client) ────────────────────────────────

export type SSETextEvent       = { type: 'text';        content: string }
export type SSEToolCallEvent   = { type: 'tool_call';   id: string; name: string; input: Record<string, unknown> }
export type SSEToolResultEvent = { type: 'tool_result'; tool_use_id: string; name: string; output: unknown }
export type SSEDoneEvent       = { type: 'done' }
export type SSEErrorEvent      = { type: 'error';       message: string }

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
