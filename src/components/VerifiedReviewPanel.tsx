"use client";

import { Star, ShieldAlert, BadgeCheck } from 'lucide-react';
import { VerifiedReview } from '@/types';

interface VerifiedReviewPanelProps {
  reviews: VerifiedReview[];
  reviewCount: number;
  companyName: string;
}

export default function VerifiedReviewPanel({ reviews, reviewCount, companyName }: VerifiedReviewPanelProps) {
  const hasSufficientReviews = reviewCount >= 3 && reviews && reviews.length >= 3;

  return (
    <div className="space-y-5 font-sans text-text-primary">
      {/* Trust Notice Banner */}
      <div className="bg-navy/5 border border-border-default rounded-xl p-4 flex gap-3 text-xs leading-relaxed">
        <BadgeCheck size={20} className="text-gold flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="font-bold uppercase tracking-wider text-navy text-[10px]">Verified Sourcing Reviews Only</h5>
          <p className="text-text-secondary">
            Every review shown on this platform is verified-purchase only. Only buyers with confirmed communications, geotracked match agreements, or finalized orders facilitated by Aartha are permitted to submit evaluations. Minimum threshold of 3 verified reviews must be met before reviews are published.
          </p>
        </div>
      </div>

      {/* Main Reviews Block */}
      {hasSufficientReviews ? (
        <div className="grid grid-cols-1 gap-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white border border-border-default rounded-xl p-4.5 space-y-3 shadow-2xs hover:border-gold/20 transition-all">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} className={i < rev.rating ? 'text-gold fill-gold' : 'text-border-strong'} />
                  ))}
                </div>
                <span className="text-[10px] text-text-muted font-mono">{rev.date}</span>
              </div>
              
              <p className="text-xs text-text-secondary leading-relaxed font-medium">
                "{rev.comment}"
              </p>

              <div className="text-[10px] text-text-muted font-bold flex justify-between items-center border-t border-border-default/30 pt-2">
                <span>{rev.buyerRole} @ {rev.buyerName}</span>
                <span className="uppercase tracking-wider font-sans text-[9px]">{rev.buyerCountry} · verified buyer</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border-strong rounded-2xl p-12 text-center bg-white/40 space-y-3">
          <ShieldAlert size={28} className="text-text-muted/60 mx-auto" />
          <div className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Insufficient Review Data
          </div>
          <p className="text-[10px] text-text-muted leading-relaxed max-w-sm mx-auto">
            This plant ({companyName}) currently has {reviewCount} verified reviews. Aartha guidelines require a minimum of **3 verified reviews** to prevent rating manipulation and artificial score inflation. Reviews will remain hidden until the threshold is met.
          </p>
        </div>
      )}
    </div>
  );
}
