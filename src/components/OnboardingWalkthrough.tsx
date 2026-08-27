'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';

interface Step {
  title: string;
  description: string;
}

interface OnboardingWalkthroughProps {
  tourKey: string;
  steps: Step[];
}

export default function OnboardingWalkthrough({ tourKey, steps }: OnboardingWalkthroughProps) {
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(`artha-onboarding-${tourKey}`);
    if (!completed) {
      setShow(true);
    }
  }, [tourKey]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`artha-onboarding-${tourKey}`, 'true');
    setShow(false);
  };

  if (!show) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-navy/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
      <div className="bg-white border border-border-default rounded-2xl w-full max-w-sm p-6 space-y-6 shadow-xl relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={handleComplete}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary cursor-pointer transition-colors"
        >
          <X size={16} />
        </button>

        {/* Step Indicator */}
        <div className="flex gap-1.5 items-center">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'w-6 bg-gold' : 'w-2 bg-border-strong/50'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="text-[10px] text-gold font-bold uppercase tracking-wider">
            Step {currentStep + 1} of {steps.length}
          </div>
          <h3 className="font-bold text-sm uppercase tracking-wide text-navy">{step.title}</h3>
          <p className="text-xs text-text-secondary leading-relaxed">{step.description}</p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleNext}
          className="w-full bg-navy hover:bg-navy-light text-white text-xs font-bold py-2.5 rounded-lg transition-colors cursor-pointer select-none flex items-center justify-center gap-1.5"
        >
          {currentStep === steps.length - 1 ? (
            <>
              <span>Get Started</span>
              <Check size={14} />
            </>
          ) : (
            <>
              <span>Next Step</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
