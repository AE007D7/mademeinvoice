'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Mic, Square, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type VoiceState = 'idle' | 'requesting' | 'recording' | 'transcribing' | 'error'

type Props = {
  onTranscript: (text: string) => void
  onSend?: (text: string) => void
  onActiveChange?: (active: boolean) => void
  onError?: (err: string) => void
  autoSend?: boolean
  disabled?: boolean
}

const BAR_COUNT = 28
const SILENCE_THRESHOLD = 8   // 0-255 frequency average
const SILENCE_DURATION_MS = 3000
const MAX_DURATION_MS = 60_000

export function VoiceRecorder({ onTranscript, onSend, onActiveChange, onError, autoSend, disabled }: Props) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)

  const barsRef = useRef<(HTMLDivElement | null)[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number>(0)
  const streamRef = useRef<MediaStream | null>(null)
  const silenceStartRef = useRef<number | null>(null)
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pendingTextRef = useRef('')

  // stable ref so RAF closure always has current stopRecording
  const stopRecordingRef = useRef<() => void>(() => {})

  const notifyActive = useCallback((v: boolean) => onActiveChange?.(v), [onActiveChange])

  const cleanup = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    if (autoStopRef.current) { clearTimeout(autoStopRef.current); autoStopRef.current = null }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null }
    if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
    analyserRef.current = null
    mediaRecorderRef.current = null
    chunksRef.current = []
    silenceStartRef.current = null
  }, [])

  useEffect(() => () => { cleanup() }, [cleanup])

  const cancelSend = useCallback(() => {
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null }
    setCountdown(null)
    pendingTextRef.current = ''
  }, [])

  const deliverTranscript = useCallback((text: string) => {
    onTranscript(text)
    if (!autoSend || !onSend) return

    pendingTextRef.current = text
    let remaining = 2
    setCountdown(remaining)
    countdownRef.current = setInterval(() => {
      remaining -= 1
      if (remaining <= 0) {
        clearInterval(countdownRef.current!)
        countdownRef.current = null
        setCountdown(null)
        const t = pendingTextRef.current
        pendingTextRef.current = ''
        if (t) onSend(t)
      } else {
        setCountdown(remaining)
      }
    }, 1000)
  }, [autoSend, onSend, onTranscript])

  const stopRecording = useCallback(() => {
    setVoiceState('transcribing')
    notifyActive(false)
    cancelAnimationFrame(rafRef.current)
    if (autoStopRef.current) { clearTimeout(autoStopRef.current); autoStopRef.current = null }
    barsRef.current.forEach(el => { if (el) el.style.height = '4px' })

    const recorder = mediaRecorderRef.current
    if (!recorder || recorder.state === 'inactive') {
      cleanup()
      setVoiceState('idle')
      return
    }

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
      cleanup()

      if (blob.size < 500) {
        setVoiceState('idle')
        return
      }

      try {
        const fd = new FormData()
        fd.append('audio', blob, 'audio.webm')
        const res = await fetch('/api/transcribe', { method: 'POST', body: fd })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Transcription failed.')
        const text = (json.text ?? '').trim()
        setVoiceState('idle')
        if (text) deliverTranscript(text)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Transcription failed.'
        setVoiceState('error')
        setErrorMsg(msg)
        onError?.(msg)
      }
    }

    recorder.stop()
  }, [cleanup, deliverTranscript, notifyActive, onError])

  useEffect(() => { stopRecordingRef.current = stopRecording }, [stopRecording])

  const startWaveform = useCallback((stream: MediaStream) => {
    const ctx = new AudioContext()
    audioCtxRef.current = ctx
    const src = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 64
    src.connect(analyser)
    analyserRef.current = analyser

    const data = new Uint8Array(analyser.frequencyBinCount)
    const step = Math.max(1, Math.floor(data.length / BAR_COUNT))

    const tick = () => {
      if (!analyserRef.current) return
      analyserRef.current.getByteFrequencyData(data)

      for (let i = 0; i < BAR_COUNT; i++) {
        const val = data[Math.min(i * step, data.length - 1)] / 255
        const el = barsRef.current[i]
        if (el) el.style.height = `${Math.max(4, Math.round(val * 48))}px`
      }

      const avg = data.reduce((s, v) => s + v, 0) / data.length
      if (avg < SILENCE_THRESHOLD) {
        if (silenceStartRef.current === null) silenceStartRef.current = Date.now()
        else if (Date.now() - silenceStartRef.current >= SILENCE_DURATION_MS) {
          stopRecordingRef.current()
          return
        }
      } else {
        silenceStartRef.current = null
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const startRecording = useCallback(async () => {
    setErrorMsg(null)
    setVoiceState('requesting')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.start(200)

      setVoiceState('recording')
      notifyActive(true)
      startWaveform(stream)
      autoStopRef.current = setTimeout(() => stopRecordingRef.current(), MAX_DURATION_MS)
    } catch (err) {
      const isDenied = err instanceof Error && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')
      const msg = isDenied
        ? 'Microphone access denied. Allow it in your browser settings.'
        : 'Could not access microphone.'
      setVoiceState('error')
      setErrorMsg(msg)
      onError?.(msg)
    }
  }, [notifyActive, startWaveform, onError])

  // ─── Render states ────────────────────────────────────────────────────────────

  if (voiceState === 'requesting') {
    return (
      <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Requesting mic…</span>
      </div>
    )
  }

  if (voiceState === 'transcribing') {
    return (
      <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>Transcribing…</span>
      </div>
    )
  }

  if (countdown !== null) {
    return (
      <div className="flex shrink-0 items-center gap-2 text-xs">
        <span className="font-medium text-primary">Sending in {countdown}s…</span>
        <button
          type="button"
          onClick={cancelSend}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-3 w-3" /> cancel
        </button>
      </div>
    )
  }

  if (voiceState === 'recording') {
    return (
      <div className="flex flex-1 items-center gap-3">
        {/* REC badge */}
        <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          REC
        </span>

        {/* Center-growing waveform */}
        <div className="flex flex-1 items-center justify-center gap-[2px]" style={{ height: '36px' }}>
          {Array.from({ length: BAR_COUNT }).map((_, i) => (
            <div
              key={i}
              ref={el => { barsRef.current[i] = el }}
              className="w-[3px] rounded-full bg-primary"
              style={{ height: '3px', transition: 'height 70ms ease-out' }}
            />
          ))}
        </div>

        {/* Stop button */}
        <button
          type="button"
          onClick={stopRecording}
          aria-label="Stop recording"
          className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/40 transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/50"
        >
          <Square className="h-3 w-3 fill-current" />
        </button>
      </div>
    )
  }

  // idle / error
  return (
    <div className="relative shrink-0">
      {errorMsg && (
        <div className="absolute bottom-full right-0 mb-2 w-52 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-[10px] text-destructive">
          {errorMsg}
        </div>
      )}
      <button
        type="button"
        onClick={startRecording}
        disabled={disabled}
        aria-label="Start voice input"
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 disabled:opacity-40',
          errorMsg
            ? 'text-destructive hover:bg-destructive/10'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <Mic className="h-4 w-4" />
      </button>
    </div>
  )
}
