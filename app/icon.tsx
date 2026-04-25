import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* FileText icon path */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
          <polyline
            points="10 9 9 9 8 9"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
