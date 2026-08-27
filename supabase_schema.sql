-- ============================================================================
-- Aartha — Production Supabase PostgreSQL Schema
-- ============================================================================
-- Run this in your Supabase SQL Editor to initialize all database tables,
-- indexes, and Row Level Security (RLS) policies for the Aartha Platform.
-- ============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('buyer', 'supplier', 'admin')),
    "contactName" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    phone TEXT,
    gstin TEXT,
    "isVerified" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT,
    "supplierId" TEXT,
    "supplierSlug" TEXT,
    email TEXT,
    "companyName" TEXT,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 3. RFQs Table
CREATE TABLE IF NOT EXISTS rfqs (
    id TEXT PRIMARY KEY,
    product TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    quantity TEXT NOT NULL,
    unit TEXT NOT NULL,
    "targetPrice" TEXT,
    specifications TEXT,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    country TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    "submittedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    whatsapp TEXT,
    "buyerVerificationTier" TEXT
);

-- 4. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "sellerType" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    gstin TEXT NOT NULL,
    iec TEXT,
    category TEXT NOT NULL,
    subcategories TEXT[],
    certifications TEXT[],
    city TEXT NOT NULL,
    "gidcZone" TEXT,
    "fullAddress" TEXT NOT NULL,
    "preferredVisitDate" TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    "submittedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enquiries Table
CREATE TABLE IF NOT EXISTS enquiries (
    id TEXT PRIMARY KEY,
    "supplierId" TEXT,
    "supplierSlug" TEXT,
    "productName" TEXT NOT NULL,
    quantity TEXT NOT NULL,
    unit TEXT NOT NULL,
    "targetPrice" TEXT,
    message TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    "submittedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    "actorRole" TEXT,
    "actorId" TEXT
);

-- 7. OTPs Table
CREATE TABLE IF NOT EXISTS otps (
    email TEXT PRIMARY KEY,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0
);

-- 8. Orders Table (Aartha Protect)
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    "poNumber" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerCompany" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "supplierSlug" TEXT NOT NULL,
    "supplierCompany" TEXT NOT NULL,
    items JSONB NOT NULL,
    "subtotalAmount" BIGINT NOT NULL,
    "platformFeeAmount" BIGINT NOT NULL,
    "totalAmount" BIGINT NOT NULL,
    currency TEXT NOT NULL,
    "tradeAssuranceStatus" TEXT NOT NULL,
    status TEXT NOT NULL,
    "providerPaymentRef" TEXT,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "paymentIntent" JSONB,
    "shippingDetails" JSONB,
    "inspectionPeriodDays" INTEGER DEFAULT 7,
    "inspectionEndsAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "paidAt" TIMESTAMP WITH TIME ZONE,
    "shippedAt" TIMESTAMP WITH TIME ZONE,
    "deliveredAt" TIMESTAMP WITH TIME ZONE,
    "releasedAt" TIMESTAMP WITH TIME ZONE,
    "disputedAt" TIMESTAMP WITH TIME ZONE
);

-- 9. Disputes Table
CREATE TABLE IF NOT EXISTS disputes (
    id TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "raisedByRole" TEXT NOT NULL,
    "raisedByEmail" TEXT NOT NULL,
    reason TEXT NOT NULL,
    description TEXT NOT NULL,
    "evidenceUrls" TEXT[],
    status TEXT NOT NULL DEFAULT 'open',
    resolution TEXT,
    "resolvedAt" TIMESTAMP WITH TIME ZONE,
    "mediatorNotes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    "companyName" TEXT NOT NULL,
    phone TEXT,
    "isVerified" BOOLEAN DEFAULT FALSE,
    "is_demo" BOOLEAN DEFAULT FALSE,
    "verificationTier" TEXT NOT NULL,
    "sellerType" TEXT NOT NULL,
    "verifiedDate" TEXT,
    "verificationExpiryDate" TEXT,
    category TEXT NOT NULL,
    subcategories TEXT[],
    location JSONB NOT NULL,
    products TEXT[],
    certifications TEXT[],
    "exportMarkets" TEXT[],
    "verificationDetails" JSONB,
    "auditRecords" JSONB,
    "qualityScore" JSONB NOT NULL,
    "qualityScoreLastComputed" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "responseRate" INTEGER,
    "avgResponseTimeHours" NUMERIC,
    "lastActiveAt" TEXT,
    "totalEnquiriesHandled" INTEGER,
    "verifiedConnectionsCount" INTEGER,
    "facilityVideoUrl" TEXT,
    "facilityVideoDated" TEXT,
    "reviewCount" INTEGER DEFAULT 0,
    "reviewAvgScore" NUMERIC DEFAULT 0,
    reviews JSONB,
    "agentProfile" JSONB,
    "structuredProducts" JSONB,
    "verificationGateState" TEXT,
    "badgeLifecycleState" TEXT,
    "onTimeDelivery" INTEGER,
    rating NUMERIC,
    moq TEXT,
    "leadTime" TEXT,
    about TEXT,
    employees TEXT,
    "yearEstablished" INTEGER,
    "annualTurnover" TEXT,
    "annualCapacity" TEXT,
    "exportShare" TEXT,
    "factoryPhotos" TEXT[],
    "logoUrl" TEXT,
    "galleryUrls" TEXT[]
);

