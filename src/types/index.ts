// ── Legacy / Shared Interfaces ───────────────────────────────────────────────

export interface SubCategory {
  id: string;
  name: string;
  description: string;
  supplierCount: number;
  activeBuyers: number;
  rfqsThisMonth: number;
  avgResponseTime: string;
  image: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  supplierCount: number;
  subCategories: SubCategory[];
}

export interface RFQQuote {
  id: string;
  supplier: Pick<Supplier, 'id' | 'companyName' | 'location' | 'isVerified' | 'reviewAvgScore'>;
  trustScore: number;
  quotePrice: number;
  quotePriceDisplay: string;
  moq: string;
  leadTime: string;
  responseTime: string;
  certifications: string[];
  isBestPrice: boolean;
}

export interface BuyerStats {
  savedSearches: number;
  shortlistedSuppliers: number;
  rfqsInProgress: number;
  quotesReceived: number;
  messages: number;
  ordersNegotiations: number;
}

export interface RFQStatusData {
  label: string;
  value: number;
  color: string;
}

export interface DashboardMessage {
  id: string;
  supplierName: string;
  preview: string;
  timestamp: string;
  unread: boolean;
}

export interface PriceAlert {
  id: string;
  commodity: string;
  price: string;
  change: number;
}

export interface MarketInsight {
  risingDemand: Array<{ topic: string; growthPercent: number }>;
  topSearchedItems: string[];
  popularCountries: Array<{ country: string; percent: number }>;
}

export interface RecentQuote {
  id: string;
  rfqTitle: string;
  quotesReceived: number;
  bestQuote: string;
  status: 'In Negotiation' | 'Quoted' | 'New' | 'Closed';
}

export interface BuyerDashboard {
  buyerName: string;
  company: string;
  lastLogin: string;
  stats: BuyerStats;
  rfqStatusData: RFQStatusData[];
  recentQuotes: RecentQuote[];
  messages: DashboardMessage[];
  priceAlerts: PriceAlert[];
  marketInsight: MarketInsight;
  verifiedEmail: string;
  role: string;
  purchaseAuthority: string;
  sourcingInterests: string[];
  industries: string[];
  memberSince: string;
}

export interface SolutionColumn {
  id: string;
  audience: string;
  icon: string;
  subtitle: string;
  problem: string;
  solution: string[];
  result: string;
  ctaLabel: string;
  ctaColor: string;
  features: Array<{ icon: string; label: string }>;
}

export interface RFQFormData {
  product: string;
  description: string;
  category: string;
  images: File[];
  quantity: string;
  unit: string;
  targetPrice: string;
  specifications: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
}

export interface SupplierFilterState {
  verifiedOnly: boolean;
  countries: string[];
  certifications: string[];
  responseRateMin: number;
  onTimeDeliveryMin: number;
  moq: string;
  productType: string;
  tradeAssurance: boolean;
}

export type SupplierTab = 'overview' | 'products' | 'certifications' | 'reviews' | 'activity';

export type BuyerSection =
  | 'overview'
  | 'saved-searches'
  | 'shortlisted-suppliers'
  | 'rfq-status'
  | 'quote-comparisons'
  | 'messages'
  | 'order-history'
  | 'price-alerts'
  | 'market-insights'
  | 'repeat-orders'
  | 'settings';


// ── Trust OS Platform Core Interfaces ─────────────────────────────────────────

export interface QualityScore {
  verificationScore: number;    // max 25
  certificationScore: number;   // max 20
  responseScore: number;        // max 20
  activityScore: number;        // max 10
  reputationScore: number;      // max 10
  auditQualityScore: number;    // max 15
  total: number;                // max 100
}

export interface AuditRecord {
  id: string;
  auditorName: string;
  auditDate: string;
  gpsCoordinates: string;
  documentsVerified: string[];
  findings: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  passed: boolean;
}

export interface VerifiedReview {
  id: string;
  buyerName: string;
  buyerRole: string;
  buyerCountry: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  category: string;
}

