/**
 * Test harness: exposes the chat pipeline for direct testing without HTTP.
 * Uses in-memory message history, mocked tools, and real Anthropic API calls.
 * No Supabase connection required.
 */

import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import { chatTurn } from './anthropic'
import type { SSEEvent, ToolContext, SSEToolCallEvent } from './types'

// ─── Mock tool executor ───────────────────────────────────────────────────────

const MOCK_INVOICE = {
  id: 'test-id-123',
  share_token: 'tok123',
  share_url: 'https://mademeinvoice.com/i/tok123',
  invoice_number: 'INV-001',
}

async function mockToolExecutor(
  name: string,
  _input: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'get_client':          return null
    case 'list_recent_clients': return []
    case 'list_products':       return []
    case 'create_invoice':      return MOCK_INVOICE
    default:                    return { error: `Unknown tool: ${name}` }
  }
}

// ─── Public types ─────────────────────────────────────────────────────────────

export type HarnessTurnResult = {
  events: SSEEvent[]
  toolsCalled: Array<{ id: string; name: string; input: Record<string, unknown> }>
  assistantText: string
}

export type HarnessSession = {
  /** In-memory conversation history — inspect for debugging */
  messages: MessageParam[]
  /** Send a user message and collect all events for that turn */
  send(message: string): Promise<HarnessTurnResult>
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createHarnessSession(
  defaultCurrency = 'USD',
  opts: { today?: string; userCountry?: string } = {}
): HarnessSession {
  const messages: MessageParam[] = []

  const context: ToolContext = {
    userId: 'test-user',
    supabase: undefined,
    defaultCurrency,
    today: opts.today ?? '2026-04-29',
    userCountry: opts.userCountry,
  }

  return {
    messages,

    async send(message: string): Promise<HarnessTurnResult> {
      messages.push({ role: 'user', content: message })

      const events: SSEEvent[] = []
      const toolsCalled: HarnessTurnResult['toolsCalled'] = []
      let assistantText = ''

      await chatTurn(
        messages,
        context,
        (event) => {
          events.push(event)
          if (event.type === 'text') {
            assistantText += event.content
          }
          if (event.type === 'tool_call') {
            const tc = event as SSEToolCallEvent
            toolsCalled.push({ id: tc.id, name: tc.name, input: tc.input })
          }
        },
        mockToolExecutor
      )

      return { events, toolsCalled, assistantText }
    },
  }
}