-- 11. Transaction Outcomes Table (Compounding Moat)
CREATE TABLE IF NOT EXISTS transaction_outcomes (
    id TEXT PRIMARY KEY,
    "rfqId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "supplierName" TEXT,
    "buyerEmail" TEXT,
    "buyerCompany" TEXT,
    stage TEXT NOT NULL,
    "quotedPrice" NUMERIC,
    currency TEXT DEFAULT 'INR',
    "responseTimeHours" NUMERIC,
    "deliveryOnTime" BOOLEAN,
    "defectRateReported" NUMERIC,
    "buyerRating" INTEGER CHECK ("buyerRating" BETWEEN 1 AND 5),
    "evidenceHash" TEXT,
    "recordedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- 12. Deals Table (Deal Room)
CREATE TABLE IF NOT EXISTS deals (
    id TEXT PRIMARY KEY,
    buyer_org_id TEXT,
    buyer_email TEXT,
    supplier_id TEXT,
    rfq_id TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    terms JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Deal Events Table
CREATE TABLE IF NOT EXISTS deal_events (
    id TEXT PRIMARY KEY,
    deal_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    actor_id TEXT,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Transaction Events Table (Immutable SHA256 Ledger Stream)
CREATE TABLE IF NOT EXISTS transaction_events (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    deal_id TEXT,
    event_type TEXT NOT NULL,
    actor TEXT NOT NULL,
    provider_event_id TEXT,
    idempotency_key TEXT UNIQUE NOT NULL,
    previous_state TEXT,
    new_state TEXT,
    payload_hash TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    rating INTEGER,
    role TEXT,
    problems TEXT[],
    comments TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Performance Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions("expiresAt");
CREATE INDEX IF NOT EXISTS idx_rfqs_email ON rfqs(email);
CREATE INDEX IF NOT EXISTS idx_suppliers_slug ON suppliers(slug);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders("buyerEmail");
CREATE INDEX IF NOT EXISTS idx_orders_supplier ON orders("supplierId");
CREATE INDEX IF NOT EXISTS idx_outcomes_rfq ON transaction_outcomes("rfqId");
CREATE INDEX IF NOT EXISTS idx_outcomes_supplier ON transaction_outcomes("supplierId");
CREATE INDEX IF NOT EXISTS idx_outcomes_stage ON transaction_outcomes(stage);
CREATE INDEX IF NOT EXISTS idx_deals_rfq ON deals("rfq_id");
CREATE INDEX IF NOT EXISTS idx_deals_supplier ON deals("supplier_id");
CREATE INDEX IF NOT EXISTS idx_deal_events_deal ON deal_events(deal_id);
CREATE INDEX IF NOT EXISTS idx_tx_events_order ON transaction_events(order_id);
CREATE INDEX IF NOT EXISTS idx_tx_events_idempotency ON transaction_events(idempotency_key);

-- ============================================================================
-- Row-Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 1. Suppliers Table: Publicly viewable by all
DROP POLICY IF EXISTS "Public suppliers are readable by everyone" ON suppliers;
CREATE POLICY "Public suppliers are readable by everyone" ON suppliers
    FOR SELECT USING (true);

-- 2. RFQs: Public create, read restricted to owner/admin
DROP POLICY IF EXISTS "Anyone can submit RFQ" ON rfqs;
CREATE POLICY "Anyone can submit RFQ" ON rfqs
    FOR INSERT WITH CHECK (true);

-- 3. Applications: Public create
DROP POLICY IF EXISTS "Anyone can apply for verification" ON applications;
CREATE POLICY "Anyone can apply for verification" ON applications
    FOR INSERT WITH CHECK (true);

-- 4. Enquiries: Public create
DROP POLICY IF EXISTS "Anyone can send enquiry" ON enquiries;
CREATE POLICY "Anyone can send enquiry" ON enquiries
    FOR INSERT WITH CHECK (true);

-- 5. Feedback: Public create
DROP POLICY IF EXISTS "Anyone can submit feedback" ON feedback;
CREATE POLICY "Anyone can submit feedback" ON feedback
    FOR INSERT WITH CHECK (true);

-- 6. Role Permissions & Privileges (PostgREST API Roles)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

