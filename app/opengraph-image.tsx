import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Made Me Invoice — Free Invoice Generator'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0f0b2e 0%, #1a1040 55%, #0d0a25 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="14 2 14 8 20 8"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line x1="16" y1="13" x2="8" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="16" y1="17" x2="8" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 30, fontWeight: 700, letterSpacing: '-0.5px' }}>
            Made Me Invoice
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.05,
            letterSpacing: '-3px',
            marginBottom: 12,
          }}
        >
          Invoice faster.
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            textAlign: 'center',
            lineHeight: 1.05,
            letterSpacing: '-3px',
            marginBottom: 36,
            background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Get paid sooner.
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 26,
            color: 'rgba(255,255,255,0.55)',
            textAlign: 'center',
            maxWidth: 680,
            lineHeight: 1.4,
            marginBottom: 48,
          }}
        >
          Free invoice generator — print-ready PDFs, multi-currency & custom branding
        </div>

        {/* Domain pill */}
        <div
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 100,
            padding: '10px 28px',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 20,
          }}
        >
          mademeinvoice.com
        </div>
      </div>
    ),
    { ...size }
  )
}
