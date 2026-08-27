import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0B1628', // Aartha Navy
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          border: '2px solid #C4962A', // Aartha Gold Enso Ring
          position: 'relative',
        }}
      >
        {/* Top Shirorekha Bar */}
        <div
          style={{
            width: '14px',
            height: '2px',
            background: '#F59E0B',
            marginBottom: '1px',
            borderRadius: '1px',
          }}
        />
        {/* Monogram Body */}
        <div
          style={{
            fontSize: 16,
            lineHeight: 1,
            color: '#F59E0B',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          a
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
