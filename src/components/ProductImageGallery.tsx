"use client";

import React, { useRef, useState } from 'react';
import { Upload, X, Star, ArrowLeft, ArrowRight, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ProductImage {
  id: string;
  url: string;
  isCover: boolean;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  maxImages?: number;
  label?: string;
}

export default function ProductImageGallery({
  images,
  onChange,
  maxImages = 6,
  label = "Product Listings Gallery"
}: ProductImageGalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fileList = Array.from(e.target.files);

    if (images.length + fileList.length > maxImages) {
      setError(`Maximum limit is ${maxImages} images. Only the first few files were added.`);
    } else {
      setError(null);
    }

    const newImages: ProductImage[] = [];
    fileList.slice(0, maxImages - images.length).forEach((file, index) => {
      if (file.size > 5 * 1024 * 1024) {
        setError(`Some files were too large and skipped (Max 5MB).`);
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      newImages.push({
        id: Math.random().toString(36).substr(2, 9),
        url: previewUrl,
        isCover: images.length === 0 && index === 0, // make first one cover if gallery is empty
      });
    });

    onChange([...images, ...newImages]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (id: string) => {
    const updated = images.filter(img => img.id !== id);
    // If we removed the cover image, promote the first remaining one to cover
    if (updated.length > 0 && !updated.some(img => img.isCover)) {
      updated[0].isCover = true;
    }
    onChange(updated);
  };

  const makeCover = (id: string) => {
    const updated = images.map(img => ({
      ...img,
      isCover: img.id === id
    }));
    onChange(updated);
  };

  const moveIndex = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    onChange(newImages);
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="flex justify-between items-center border-b border-border-default pb-1.5">
        <span className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">
          {label} ({images.length}/{maxImages})
        </span>
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 bg-navy hover:bg-navy-light text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer select-none"
          >
            <Upload size={12} /> Add Photos
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFiles}
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {images.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border-strong hover:border-gold hover:bg-cream-secondary/15 rounded-xl py-8 px-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[140px] bg-white"
        >
          <ImageIcon className="w-8 h-8 text-text-muted mb-2" />
          <span className="text-xs font-bold text-navy">No products uploaded yet</span>
          <span className="text-[10px] text-text-muted mt-0.5">Click here to upload product list visuals (Max {maxImages})</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className={`relative rounded-xl border overflow-hidden aspect-square bg-cream-secondary shadow-2xs group hover-lift ${
                img.isCover ? 'border-gold ring-1 ring-gold/20' : 'border-border-strong'
              }`}
            >
              <img
                src={img.url}
                alt={`Product ${idx}`}
                className="w-full h-full object-cover img-zoom"
              />

              {img.isCover && (
                <span className="absolute top-2 left-2 bg-gold text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs z-10">
                  Main Photo
                </span>
              )}

              {/* Hover Overlay Controls */}
              <div className="absolute inset-0 bg-navy/55 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col justify-between p-2">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="p-1 bg-trust-red-bg hover:bg-trust-red text-trust-red hover:text-white rounded-md transition-colors cursor-pointer"
                    title="Remove Image"
                  >
                    <X size={12} />
                  </button>
                </div>

                <div className="flex justify-between items-center gap-1">
                  <div className="flex gap-1">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => moveIndex(idx, 'left')}
                        className="p-1 bg-white/80 hover:bg-white text-navy rounded-md transition-colors cursor-pointer"
                        title="Move Left"
                      >
                        <ArrowLeft size={10} />
                      </button>
                    )}
                    {idx < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveIndex(idx, 'right')}
                        className="p-1 bg-white/80 hover:bg-white text-navy rounded-md transition-colors cursor-pointer"
                        title="Move Right"
                      >
                        <ArrowRight size={10} />
                      </button>
                    )}
                  </div>

                  {!img.isCover && (
                    <button
                      type="button"
                      onClick={() => makeCover(img.id)}
                      className="p-1 bg-gold/90 hover:bg-gold text-white rounded-md transition-colors flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-wide cursor-pointer"
                    >
                      <Star size={8} fill="currentColor" /> Cover
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-trust-red text-[10px] font-bold mt-1 bg-trust-red-bg p-2 rounded-lg border border-trust-red/10 animate-slide-in">
          <AlertCircle size={12} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
