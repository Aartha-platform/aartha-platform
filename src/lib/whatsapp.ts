export const DEFAULT_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+91 72084 32138';

export type WhatsAppSource = 
  | 'supplier_onboarding'
  | 'supplier_directory'
  | 'rfq_expedite'
  | 'buyer_support'
  | 'feedback'
  | 'homepage'
  | 'general';

export const WHATSAPP_TEMPLATES: Record<WhatsAppSource, string> = {
  supplier_onboarding: 'Hello Aartha, I want to list my manufacturing company on Aartha.\n\nCompany Name:\nCity:\nCategory:',
  supplier_directory: 'Hello Aartha, I am browsing the manufacturer directory and need assistance connecting with a verified factory.',
  rfq_expedite: 'Hello Aartha, I have an active sourcing requirement and need priority manufacturer quotes.\n\nRequirement:\nQuantity:',
  buyer_support: 'Hello Aartha, I am a global buyer looking for verified manufacturers for our procurement needs.',
  feedback: 'Hello Aartha, I have product feedback or a feature suggestion for the platform.',
  homepage: 'Hello Aartha, I would like to learn more about the verified manufacturing corridor.',
  general: 'Hello Aartha, I would like to connect with your sourcing and trade team.',
};

/**
 * Generates a clean, centralized WhatsApp Click-to-Chat URL with contextual messaging and source tracking.
 */
export function getWhatsAppUrl(
  source: WhatsAppSource = 'general',
  customMessage?: string,
  customNumber?: string
): string {
  const number = (customNumber || DEFAULT_WHATSAPP_NUMBER).replace(/[^\d+]/g, '');
  const message = customMessage || WHATSAPP_TEMPLATES[source] || WHATSAPP_TEMPLATES.general;
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encodedText}`;
}
