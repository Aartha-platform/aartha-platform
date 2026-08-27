"use client";

import React from 'react';
import MediaUploader from './MediaUploader';

interface LogoUploadFieldProps {
  companyName: string;
  logoUrl?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  label?: string;
}

export default function LogoUploadField({
  companyName,
  logoUrl,
  onChange,
  onRemove,
  label = "Company Logo / Avatar"
}: LogoUploadFieldProps) {
  const initials = companyName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-cream-secondary/40 border border-border-default rounded-xl font-sans">
      <div className="flex-shrink-0">
        {logoUrl ? (
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-border-strong bg-white shadow-2xs img-zoom-container">
            <img
              src={logoUrl}
              alt="Company Logo Preview"
              className="w-full h-full object-cover img-zoom"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-navy text-white flex items-center justify-center font-bold text-lg border border-white/10 shadow-2xs">
            {initials || "SE"}
          </div>
        )}
      </div>

      <div className="flex-1 w-full space-y-2">
        <MediaUploader
          label={label}
          currentImageUrl={logoUrl}
          onUploadSuccess={onChange}
          onRemove={onRemove}
          className="w-full"
        />
      </div>
    </div>
  );
}
