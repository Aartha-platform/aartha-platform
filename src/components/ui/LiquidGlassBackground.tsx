'use client'
import { FC } from 'react'

export const LiquidGlassBackground: FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-bg transition-colors duration-500">
      {/* Liquid background blobs */}
      <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.15] mix-blend-multiply dark:mix-blend-normal">
        {/* Blob 1: Royal Blue / Navy */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] min-w-[320px] min-h-[320px] rounded-full bg-[radial-gradient(circle,_rgba(79,70,229,0.7)_0%,_rgba(59,130,246,0.3)_40%,_transparent_70%)] animate-blob-slow-1 will-change-transform" />
        
        {/* Blob 2: Gold/Amber */}
        <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] min-w-[280px] min-h-[280px] rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.6)_0%,_rgba(217,119,6,0.25)_40%,_transparent_70%)] animate-blob-slow-2 will-change-transform" />
        
        {/* Blob 3: Soft Emerald */}
        <div className="absolute bottom-[-10%] left-[10%] w-[50vw] h-[50vw] min-w-[350px] min-h-[350px] rounded-full bg-[radial-gradient(circle,_rgba(16,185,129,0.5)_0%,_rgba(13,148,136,0.2)_40%,_transparent_70%)] animate-blob-slow-3 will-change-transform" />
        
        {/* Blob 4: Deep Violet */}
        <div className="absolute bottom-[20%] right-[15%] w-[40vw] h-[40vw] min-w-[280px] min-h-[280px] rounded-full bg-[radial-gradient(circle,_rgba(124,58,237,0.6)_0%,_rgba(147,51,234,0.25)_40%,_transparent_70%)] animate-blob-slow-4 will-change-transform" />
      </div>

      {/* Grid overlay for digital texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(196,150,42,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(196,150,42,0.02)_1px,transparent_1px)] bg-[size:5rem_5rem] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)]" />

      {/* Soft central light diffusion glow */}
      <div className="absolute top-[25%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[30vw] rounded-full bg-gradient-to-r from-amber-500/5 via-indigo-500/5 to-transparent blur-2xl pointer-events-none" />
    </div>
  )
}

export default LiquidGlassBackground
