'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Send, Loader2, ExternalLink, ChevronDown, ChevronRight, Bot, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { VoiceRecorder } from '@/components/ai-chat/VoiceRecorder'

// ─── Types ────────────────────────────────────────────────────────────────────

type ToolCall = { id: string; name: string; input: Record<string, unknown> }
type ToolResult = { tool_use_id: string; name: string; output: unknown }

type Message =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; toolCalls: ToolCall[]; toolResults: ToolResult[]; done: boolean }

type InvoiceCreated = {
  id: string
  share_token: string
  share_url: string
  invoice_number: string
}

// ─── Tool call pill ───────────────────────────────────────────────────────────

function ToolCallPill({ call, result }: { call: ToolCall; result?: ToolResult }) {
  const [open, setOpen] = useState(false)
  const label = call.name.replace(/_/g, ' ')
  return (
    <div className="mt-1 rounded-lg border border-border bg-muted/40 text-xs">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 px-3 py-1.5 text-muted-foreground hover:text-foreground"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <span className="font-mono">{label}</span>
        {!result && <Loader2 className="ml-auto h-3 w-3 animate-spin" />}
      </button>
      {open && (
        <div className="border-t border-border px-3 pb-2 pt-1">
          <p className="mb-1 text-muted-foreground">Input</p>
          <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-[10px]">
            {JSON.stringify(call.input, null, 2)}
          </pre>
          {result && (
            <>
              <p className="mb-1 mt-2 text-muted-foreground">Result</p>
              <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-[10px]">
                {JSON.stringify(result.output, null, 2)}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Invoice card ─────────────────────────────────────────────────────────────

function InvoiceCard({ invoice }: { invoice: InvoiceCreated }) {
  return (
    <div className="mt-3 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
      <div>
        <p className="text-xs font-medium text-muted-foreground">Invoice created</p>
        <p className="font-semibold text-foreground">{invoice.invoice_number ?? invoice.id}</p>
      </div>
      <Link
        href={invoice.share_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
      >
        View <ExternalLink className="h-3 w-3" />
      </Link>
    </div>
  )
}

// ─── Markdown-lite renderer ───────────────────────────────────────────────────

function renderMarkdown(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const parts: React.ReactNode[] = []
    const pattern = /(\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^)]+)\))/g
    let last = 0
    let m: RegExpExecArray | null

    while ((m = pattern.exec(line)) !== null) {
      if (m.index > last) parts.push(line.slice(last, m.index))
      if (m[2] !== undefined) parts.push(<strong key={m.index}>{m[2]}</strong>)
      else if (m[3] !== undefined) parts.push(<code key={m.index} className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{m[3]}</code>)
      else if (m[4] !== undefined) parts.push(
        <Link key={m.index} href={m[5]} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:no-underline">
          {m[4]}
        </Link>
      )
      last = m.index + m[0].length
    }
    if (last < line.length) parts.push(line.slice(last))

    return (
      <span key={i}>
        {parts}
        {i < lines.length - 1 && <br />}
      </span>
    )
  })
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm gradient-primary px-4 py-2.5 text-sm text-white shadow-sm">
          {message.content}
        </div>
      </div>
    )
  }

  const invoiceResult = message.toolResults.find(
    (r) => r.name === 'create_invoice' && r.output && typeof r.output === 'object' && 'share_url' in (r.output as object)
  )

  return (
    <div className="flex gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-primary shadow-sm">
        <Bot className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="max-w-[85%] min-w-0">
        {message.toolCalls.length > 0 && (
          <div className="mb-2 space-y-1">
            {message.toolCalls.map((tc) => (
              <ToolCallPill
                key={tc.id}
                call={tc}
                result={message.toolResults.find((r) => r.tool_use_id === tc.id)}
              />
            ))}
          </div>
        )}
        {message.content && (
          <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5 text-sm shadow-sm">
            <p className="leading-relaxed text-foreground">{renderMarkdown(message.content)}</p>
          </div>
        )}
        {!message.done && !message.content && message.toolCalls.length === 0 && (
          <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {invoiceResult && (
          <InvoiceCard invoice={invoiceResult.output as InvoiceCreated} />
        )}
      </div>
    </div>
  )
}

// ─── Suggestions ─────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'Invoice Acme Corp $2,500 for web design',
  'Estimate John 1,000 USD consulting net 30',
  'Invoice client 50,000 INR development + 18% GST',
  'Just make an invoice for Sarah $800 copywriting',
]

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChatInterface({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [voiceActive, setVoiceActive] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Resize textarea whenever input changes (e.g. after voice transcript arrives)
  useEffect(() => {
    const el = textareaRef.current
    if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px` }
  }, [input])

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setInput('')
    setLoading(true)

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setMessages((prev) => [...prev, { role: 'assistant', content: '', toolCalls: [], toolResults: [], done: false }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: trimmed }),
      })

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: 'Request failed.' }))
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', content: err.error ?? 'Something went wrong.', toolCalls: [], toolResults: [], done: true }
          return copy
        })
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          let event: Record<string, unknown>
          try { event = JSON.parse(line.slice(6)) } catch { continue }

          if (event.type === 'session') {
            setSessionId(event.session_id as string)
          } else if (event.type === 'text') {
            setMessages((prev) => {
              const copy = [...prev]
              const last = copy[copy.length - 1]
              if (last.role === 'assistant') {
                copy[copy.length - 1] = { ...last, content: last.content + (event.delta as string) }
              }
              return copy
            })
          } else if (event.type === 'tool_call') {
            setMessages((prev) => {
              const copy = [...prev]
              const last = copy[copy.length - 1]
              if (last.role === 'assistant') {
                copy[copy.length - 1] = {
                  ...last,
                  toolCalls: [...last.toolCalls, { id: event.id as string, name: event.name as string, input: event.input as Record<string, unknown> }],
                }
              }
              return copy
            })
          } else if (event.type === 'tool_result') {
            setMessages((prev) => {
              const copy = [...prev]
              const last = copy[copy.length - 1]
              if (last.role === 'assistant') {
                copy[copy.length - 1] = {
                  ...last,
                  toolResults: [...last.toolResults, { tool_use_id: event.tool_use_id as string, name: event.name as string, output: event.output }],
                }
              }
              return copy
            })
          } else if (event.type === 'done') {
            setMessages((prev) => {
              const copy = [...prev]
              const last = copy[copy.length - 1]
              if (last.role === 'assistant') {
                copy[copy.length - 1] = { ...last, done: true }
              }
              return copy
            })
          } else if (event.type === 'error') {
            setMessages((prev) => {
              const copy = [...prev]
              const last = copy[copy.length - 1]
              if (last.role === 'assistant') {
                copy[copy.length - 1] = { ...last, content: (event.message as string) ?? 'An error occurred.', done: true }
              }
              return copy
            })
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev]
        const last = copy[copy.length - 1]
        if (last.role === 'assistant') {
          copy[copy.length - 1] = { ...last, content: 'Network error. Please try again.', done: true }
        }
        return copy
      })
    } finally {
      setLoading(false)
      if (!voiceActive) textareaRef.current?.focus()
    }
  }, [loading, sessionId, voiceActive])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-full flex-col">
      {/* Header — hidden in compact/panel mode */}
      {!compact && (
        <div className="flex items-center gap-3 border-b border-border bg-background px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Make Invoice with AI</h1>
            <p className="text-xs text-muted-foreground">Describe your invoice — I&apos;ll create it instantly</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/25">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">What would you like to invoice?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Type or speak your invoice — I&apos;ll handle the rest.
              </p>
            </div>
            <div className="grid w-full max-w-md gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-xl border border-border bg-card px-4 py-2.5 text-left text-xs text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-4">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className={cn(
            'flex items-end gap-2 rounded-2xl border bg-card px-4 py-3 shadow-sm transition-colors',
            voiceActive
              ? 'border-primary/50 ring-1 ring-primary/20'
              : 'border-border focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20'
          )}>
            <VoiceRecorder
              onTranscript={(text) => { setInput(text); setVoiceError(null) }}
              onSend={send}
              onActiveChange={setVoiceActive}
              onError={setVoiceError}
              disabled={loading}
            />

            {!voiceActive && (
              <>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Invoice Acme $500 for design work…"
                  rows={1}
                  disabled={loading}
                  className="min-h-[24px] max-h-32 flex-1 resize-none overflow-y-auto bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  style={{ height: 'auto' }}
                  onInput={(e) => {
                    const t = e.currentTarget
                    t.style.height = 'auto'
                    t.style.height = `${t.scrollHeight}px`
                  }}
                />
                <Button
                  type="button"
                  size="icon-sm"
                  onClick={() => send(input)}
                  disabled={loading || !input.trim()}
                  className="shrink-0 gradient-primary text-white hover:opacity-90 disabled:opacity-40"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </>
            )}
          </div>

          {voiceError && (
            <p className="mt-1.5 text-center text-[10px] text-red-500">{voiceError}</p>
          )}
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
            {voiceActive ? (
              <span className="text-primary">Recording… tap stop when done</span>
            ) : (
              'Enter to send · Shift+Enter for new line · Mic for voice'
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
