-- ======================================================================
-- ARTHA CORRIDOR — PRODUCTION DATABASE SCHEMA MIGRATION 001
-- PostgreSQL / Supabase Schema (P0 Production Core)
-- ======================================================================

-- 1. Organizations & Access Control
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN ('buyer', 'supplier', 'operator')),
    country VARCHAR(100) DEFAULT 'India',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'buyer_member',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_members (
    id VARCHAR(64) PRIMARY KEY,
    org_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL CHECK (role IN ('buyer_admin', 'buyer_member', 'supplier_admin', 'supplier_member', 'artha_operator', 'artha_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (org_id, user_id)
);

CREATE TABLE IF NOT EXISTS sessions (
    token VARCHAR(512) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id VARCHAR(64) REFERENCES organizations(id) ON DELETE SET NULL,
    role VARCHAR(32) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Supplier Domain Model (Split Architecture)
CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(64) PRIMARY KEY,
    org_id VARCHAR(64) REFERENCES organizations(id) ON DELETE SET NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    phone VARCHAR(32),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_tier VARCHAR(32) NOT NULL DEFAULT 'listed' CHECK (verification_tier IN ('listed', 'business_verified', 'verified_supplier', 'premium_audited')),
    seller_type VARCHAR(32) NOT NULL DEFAULT 'direct_manufacturer' CHECK (seller_type IN ('direct_manufacturer', 'authorized_distributor', 'trading_company', 'oem')),
    is_demo BOOLEAN DEFAULT FALSE,
    quality_score JSONB DEFAULT '{"total": 70, "verificationScore": 0, "certificationScore": 0, "responseScore": 0, "activityScore": 0, "reputationScore": 0, "auditQualityScore": 0}'::jsonb,
    response_rate INT DEFAULT 85,
    avg_response_time_hours NUMERIC(6, 2) DEFAULT 6.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS legal_entities (
    id VARCHAR(64) PRIMARY KEY,
    supplier_id VARCHAR(64) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    gstin VARCHAR(15) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    cin VARCHAR(32),
    iec VARCHAR(32),
    udyam_number VARCHAR(64),
    registered_address TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    source VARCHAR(64) DEFAULT 'gst_portal',
    checked_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS factory_sites (
    id VARCHAR(64) PRIMARY KEY,
    supplier_id VARCHAR(64) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT 'Gujarat',
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    gps VARCHAR(64),
    gidc_zone VARCHAR(100),
    site_type VARCHAR(32) NOT NULL DEFAULT 'manufacturing' CHECK (site_type IN ('manufacturing', 'warehouse', 'office')),
    floor_area_sq_ft INT,
    operating_status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS capabilities (
    id VARCHAR(64) PRIMARY KEY,
    factory_site_id VARCHAR(64) NOT NULL REFERENCES factory_sites(id) ON DELETE CASCADE,
    supplier_id VARCHAR(64) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    process VARCHAR(128) NOT NULL,
    material VARCHAR(128),
    product_family VARCHAR(128),
    tolerance VARCHAR(64),
    dimensions VARCHAR(128),
    capacity_per_month NUMERIC(12, 2),
    moq NUMERIC(12, 2),
    lead_time_weeks INT,
    evidence_id VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS machines (
    id VARCHAR(64) PRIMARY KEY,
    factory_site_id VARCHAR(64) NOT NULL REFERENCES factory_sites(id) ON DELETE CASCADE,
    supplier_id VARCHAR(64) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(128),
    count INT NOT NULL DEFAULT 1,
    precision_tolerance VARCHAR(64),
    year_installed INT,
    status VARCHAR(32) DEFAULT 'operational',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Evidence, Documents, Certifications & Audits
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL,
    owner_type VARCHAR(32) NOT NULL,
    doc_type VARCHAR(64) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    checksum VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'uploaded',
    extracted_fields JSONB DEFAULT '[]'::jsonb,
    assertions JSONB DEFAULT '[]'::jsonb,
    exceptions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evidence (
    id VARCHAR(64) PRIMARY KEY,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    claim TEXT NOT NULL,
    evidence_type VARCHAR(32) NOT NULL CHECK (evidence_type IN ('physical_audit', 'document', 'registry_api', 'transaction_history', 'self_declared')),
    source VARCHAR(255) NOT NULL,
    document_id VARCHAR(64) REFERENCES documents(id) ON DELETE SET NULL,
    captured_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    verified_by VARCHAR(64),
    confidence INT NOT NULL DEFAULT 100 CHECK (confidence >= 0 AND confidence <= 100),
    status VARCHAR(32) NOT NULL DEFAULT 'verified' CHECK (status IN ('self_declared', 'extracted', 'validated', 'verified', 'expired', 'suspended')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certifications (
    id VARCHAR(64) PRIMARY KEY,
    supplier_id VARCHAR(64) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    cert_type VARCHAR(64) NOT NULL,
    issuer VARCHAR(128) NOT NULL,
    cert_number VARCHAR(128) NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    scope TEXT,
    document_id VARCHAR(64) REFERENCES documents(id) ON DELETE SET NULL,
    verification_status VARCHAR(32) DEFAULT 'verified',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audits (
    id VARCHAR(64) PRIMARY KEY,
    supplier_id VARCHAR(64) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    factory_site_id VARCHAR(64) REFERENCES factory_sites(id) ON DELETE SET NULL,
    auditor_id VARCHAR(64),
    auditor_name VARCHAR(255) NOT NULL,
    audit_date DATE NOT NULL,
    gps_coordinates VARCHAR(64),
    findings TEXT NOT NULL,
    grade VARCHAR(8) NOT NULL CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
    passed BOOLEAN NOT NULL DEFAULT TRUE,
    documents_verified TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Buyer Profiles & RFQ Commerce Core
CREATE TABLE IF NOT EXISTS buyers (
    id VARCHAR(64) PRIMARY KEY,
    org_id VARCHAR(64) REFERENCES organizations(id) ON DELETE SET NULL,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    business_email_domain VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    verification_tier INT DEFAULT 1,
    authority_band VARCHAR(32) DEFAULT '10K-50K',
    risk_score INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rfqs (
    id VARCHAR(64) PRIMARY KEY,
    buyer_org_id VARCHAR(64) REFERENCES organizations(id) ON DELETE SET NULL,
    buyer_user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'needs_clarification', 'qualified', 'matching', 'matched', 'closed', 'cancelled')),
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL,
    raw_requirement TEXT NOT NULL,
    quantity VARCHAR(64) NOT NULL,
    target_delivery VARCHAR(64),
    target_price VARCHAR(64),
    currency VARCHAR(16) DEFAULT 'INR',
    destination VARCHAR(128) NOT NULL,
    incoterm VARCHAR(32) DEFAULT 'FOB',
    required_certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
    required_process VARCHAR(128),
    material VARCHAR(128),
    tolerance VARCHAR(64),
    drawings TEXT[] DEFAULT ARRAY[]::TEXT[],
    clarification_history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rfq_requirements (
    id VARCHAR(64) PRIMARY KEY,
    rfq_id VARCHAR(64) NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    key VARCHAR(128) NOT NULL,
    value TEXT NOT NULL,
    source VARCHAR(32) NOT NULL DEFAULT 'user_provided' CHECK (source IN ('user_provided', 'extracted', 'confirmed', 'uncertain')),
    confidence INT DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rfq_matches (
    id VARCHAR(64) PRIMARY KEY,
    rfq_id VARCHAR(64) NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    supplier_id VARCHAR(64) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    score INT NOT NULL CHECK (score >= 0 AND score <= 100),
    confidence_level VARCHAR(16) NOT NULL DEFAULT 'high' CHECK (confidence_level IN ('high', 'medium', 'low')),
    hard_constraints_passed BOOLEAN NOT NULL DEFAULT TRUE,
    reasons TEXT[] DEFAULT ARRAY[]::TEXT[],
    evidence_reasons JSONB DEFAULT '[]'::jsonb,
    missing_evidence TEXT[] DEFAULT ARRAY[]::TEXT[],
    risks TEXT[] DEFAULT ARRAY[]::TEXT[],
    why_recommended TEXT[] DEFAULT ARRAY[]::TEXT[],
    why_not_others TEXT[] DEFAULT ARRAY[]::TEXT[],
    status VARCHAR(32) NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'shortlisted', 'rejected', 'contacted')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotes (
    id VARCHAR(64) PRIMARY KEY,
    rfq_id VARCHAR(64) NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    supplier_id VARCHAR(64) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    quote_price NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(16) DEFAULT 'INR',
    moq VARCHAR(64),
    lead_time_days INT,
    validity_date DATE,
    notes TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'accepted', 'rejected', 'negotiating')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shortlists (
    id VARCHAR(64) PRIMARY KEY,
    buyer_org_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
    rfq_id VARCHAR(64) NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    supplier_id VARCHAR(64) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (buyer_org_id, rfq_id, supplier_id)
);

-- 5. Deal Room & Order Lifecycle Architecture
CREATE TABLE IF NOT EXISTS deals (
    id VARCHAR(64) PRIMARY KEY,
    buyer_org_id VARCHAR(64) REFERENCES organizations(id) ON DELETE SET NULL,
    supplier_id VARCHAR(64) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    rfq_id VARCHAR(64) NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    quote_id VARCHAR(64) REFERENCES quotes(id) ON DELETE SET NULL,
    order_id VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'qualification' CHECK (status IN ('qualification', 'matching', 'supplier_contacted', 'sample', 'negotiation', 'ordered', 'production', 'inspection', 'shipping', 'delivered', 'disputed', 'closed', 'lost')),
    requirements_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    evidence_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    commercial_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deal_events (
    id VARCHAR(64) PRIMARY KEY,
    deal_id VARCHAR(64) NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL,
    actor VARCHAR(128) NOT NULL,
    previous_state VARCHAR(32),
    new_state VARCHAR(32),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id VARCHAR(64) PRIMARY KEY,
    po_number VARCHAR(64) UNIQUE NOT NULL,
    deal_id VARCHAR(64) REFERENCES deals(id) ON DELETE SET NULL,
    buyer_org_id VARCHAR(64) REFERENCES organizations(id) ON DELETE SET NULL,
    supplier_id VARCHAR(64) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    rfq_id VARCHAR(64) REFERENCES rfqs(id) ON DELETE SET NULL,
    quote_id VARCHAR(64) REFERENCES quotes(id) ON DELETE SET NULL,
    subtotal_amount NUMERIC(14, 2) NOT NULL,
    platform_fee_amount NUMERIC(14, 2) NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(16) DEFAULT 'INR',
    trade_assurance_status VARCHAR(32) NOT NULL DEFAULT 'awaiting_payment',
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    razorpay_order_id VARCHAR(128),
    razorpay_payment_id VARCHAR(128),
    shipping_details JSONB,
    inspection_period_days INT DEFAULT 7,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    specification TEXT,
    quantity NUMERIC(12, 2) NOT NULL,
    unit_price NUMERIC(14, 2) NOT NULL,
    total_price NUMERIC(14, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transaction_events (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    deal_id VARCHAR(64) REFERENCES deals(id) ON DELETE SET NULL,
    event_type VARCHAR(64) NOT NULL,
    actor VARCHAR(128) NOT NULL,
    provider_event_id VARCHAR(128),
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    previous_state VARCHAR(64),
    new_state VARCHAR(64),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_events (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    provider VARCHAR(64) NOT NULL DEFAULT 'razorpay',
    event_id VARCHAR(128) UNIQUE NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    signature VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    is_reconciled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipments (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    carrier VARCHAR(128) NOT NULL,
    tracking_id VARCHAR(128) NOT NULL,
    shipped_at TIMESTAMPTZ NOT NULL,
    estimated_delivery TIMESTAMPTZ,
    invoice_url TEXT,
    packing_list_url TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'in_transit',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inspections (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    deal_id VARCHAR(64) REFERENCES deals(id) ON DELETE SET NULL,
    inspector_name VARCHAR(255) NOT NULL,
    inspection_date DATE NOT NULL,
    findings TEXT NOT NULL,
    grade VARCHAR(8) NOT NULL CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
    passed BOOLEAN NOT NULL DEFAULT TRUE,
    report_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS disputes (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    deal_id VARCHAR(64) REFERENCES deals(id) ON DELETE SET NULL,
    raised_by_role VARCHAR(32) NOT NULL CHECK (raised_by_role IN ('buyer', 'supplier')),
    raised_by_user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    reason VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    evidence_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    status VARCHAR(32) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved')),
    resolution VARCHAR(32),
    resolved_at TIMESTAMPTZ,
    mediator_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Outcomes, Performance, Security & Observability
CREATE TABLE IF NOT EXISTS transaction_outcomes (
    id VARCHAR(64) PRIMARY KEY,
    rfq_id VARCHAR(64) NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    supplier_id VARCHAR(64) NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    buyer_org_id VARCHAR(64) REFERENCES organizations(id) ON DELETE SET NULL,
    stage VARCHAR(32) NOT NULL,
    quoted_price NUMERIC(14, 2),
    currency VARCHAR(16) DEFAULT 'INR',
    response_time_hours NUMERIC(6, 2),
    delivery_on_time BOOLEAN,
    defect_rate_reported NUMERIC(6, 3),
    buyer_rating INT CHECK (buyer_rating >= 1 AND buyer_rating <= 5),
    evidence_hash VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_performance (
    id VARCHAR(64) PRIMARY KEY,
    supplier_id VARCHAR(64) UNIQUE NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    total_rfqs_received INT DEFAULT 0,
    response_rate INT DEFAULT 85,
    avg_response_time_hours NUMERIC(6, 2) DEFAULT 6.0,
    quote_acceptance_rate NUMERIC(5, 2) DEFAULT 0.0,
    sample_pass_rate NUMERIC(5, 2) DEFAULT 0.0,
    total_orders_completed INT DEFAULT 0,
    on_time_delivery_rate NUMERIC(5, 2) DEFAULT 0.0,
    defect_rate NUMERIC(5, 2) DEFAULT 0.0,
    dispute_rate NUMERIC(5, 2) DEFAULT 0.0,
    repeat_order_rate NUMERIC(5, 2) DEFAULT 0.0,
    last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fraud_cases (
    id VARCHAR(64) PRIMARY KEY,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    risk_score INT NOT NULL,
    rating VARCHAR(32) NOT NULL,
    signals JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'open',
    reviewed_by VARCHAR(64),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor VARCHAR(128) NOT NULL,
    action VARCHAR(128) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    ip_address VARCHAR(64),
    before_state JSONB,
    after_state JSONB,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(64) PRIMARY KEY,
    org_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) NOT NULL,
    prefix VARCHAR(32) NOT NULL,
    name VARCHAR(128) NOT NULL,
    scopes TEXT[] DEFAULT ARRAY['read:suppliers', 'create:rfq']::TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. High-Performance Indexes
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_buyer_org ON rfqs(buyer_org_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_slug ON suppliers(slug);
CREATE INDEX IF NOT EXISTS idx_legal_entities_gstin ON legal_entities(gstin);
CREATE INDEX IF NOT EXISTS idx_capabilities_supplier ON capabilities(supplier_id);
CREATE INDEX IF NOT EXISTS idx_evidence_entity ON evidence(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_deals_buyer_org ON deals(buyer_org_id);
CREATE INDEX IF NOT EXISTS idx_deals_supplier ON deals(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_deal ON purchase_orders(deal_id);
CREATE INDEX IF NOT EXISTS idx_transaction_events_order ON transaction_events(order_id);
CREATE INDEX IF NOT EXISTS idx_transaction_events_idempotency ON transaction_events(idempotency_key);

-- ======================================================================
-- 8. Row-Level Security (RLS) Multi-Tenant Defense-in-Depth
-- ======================================================================

-- Enable RLS on sensitive multi-tenant tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 8.1 Service Role / Admin Bypass Policy (Supabase backend services have full access)
CREATE POLICY service_role_all_organizations ON organizations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_users ON users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_org_members ON organization_members FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_rfqs ON rfqs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_deals ON deals FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_deal_events ON deal_events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_purchase_orders ON purchase_orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_transaction_events ON transaction_events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_evidence ON evidence FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_documents ON documents FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_disputes ON disputes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_audit_logs ON audit_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_api_keys ON api_keys FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_notifications ON notifications FOR ALL USING (auth.role() = 'service_role');

-- 8.2 Tenant Isolation Policies for Authenticated Users (JWT auth.uid() matching)
-- RFQs: Buyer organization members can read/write their own RFQs
CREATE POLICY buyer_rfq_isolation ON rfqs FOR ALL 
    USING (buyer_org_id IN (
        SELECT org_id FROM organization_members WHERE user_id = auth.uid()::text
    ));

-- Deals: Only participating buyer or supplier organization members can access the Deal Room
CREATE POLICY deal_participant_isolation ON deals FOR ALL
    USING (
        buyer_org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid()::text)
        OR supplier_id IN (
            SELECT s.id FROM suppliers s 
            JOIN organization_members om ON s.org_id = om.org_id 
            WHERE om.user_id = auth.uid()::text
        )
    );

-- Purchase Orders: Only matched buyer or supplier can view or update purchase orders
CREATE POLICY po_participant_isolation ON purchase_orders FOR ALL
    USING (
        buyer_email = auth.email()
        OR supplier_id IN (
            SELECT s.id FROM suppliers s 
            JOIN organization_members om ON s.org_id = om.org_id 
            WHERE om.user_id = auth.uid()::text
        )
    );

-- Documents: Private documents accessible only by owning entity or authorized deal participants
CREATE POLICY document_tenant_isolation ON documents FOR ALL
    USING (
        entity_id IN (
            SELECT org_id FROM organization_members WHERE user_id = auth.uid()::text
        )
        OR is_public = TRUE
    );

-- Notifications: Users only see notifications targeted to their user_id or org_id
CREATE POLICY user_notifications_isolation ON notifications FOR ALL
    USING (
        user_id = auth.uid()::text 
        OR org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid()::text)
    );

