import Anthropic from '@anthropic-ai/sdk'
import type { MessageParam, ToolUseBlock, ToolResultBlockParam } from '@anthropic-ai/sdk/resources/messages'
import { readFileSync } from 'fs'
import { join } from 'path'
import { TOOL_DEFINITIONS, executeToolCall } from './tools'
import type { ExtractedInvoice, SSEEvent, ToolContext } from './types'

const MODEL_SONNET = 'claude-sonnet-4-6'
const MODEL_HAIKU  = 'claude-haiku-4-5-20251001'

function getClient() {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set.')
  return new Anthropic({ apiKey: key })
}

function readPrompt(name: string): string {
  return readFileSync(join(process.cwd(), 'prompts', name), 'utf-8')
}

// ─── Extractor ────────────────────────────────────────────────────────────────
// Sends a single non-streaming call to Haiku and parses JSON.

export type ExtractorContext = {
  defaultCurrency: string
  userCountry?: string
  today?: string
}

export async function extractInvoice(
  text: string,
  context: ExtractorContext
): Promise<ExtractedInvoice | null> {
  const client = getClient()
  const system = readPrompt('extractor.md')
  const today = context.today ?? new Date().toISOString().slice(0, 10)

  const userMessage = [
    `today: ${today}`,
    `user_default_currency: ${context.defaultCurrency}`,
    `user_country: ${context.userCountry ?? 'US'}`,
    `text: "${text}"`,
  ].join('\n')

  const response = await client.messages.create({
    model: MODEL_HAIKU,
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content: userMessage }],
  })

  const rawText = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('')

  // Strip markdown code fences if present
  const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  try {
    const parsed = JSON.parse(cleaned) as ExtractedInvoice
    if (!Array.isArray(parsed.items)) return null
    return {
      document_type: parsed.document_type === 'estimation' ? 'estimation' : 'invoice',
      client: {
        name: parsed.client?.name ?? null,
        email: parsed.client?.email ?? null,
        address: parsed.client?.address ?? null,
      },
      items: parsed.items.map((i) => ({
        description: String(i.description ?? ''),
        quantity: Number(i.quantity ?? 1),
        price: Number(i.price ?? 0),
      })),
      currency: parsed.currency ?? context.defaultCurrency,
      tax_rate: Number(parsed.tax_rate ?? 0),
      due_date: parsed.due_date ?? null,
      notes: parsed.notes ?? null,
      confidence: {
        overall: Number(parsed.confidence?.overall ?? 0.8),
        missing_fields: parsed.confidence?.missing_fields ?? [],
        assumptions: parsed.confidence?.assumptions ?? [],
      },
    }
  } catch {
    return null
  }
}

// ─── Chat turn — full agentic loop with streaming ─────────────────────────────
// Streams assistant text via onEvent callbacks, executes tool calls, loops until
// stop_reason === 'end_turn'. Mutates `messages` in place (appends turns).

// ─── Chat turn — full agentic loop with streaming ─────────────────────────────
// Streams assistant text via onEvent callbacks, executes tool calls, loops until
// stop_reason === 'end_turn'. Mutates `messages` in place (appends turns).
// Pass a custom `toolExecutor` to override the real DB-backed executor (e.g. for tests).

export type ToolExecutor = (
  name: string,
  input: Record<string, unknown>,
  ctx: ToolContext
) => Promise<unknown>

export async function chatTurn(
  messages: MessageParam[],
  context: ToolContext,
  onEvent: (event: SSEEvent) => void,
  toolExecutor: ToolExecutor = executeToolCall
): Promise<void> {
  const client = getClient()
  const system = readPrompt('agent.md')
  const today = context.today ?? new Date().toISOString().slice(0, 10)

  const systemWithContext = [
    system,
    '',
    '## Runtime context',
    `- today: ${today}`,
    `- user_default_currency: ${context.defaultCurrency}`,
    `- user_country: ${context.userCountry ?? 'unknown'}`,
  ].join('\n')

  while (true) {
    const stream = client.messages.stream({
      model: MODEL_SONNET,
      max_tokens: 4096,
      system: systemWithContext,
      tools: TOOL_DEFINITIONS,
      messages,
    })

    stream.on('text', (chunk) => {
      onEvent({ type: 'text', content: chunk })
    })

    const finalMsg = await stream.finalMessage()

    messages.push({ role: 'assistant', content: finalMsg.content })

    if (finalMsg.stop_reason !== 'tool_use') {
      break
    }

    const toolResultBlocks: ToolResultBlockParam[] = []

    for (const block of finalMsg.content) {
      if (block.type !== 'tool_use') continue
      const toolBlock = block as ToolUseBlock

      onEvent({
        type: 'tool_call',
        id: toolBlock.id,
        name: toolBlock.name,
        input: toolBlock.input as Record<string, unknown>,
      })

      const output = await toolExecutor(
        toolBlock.name,
        toolBlock.input as Record<string, unknown>,
        context
      )

      onEvent({ type: 'tool_result', tool_use_id: toolBlock.id, name: toolBlock.name, output })

      toolResultBlocks.push({
        type: 'tool_result',
        tool_use_id: toolBlock.id,
        content: JSON.stringify(output),
      })
    }

    messages.push({ role: 'user', content: toolResultBlocks })
  }

  onEvent({ type: 'done' })
}
