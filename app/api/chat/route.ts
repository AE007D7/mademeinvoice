import type { NextRequest } from 'next/server'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import { createClient } from '@/lib/supabase/server'
import { chatTurn } from '@/lib/ai/anthropic'
import type { SSEEvent, ToolContext } from '@/lib/ai/types'

const encoder = new TextEncoder()

function sseEvent(obj: unknown): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(obj)}\n\n`)
}

export async function POST(request: NextRequest) {
  // ── 1. Auth ────────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ── 2. Parse body ──────────────────────────────────────────────────────────
  let body: { session_id?: string; message?: string }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { session_id: sessionId, message } = body
  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: 'message is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ── 3. Open SSE stream ─────────────────────────────────────────────────────
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: unknown) => controller.enqueue(sseEvent(event))

      try {
        // ── 4. Session management ────────────────────────────────────────────
        let currentSessionId: string

        if (sessionId) {
          const { data: session } = await supabase
            .from('chat_sessions')
            .select('id')
            .eq('id', sessionId)
            .eq('user_id', user.id)
            .single()

          if (!session) {
            send({ type: 'error', code: 'session_not_found', message: 'Session not found or access denied.' })
            send({ type: 'done' })
            controller.close()
            return
          }
          currentSessionId = session.id
        } else {
          const { data: newSession, error: sessionError } = await supabase
            .from('chat_sessions')
            .insert({ user_id: user.id, title: message.trim().slice(0, 80) })
            .select('id')
            .single()

          if (sessionError || !newSession) {
            send({ type: 'error', code: 'session_error', message: 'Failed to create session.' })
            send({ type: 'done' })
            controller.close()
            return
          }
          currentSessionId = newSession.id
          send({ type: 'session', session_id: currentSessionId })
        }

        // ── 5. Persist user message ──────────────────────────────────────────
        await supabase.from('chat_messages').insert({
          session_id: currentSessionId,
          role: 'user',
          content: message.trim(),
        })

        // ── 6. Load conversation history (last 20 messages) ──────────────────
        // Query AFTER inserting so the new user message is included
        const { data: history } = await supabase
          .from('chat_messages')
          .select('role, content')
          .eq('session_id', currentSessionId)
          .order('created_at', { ascending: true })
          .limit(20)

        const messages: MessageParam[] = (history ?? []).map((row) => ({
          role: row.role as 'user' | 'assistant',
          // content is jsonb — may be a string (simple user text) or array (tool blocks)
          content: row.content as MessageParam['content'],
        }))

        // Track how many messages existed before chatTurn adds new ones
        const historyLen = messages.length

        // ── 7. Build context ─────────────────────────────────────────────────
        const { data: lastInvoice } = await supabase
          .from('invoices')
          .select('currency')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        const defaultCurrency = lastInvoice?.currency ?? 'USD'

        const proto = request.headers.get('x-forwarded-proto') ?? 'http'
        const host = request.headers.get('host') ?? 'localhost:3000'
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL ??
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `${proto}://${host}`)

        const context: ToolContext = {
          userId: user.id,
          supabase,
          defaultCurrency,
          today: new Date().toISOString().slice(0, 10),
          baseUrl,
        }

        // ── 8. Run agentic loop, streaming events ────────────────────────────
        await chatTurn(messages, context, (event: SSEEvent) => {
          if (event.type === 'text') {
            send({ type: 'text', delta: event.content })
          } else if (event.type === 'tool_call') {
            send({ type: 'tool_call', id: event.id, name: event.name, input: event.input })
          } else if (event.type === 'tool_result') {
            send({ type: 'tool_result', tool_use_id: event.tool_use_id, name: event.name, output: event.output })
          } else if (event.type === 'error') {
            send({ type: 'error', code: 'model_error', message: event.message })
          }
          // 'done' is sent after persistence below
        })

        // ── 9. Persist new assistant turns added by chatTurn ─────────────────
        // messages was mutated; everything from historyLen onward is new
        const newMessages = messages.slice(historyLen)
        for (const msg of newMessages) {
          // Skip the user message we already persisted (first in slice if re-inserted)
          // chatTurn only appends: assistant turns and tool-result user turns
          if (msg.role === 'user' || msg.role === 'assistant') {
            const contentToStore =
              typeof msg.content === 'string'
                ? msg.content
                : JSON.stringify(msg.content)
            await supabase.from('chat_messages').insert({
              session_id: currentSessionId,
              role: msg.role,
              content: contentToStore,
            })
          }
        }

        // Update session timestamp
        await supabase
          .from('chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', currentSessionId)

        send({ type: 'done' })
        controller.close()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
        try {
          send({ type: 'error', code: 'server_error', message: msg })
          send({ type: 'done' })
          controller.close()
        } catch {
          // controller may already be closed
        }
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
