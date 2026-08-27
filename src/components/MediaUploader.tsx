"use client";

import React, { useRef, useState } from 'react';
import { Upload, X, AlertCircle, FileImage } from 'lucide-react';

interface MediaUploaderProps {
  label?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  onUploadSuccess: (url: string) => void;
  onRemove?: () => void;
  currentImageUrl?: string;
  className?: string;
}

export default function MediaUploader({
  label = "Upload Image",
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  onUploadSuccess,
  onRemove,
  currentImageUrl,
  className = ""
}: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: FileList) => {
    if (files.length === 0) return;
    const file = files[0];

    // Validate type
    if (!acceptedTypes.includes(file.type)) {
      setError(`Unsupported file type. Please upload ${acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}.`);
      return;
    }

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File is too large. Maximum size allowed is ${maxSizeMB}MB.`);
      return;
    }

    setError(null);
    // Create object URL for local preview
    const previewUrl = URL.createObjectURL(file);
    onUploadSuccess(previewUrl);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-2 font-sans ${className}`}>
      {label && (
        <span className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">
          {label}
        </span>
      )}

      {currentImageUrl ? (
        <div className="relative group rounded-xl overflow-hidden border border-border-strong bg-cream-secondary/40 aspect-square flex items-center justify-center shadow-2xs transition-all duration-200">
          <img
            src={currentImageUrl}
            alt="Preview"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
          />
          <div className="absolute inset-0 bg-navy/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={triggerInput}
              className="bg-white hover:bg-cream text-navy font-bold text-[10px] px-3 py-1.5 rounded-lg border border-border-default shadow-xs cursor-pointer"
            >
              Replace
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={handleClear}
                className="bg-trust-red-bg hover:bg-trust-red/10 text-trust-red font-bold text-[10px] px-3 py-1.5 rounded-lg border border-trust-red/20 shadow-xs cursor-pointer"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={triggerInput}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[140px] bg-white ${
            isDragActive
              ? 'border-gold bg-cream-secondary/50'
              : 'border-border-strong hover:border-gold hover:bg-cream-secondary/10'
          }`}
        >
          <Upload className={`w-6 h-6 mb-2 transition-colors ${isDragActive ? 'text-gold' : 'text-text-muted'}`} />
          <span className="text-xs font-bold text-navy">Drag image here or click to browse</span>
          <span className="text-[10px] text-text-muted mt-1">Supports PNG, JPG or WEBP up to {maxSizeMB}MB</span>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept={acceptedTypes.join(',')}
        className="hidden"
      />

      {error && (
        <div className="flex items-center gap-1.5 text-trust-red text-[10px] font-bold mt-1 bg-trust-red-bg p-2 rounded-lg border border-trust-red/10">
          <AlertCircle size={12} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
