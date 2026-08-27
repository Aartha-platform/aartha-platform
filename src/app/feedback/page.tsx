import { Metadata } from 'next';
import FeedbackPortalClient from '@/components/feedback/FeedbackPortalClient';

export const metadata: Metadata = {
  title: 'Aartha Product Discovery — Share Sourcing & Trade Feedback',
  description: 'Help us build a better B2B industrial corridor. Share your feedback, workflow pain points, and feature requests anonymously with Aartha.',
  keywords: ['B2B trade', 'feedback', 'industrial sourcing', 'product discovery', 'manufacturing pain points', 'RFQ', 'Gujarat GIDC'],
  openGraph: {
    title: 'Aartha Product Discovery — Share Sourcing & Trade Feedback',
    description: 'Help us build a better B2B industrial corridor. Share your feedback, workflow pain points, and feature requests anonymously with Aartha.',
    type: 'website',
  }
};

export default function FeedbackPage() {
  return <FeedbackPortalClient />;
}
