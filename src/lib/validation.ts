import { z } from 'zod';
import { isValidGSTINChecksum } from './gstinService';

const FREE_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'mail.com',
  'zoho.com',
  'protonmail.com',
  'yandex.com',
  'icloud.com',
];

export const isBusinessEmail = (email: string): boolean => {
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1].toLowerCase().trim();
  return !FREE_EMAIL_DOMAINS.includes(domain);
};

// Zod custom business email validation
export const businessEmailSchema = z.string()
  .email('Invalid email address format.')
  .refine(
    (email) => isBusinessEmail(email),
    { message: 'Free email addresses (Gmail, Yahoo, etc.) are not allowed. Please use your business email.' }
  );

// 1. RFQ Submission Schema (3 Steps combined)
export const rfqSchema = z.object({
  // Step 1: Product & Category
  product: z.string().min(3, 'Product name must be at least 3 characters.'),
  category: z.string().min(1, 'Please select a category.'),
  description: z.string().optional(),
  certifications: z.array(z.string()).default([]),

  // Step 2: Quantity & Specs
  quantity: z.string().min(1, 'Quantity is required.'),
  unit: z.string().min(1, 'Unit of measurement is required.'),
  targetPrice: z.string().optional(),
  timeline: z.enum(['Urgent', 'Standard', 'Long-term']),
  country: z.string().min(1, 'Destination country is required.'),
  samplesRequired: z.boolean().default(false),
  specificationsFile: z.any().optional(), // validated at file level if provided

  // Step 3: Buyer Details (for Guest flow)
  contactName: z.string().min(2, 'Contact name must be at least 2 characters.'),
  designation: z.string().min(2, 'Designation / job title is required.'),
  companyName: z.string().min(2, 'Company name is required.'),
  email: businessEmailSchema,
  phone: z.string().min(8, 'Phone number must be at least 8 digits.'),
  whatsapp: z.string().optional(),
});

// 2. Direct Supplier Enquiry Schema
export const enquirySchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1, 'Product name is required.'),
  quantity: z.string().min(1, 'Quantity is required.'),
  unit: z.string().min(1, 'Unit is required.'),
  targetPrice: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
  
  // Guest fields (if not logged in)
  contactName: z.string().min(2, 'Contact name must be at least 2 characters.'),
  companyName: z.string().min(2, 'Company name is required.'),
  email: businessEmailSchema,
  phone: z.string().min(8, 'Phone number is required.'),
  whatsapp: z.string().optional(),
});

// 3. Buyer Registration Schema
export const buyerRegistrationSchema = z.object({
  email: businessEmailSchema,
  password: z.string().min(15, 'Password must be at least 15 characters.'),
  confirmPassword: z.string().min(15, 'Please confirm your password.'),
  companyName: z.string().min(2, 'Company name is required.'),
  country: z.string().min(2, 'Country is required.'),
  industryCategories: z.array(z.string()).min(1, 'Select at least one industry of interest.'),
  contactName: z.string().min(2, 'Contact name is required.'),
  phone: z.string().min(8, 'Phone number is required.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

// 4. Supplier Onboarding Application Schema
export const supplierApplicationSchema = z.object({
  companyName: z.string().min(2, 'Company name is required.'),
  sellerType: z.enum([
    'direct_manufacturer',
    'contract_manufacturer',
    'brand_owner',
    'authorized_distributor',
    'trading_company',
    'wholesaler'
  ], { required_error: 'Please select your seller type.' }),
  gstin: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
      message: 'Invalid GSTIN format. Must match standard 15-character Indian pattern.',
    })
    .refine((val) => {
      return isValidGSTINChecksum(val);
    }, {
      message: 'GSTIN checksum verification failed. Please verify characters.',
    }),
  iec: z.string()
    .length(10, 'IEC must be exactly 10 digits.')
    .regex(/^[0-9]+$/, 'IEC must be numeric.')
    .optional()
    .or(z.literal('')),
  city: z.string().min(2, 'City is required.'),
  gidcZone: z.string().optional(),
  fullAddress: z.string().min(10, 'Full factory address is required.'),
  category: z.string().min(1, 'Primary category is required.'),
  subcategories: z.array(z.string()).min(1, 'Select at least one subcategory.'),
  certifications: z.array(z.string()).default([]),
  contactName: z.string().min(2, 'Contact person name is required.'),
  email: businessEmailSchema,
  phone: z.string().min(8, 'Contact phone number is required.'),
  whatsapp: z.string().min(8, 'WhatsApp number is required.'),
  preferredVisitDate: z.string().optional().or(z.literal('')),
});
