"use client";

import React from 'react';
import Image from 'next/image';

interface AarthaLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textColor?: string;
  tagline?: boolean;
  variant?: 'image' | 'vector';
  theme?: 'dark' | 'light' | 'gold' | 'auto';
}

/**
 * Aartha Brand Logo Monogram:
 * Artistic Ensō (Zen circle) containing the hybrid Devanagari "अ" & Latin "a" monogram
 * with the horizontal shirorekha top bar and dynamic calligraphic curves.
 */
export const AarthaIcon = ({ 
  size = 38, 
  className = "",
  theme = 'auto' 
}: { 
  size?: number; 
  className?: string;
  theme?: 'dark' | 'light' | 'gold' | 'auto';
}) => {
  const imgSrc = theme === 'light' ? '/brand/aartha-logo-white.png' : '/brand/aartha-logo.png';
  const imgClass = theme === 'auto' ? 'w-full h-full object-contain dark:invert' : 'w-full h-full object-contain';

  return (
    <div 
      className={`relative flex items-center justify-center flex-shrink-0 select-none overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={imgSrc}
        alt="Aartha Logo"
        width={size * 2}
        height={size * 2}
        className={imgClass}
        priority
      />
    </div>
  );
};

export default function AarthaLogo({
  size = 44,
  className = "",
  showText = true,
  tagline = true,
  theme = 'auto'
}: AarthaLogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Monogram Emblem */}
      <div 
        className="relative flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        {theme === 'auto' ? (
          <>
            <Image
              src="/brand/aartha-logo.png"
              alt="Aartha Monogram"
              width={size * 2}
              height={size * 2}
              className="w-full h-full object-contain block dark:hidden drop-shadow-xs"
              priority
            />
            <Image
              src="/brand/aartha-logo-white.png"
              alt="Aartha Monogram"
              width={size * 2}
              height={size * 2}
              className="w-full h-full object-contain hidden dark:block drop-shadow-xs"
              priority
            />
          </>
        ) : (
          <Image
            src={theme === 'light' ? '/brand/aartha-logo-white.png' : '/brand/aartha-logo.png'}
            alt="Aartha Monogram"
            width={size * 2}
            height={size * 2}
            className="w-full h-full object-contain drop-shadow-xs"
            priority
          />
        )}
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="text-navy dark:text-white font-extrabold text-lg leading-none tracking-wider whitespace-nowrap">
            AARTHA
          </div>
          {tagline && (
            <div className="text-amber-500 dark:text-amber-400 text-[10px] sm:text-[11px] uppercase tracking-wider leading-none font-bold mt-1">
              Purpose · Wealth · Prosperity
            </div>
          )}
        </div>
      )}
    </div>
  );
}
