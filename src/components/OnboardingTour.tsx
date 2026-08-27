'use client';

import React from 'react';
import OnboardingWalkthrough from './OnboardingWalkthrough';

interface OnboardingTourProps {
  role: 'buyer' | 'supplier';
}

const buyerSteps = [
  {
    title: 'Sourcing Control Center',
    description: 'Welcome to your Aartha Dashboard! Track all your active RFQs, supplier matches, and procurement files in one unified workspace.',
  },
  {
    title: 'Verified Supply Routing',
    description: 'View manufacturer cards complete with physical audit summaries, GPS coordinates, and verified quality scores—all ranked by quality rather than ad spend.',
  },
  {
    title: 'Document OCR Validation',
    description: 'Upload your packing lists, bills of lading, and certificates to scan for customs-readiness using our AI-powered Document Intelligence tool.',
  },
  {
    title: 'Buyer Verification Tiers',
    description: 'Advance from Tier 2 to Tier 3/4 by declaring your sourcing authority. Verified buyers receive priority routing and 4x faster replies from top factories.',
  },
];

const supplierSteps = [
  {
    title: 'Verified Supplier Workspace',
    description: 'Welcome! This is where you receive inquiries directly from global procurement teams with verified buyer intent.',
  },
  {
    title: 'Buyer Quality Signals',
    description: 'Every RFQ details the buyer\'s sourcing budget and verified tier status. No more wasted hours responding to unqualified leads.',
  },
  {
    title: 'Response Speed Tracker',
    description: 'Track your response times. Suppliers who reply within 4 hours maintain high trust scores and receive top ranking in search results.',
  },
  {
    title: 'Media & Certificate Manager',
    description: 'Upload your plant photos and compliance certificates (WHO-GMP, ISO, GOTS) to keep your verified status active and unlock Premium badges.',
  },
];

export default function OnboardingTour({ role }: OnboardingTourProps) {
  const steps = role === 'buyer' ? buyerSteps : supplierSteps;
  
  return <OnboardingWalkthrough tourKey={role} steps={steps} />;
}
