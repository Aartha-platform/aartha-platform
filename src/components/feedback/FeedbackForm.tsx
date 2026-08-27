"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCategory } from './CategorySelector';
import FeedbackProgress from './FeedbackProgress';
import StepContext from './StepContext';
import StepProblems from './StepProblems';
import StepFeatures from './StepFeatures';
import StepPriority from './StepPriority';
import ThankYou from './ThankYou';
import { FeedbackSubmissionInput } from '@/types/feedback';

interface FeedbackFormProps {
  initialCategory: UserCategory;
  onBackToCategory: () => void;
}

export default function FeedbackForm({ initialCategory, onBackToCategory }: FeedbackFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FeedbackSubmissionInput>({
    userCategory: initialCategory,
    industry: '',
    companySize: '',
    problemDescription: '',
    currentTools: '',
    painPoints: [],
    featureRequests: '',
    documentStruggles: [],
    missingServices: '',
    urgency: 'medium',
    willingnessToPay: '',
    additionalNotes: '',
    contactInfo: '',
    source: 'dock',
  });

  const updateFormData = (fields: Partial<FeedbackSubmissionInput>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    if (step === 1) {
      onBackToCategory();
    } else {
      setStep((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      let result: any = null;
      try {
        result = await response.json();
      } catch {
        result = { error: 'Invalid server response' };
      }

      if (response.ok && result?.success) {
        setReferenceId(result.referenceId);
      } else {
        alert(result?.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Network error. Failed to connect to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      userCategory: initialCategory,
      industry: '',
      companySize: '',
      problemDescription: '',
      currentTools: '',
      painPoints: [],
      featureRequests: '',
      documentStruggles: [],
      missingServices: '',
      urgency: 'medium',
      willingnessToPay: '',
      additionalNotes: '',
      contactInfo: '',
      source: 'dock',
    });
    setReferenceId(null);
    setStep(1);
  };

  if (referenceId) {
    return <ThankYou referenceId={referenceId} onReset={handleReset} />;
  }

  // Animation variants for tab transitions
  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-6">
      <FeedbackProgress currentStep={step} totalSteps={4} />

      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-gold/20 shadow-premium mt-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <StepContext
                data={{
                  userCategory: formData.userCategory,
                  industry: formData.industry,
                  companySize: formData.companySize,
                }}
                updateData={updateFormData}
                onNext={handleNext}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <StepProblems
                data={{
                  problemDescription: formData.problemDescription,
                  currentTools: formData.currentTools,
                  painPoints: formData.painPoints,
                }}
                updateData={updateFormData}
                onNext={handleNext}
                onBack={handleBack}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <StepFeatures
                data={{
                  featureRequests: formData.featureRequests,
                  documentStruggles: formData.documentStruggles,
                  missingServices: formData.missingServices,
                }}
                updateData={updateFormData}
                onNext={handleNext}
                onBack={handleBack}
              />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <StepPriority
                data={{
                  urgency: formData.urgency,
                  willingnessToPay: formData.willingnessToPay,
                  additionalNotes: formData.additionalNotes,
                  contactInfo: formData.contactInfo,
                }}
                updateData={updateFormData}
                onSubmit={handleSubmit}
                onBack={handleBack}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
