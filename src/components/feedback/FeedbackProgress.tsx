"use client";

import React from 'react';

interface FeedbackProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function FeedbackProgress({ currentStep, totalSteps }: FeedbackProgressProps) {
  const steps = [
    { label: 'Context', desc: 'About you' },
    { label: 'Problems', desc: 'Your pain points' },
    { label: 'Solutions', desc: 'Desired features' },
    { label: 'Priority', desc: 'Help us prioritize' }
  ];

  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-8">
      {/* Mobile progress bar view */}
      <div className="md:hidden flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <span>Step {currentStep} of {totalSteps}</span>
          <span className="text-gold">{steps[currentStep - 1].label}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-gold transition-all duration-300 ease-out rounded-full" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Desktop step indicator view */}
      <div className="hidden md:flex items-center justify-between relative mt-4">
        {/* Connection line background */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 rounded-full" />
        
        {/* Connection line progress */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-gold -translate-y-1/2 z-0 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = currentStep > stepNum;
          const isActive = currentStep === stepNum;

          return (
            <div key={idx} className="flex flex-col items-center relative z-10 select-none">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                  isCompleted 
                    ? 'bg-gold border-gold text-white shadow-md' 
                    : isActive 
                      ? 'bg-white dark:bg-[var(--surface)] border-gold text-gold shadow-premium-lg scale-110 ring-4 ring-gold/20' 
                      : 'bg-white dark:bg-[var(--surface)] border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                }`}
              >
                {isCompleted ? '✓' : stepNum}
              </div>
              <div className="mt-2 text-center">
                <span className={`block text-[10px] uppercase font-black tracking-wider transition-colors duration-300 ${
                  isActive ? 'text-gold' : isCompleted ? 'text-navy dark:text-white' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {step.label}
                </span>
                <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                  {step.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
