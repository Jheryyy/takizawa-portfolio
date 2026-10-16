import { ImageResponse } from 'next/og';

export const alt = 'Jheryco Takizawa — Frontend Architect & UI/UX Specialist';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#09090C',
          padding: '80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Glow ambient background circles */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            right: '-150px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,90,31,0.25) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
          }}
        />

        {/* Top Header Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#FF5A1F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '22px',
            }}
          >
            T
          </div>
          <span
            style={{
              color: '#A1A1AA',
              fontSize: '20px',
              fontFamily: 'monospace',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            jtakizawa.my.id &bull; Portfolio 2026
          </span>
        </div>

        {/* Main Center Title & Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              fontSize: '68px',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-2px',
              lineHeight: 1.08,
            }}
          >
            Jheryco Takizawa
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 500,
              color: '#FF5A1F',
              letterSpacing: '-0.5px',
            }}
          >
            Frontend Developer &bull; UI/UX Architect
          </div>
          <div
            style={{
              fontSize: '20px',
              color: '#71717A',
              maxWidth: '850px',
              lineHeight: 1.4,
            }}
          >
            Crafting pixel-accurate dark-mode interfaces, interactive 3D WebGL experiences, and high-performance Next.js web applications.
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#FFFFFF',
              fontSize: '16px',
              fontFamily: 'monospace',
            }}
          >
            Next.js 15 App Router
          </div>
          <div
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#FFFFFF',
              fontSize: '16px',
              fontFamily: 'monospace',
            }}
          >
            React 19 &bull; TypeScript
          </div>
          <div
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255,90,31,0.15)',
              border: '1px solid rgba(255,90,31,0.3)',
              color: '#FF5A1F',
              fontSize: '16px',
              fontFamily: 'monospace',
              fontWeight: 700,
            }}
          >
            Available for Hire
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