export interface AgentProfile {
  machineReadableName: string;
  sourcingApiEndpoint: string;
  supportedProtocols: string[];
  capabilitiesManifestUrl: string;
}

export interface StructuredProduct {
  id: string;
  name: string;
  description: string;
  moq: number;
  moqUnit: string;
  priceRange: string;
  leadTimeWeeks: number;
  sampleAvailable: boolean;
  specifications: Record<string, string>;
  photos: string[];
}

import { SellerType, VerificationTier } from './verification';
export * from './verification';

export interface SupplierLocation {
  city: string;
  state: string;
  country: string;
  gidcZone?: string;
  fullAddress: string;
  gpsCoordinates?: string;
}

export interface SupplierVerificationDetails {
  gstin?: string;
  iec?: string;
  auditorId?: string;
  verifiedUntil?: string;
  udyamNumber?: string;
  bankVerified?: boolean;
  bankVerifiedAt?: string;
}

export interface Supplier {
  // EXISTING (renamed/adapted for consistency)
  id: string;
  slug: string;
  companyName: string;
  phone?: string;
  isVerified: boolean;
  isDemo?: boolean;
  verificationTier: VerificationTier;
  sellerType: SellerType;
  verifiedDate?: string;
  verificationExpiryDate?: string;
  category: string; // matches Category name / ID
  subcategories: string[];
  location: SupplierLocation;
  products: string[]; // legacy list for compatibility
  certifications: string[];
  exportMarkets?: string[];
  legacyTrustScore?: number; // legacy score renamed
  verificationDetails?: SupplierVerificationDetails;
  auditRecords?: AuditRecord[];

  // NEW: Quality Score System
  qualityScore: QualityScore;
  qualityScoreLastComputed: string;

  // NEW: Response Metrics
  responseRate?: number;        // 0-100 percentage
  avgResponseTimeHours?: number; // average response time in hours
  lastActiveAt?: string;         // ISO date
  totalEnquiriesHandled?: number;
  verifiedConnectionsCount?: number;

  // NEW: Facility Evidence
  facilityVideoUrl?: string;
  facilityVideoDated?: string;

  // NEW: Buyer Review Data
  reviewCount: number;
  reviewAvgScore: number;
  reviews: VerifiedReview[];

  // NEW: Agent API Metadata
  agentProfile: AgentProfile;
  structuredProducts: StructuredProduct[];

  // NEW: Verification Gate State
  verificationGateState: 'unverified' | 'listed' | 'business_verified' | 'verified_supplier' | 'premium_audited' | 'expired' | 'suspended';
  badgeLifecycleState: 'issued' | 'active' | 'warning' | 'expired' | 'suspended' | 'revoked';

  // Legacy details used in existing components
  onTimeDelivery?: number;
  rating?: number;
  moq?: string;
  leadTime?: string;
  about?: string;
  employees?: string;
  yearEstablished?: number;
  annualTurnover?: string;
  annualCapacity?: string;
  exportShare?: string;
  factoryPhotos?: string[];
  
  // Media Fields
  logoUrl?: string;
  galleryUrls?: string[];
}

export interface BuyerProfile {
  id: string;
  userId: string;
  companyName: string;
  businessEmailDomain: string;   // verified, not free webmail
  country: string;
  industryCategories: string[];
  verificationTier: 0 | 1 | 2 | 3 | 4;
  authorityBand: '<10K' | '10K-50K' | '50K-500K' | '500K+';
  verifiedBuyer: boolean;
  authorityVerified: boolean;
  verifiedBuyerBadgeIssuedAt?: string;
  avatarUrl?: string;


  // Risk and quality metrics
  buyerRiskScore: number;
  rfqConversionRate?: number;
  rfqSpamScore?: number;

  // Activity
  totalRFQsPosted: number;
  totalEnquiriesSent: number;
  successfulConnections: number;
  lastActiveAt: string;
}

// ── Aartha Protect & Order Types ──────────────────────────────────────────

