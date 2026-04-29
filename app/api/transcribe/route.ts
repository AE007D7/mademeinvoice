import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let formData: FormData
  try { formData = await request.formData() }
  catch { return Response.json({ error: 'Invalid request.' }, { status: 400 }) }

  const audio = formData.get('audio')
  if (!audio || typeof audio === 'string')
    return Response.json({ error: 'No audio file provided.' }, { status: 400 })

  const groqKey = process.env.GROQ_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY
  if (!groqKey && !openaiKey)
    return Response.json(
      { error: 'No transcription API key configured. Set GROQ_API_KEY or OPENAI_API_KEY.' },
      { status: 500 }
    )

  try {
    const text = groqKey
      ? await transcribeGroq(audio as File, groqKey)
      : await transcribeOpenAI(audio as File, openaiKey!)
    return Response.json({ text })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Transcription failed.' },
      { status: 500 }
    )
  }
}

async function transcribeGroq(audio: File | Blob, apiKey: string): Promise<string> {
  const fd = new FormData()
  fd.append('file', audio, 'audio.webm')
  fd.append('model', 'whisper-large-v3-turbo')
  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: fd,
  })
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new Error((e as any)?.error?.message ?? `Groq error ${res.status}`)
  }
  return ((await res.json()).text ?? '').trim()
}

async function transcribeOpenAI(audio: File | Blob, apiKey: string): Promise<string> {
  const fd = new FormData()
  fd.append('file', audio, 'audio.webm')
  fd.append('model', 'whisper-1')
  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: fd,
  })
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new Error((e as any)?.error?.message ?? `OpenAI error ${res.status}`)
  }
  return ((await res.json()).text ?? '').trim()
}
