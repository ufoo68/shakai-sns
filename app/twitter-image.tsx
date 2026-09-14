import { ImageResponse } from 'next/og'

export const alt = 'shakai — 社会について考え、語り合う'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#fbfcfd',
          color: '#2f3a45',
          padding: '72px 84px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ position: 'relative', display: 'flex', width: 74, height: 48 }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 48,
                height: 48,
                border: '5px solid rgba(77, 132, 151, 0.52)',
                borderRadius: 999,
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: 48,
                height: 48,
                border: '5px solid #4d8497',
                borderRadius: 999,
              }}
            />
          </div>
          <div style={{ fontSize: 54, fontWeight: 800, letterSpacing: 0 }}>
            shakai
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: 0,
              lineHeight: 1.18,
              maxWidth: 900,
            }}
          >
            <div>社会について考え、</div>
            <div>語り合う</div>
          </div>
          <div
            style={{
              width: 820,
              fontSize: 31,
              lineHeight: 1.55,
              color: '#5f6f7f',
            }}
          >
            歴史・政治・経済・社会について、学んだことや考えたことを共有し、
            多様な視点から対話するためのSNSです。
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          {['歴史', '政治', '経済', '社会'].map((label) => (
            <div
              key={label}
              style={{
                border: '2px solid #d9e2e8',
                borderRadius: 999,
                padding: '10px 22px',
                fontSize: 24,
                color: '#4d6170',
                background: '#ffffff',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  )
}