export type TradeAssuranceStatus =
  | 'awaiting_payment'    // Order created, waiting for buyer deposit
  | 'payment_confirmed'   // Payment captured via compliant payment partner (canonical)
  | 'funds_secured'       // Backwards-compatible alias for payment_confirmed
  | 'payment_failed'      // Payment failed at provider
  | 'in_production'       // Supplier confirmed order, manufacturing
  | 'shipped'             // Goods dispatched, tracking info uploaded
  | 'delivered'           // Buyer confirmed receipt
  | 'inspection_period'   // 7-day inspection window active
  | 'release_authorized'  // Release conditions satisfied, settlement queued
  | 'settlement_initiated'// Transfer to supplier initiated
  | 'settled'             // Funds settled to supplier bank account (canonical)
  | 'released'            // Backwards-compatible alias for settled
  | 'settlement_failed'   // Settlement issue requiring review
  | 'disputed'            // Buyer/supplier raised quality/delivery claim
  | 'partial_release'     // Dispute settlement split
  | 'refunded'            // Money refunded to buyer
  | 'cancelled';          // Order cancelled before fulfillment


export type OrderStatus =
  | 'draft'
  | 'pending_payment'
  | 'active'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'disputed'
  | 'cancelled';

export interface OrderLineItem {
  id: string;
  productName: string;
  specification: string;
  quantity: number;
  unitPrice: number;       // in paise (₹1 = 100 paise)
  totalPrice: number;      // in paise
}

export interface ShippingDetails {
  carrier: string;
  trackingId: string;
  estimatedDelivery: string;
  shippedAt: string;
  invoiceUrl?: string;
  packingListUrl?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  rfqId?: string;
  quoteId?: string;
  buyerEmail: string;
  buyerName: string;
  buyerCompany: string;
  supplierId: string;
  supplierSlug: string;
  supplierCompany: string;

  items: OrderLineItem[];
  subtotalAmount: number;    // in paise
  platformFeeAmount: number; // 3% commission in paise
  totalAmount: number;       // total payable in paise
  currency: 'INR' | 'USD';

  tradeAssuranceStatus: TradeAssuranceStatus;
  status: OrderStatus;

  // Canonical Artha Payment Orchestration Fields
  paymentIntentId?: string;
  providerName?: 'razorpay' | 'cashfree' | 'mock';
  providerOrderRef?: string;
  providerPaymentRef?: string;
  settlementInstructionId?: string;

  // External provider references (legacy aliases retained for backward compatibility)
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  shippingDetails?: ShippingDetails;
  inspectionPeriodDays: number;
  inspectionEndsAt?: string;

  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  releasedAt?: string;
  disputedAt?: string;
}

export interface TradeAssuranceDispute {
  id: string;
  orderId: string;
  raisedByRole: 'buyer' | 'supplier';
  raisedByEmail: string;
  reason: string;
  description: string;
  evidenceUrls: string[];
  status: 'open' | 'under_review' | 'resolved';
  resolution?: 'full_refund' | 'partial_refund' | 'release_to_supplier';
  resolvedAt?: string;
  mediatorNotes?: string;
  createdAt: string;
}


// ── Transaction Outcome Layer (Compounding Moat) ───────────────────────────

export type TransactionStage =
  | 'matched'
  | 'quoted'
  | 'sample_requested'
  | 'sample_accepted'
  | 'order_placed'
  | 'delivered'
  | 'repeat_order'
  | 'closed'
  | 'lost'
  | 'stalled';

export interface TransactionOutcome {
  id: string;
  rfqId: string;
  supplierId: string;
  supplierName?: string;
  buyerEmail?: string;
  buyerCompany?: string;
  stage: TransactionStage;
  quotedPrice?: number;
  currency?: string;
  responseTimeHours?: number;
  deliveryOnTime?: boolean;
  defectRateReported?: number;
  buyerRating?: number; // 1-5, only from confirmed transaction
  evidenceHash?: string;
  recordedAt: string; // ISO timestamp
  notes?: string;
}

export * from './organization';
export * from './evidence';
export * from './factory';
export * from './procurement';


