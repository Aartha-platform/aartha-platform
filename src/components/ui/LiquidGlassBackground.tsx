'use client'
import { FC } from 'react'

export const LiquidGlassBackground: FC = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-bg transition-colors duration-300"
      style={{ contain: 'strict', transform: 'translate3d(0, 0, 0)' }}
    >
      {/* High-Performance Ambient Gradients (Zero Scroll Lag) */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.12]">
        {/* Blob 1: Royal Blue / Navy */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] min-w-[320px] min-h-[320px] rounded-full bg-[radial-gradient(circle,_rgba(79,70,229,0.7)_0%,_rgba(59,130,246,0.3)_40%,_transparent_70%)]" />
        
        {/* Blob 2: Gold/Amber */}
        <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] min-w-[280px] min-h-[280px] rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.6)_0%,_rgba(217,119,6,0.25)_40%,_transparent_70%)]" />
        
        {/* Blob 3: Soft Emerald */}
        <div className="absolute bottom-[-10%] left-[10%] w-[50vw] h-[50vw] min-w-[350px] min-h-[350px] rounded-full bg-[radial-gradient(circle,_rgba(16,185,129,0.5)_0%,_rgba(13,148,136,0.2)_40%,_transparent_70%)]" />
      </div>

      {/* Grid overlay for digital texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(196,150,42,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(196,150,42,0.02)_1px,transparent_1px)] bg-[size:5rem_5rem] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)]" />
    </div>
  )
}

export default LiquidGlassBackground
