import { ImageResponse } from 'next/og'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Icon component - Creates a circular icon with concentric circles (The Circle Network logo)
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#000',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="14" stroke="#D4AF37" strokeWidth="2" fill="none" />
          <circle cx="16" cy="16" r="9" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
          <circle cx="16" cy="16" r="4" fill="#D4AF37" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
