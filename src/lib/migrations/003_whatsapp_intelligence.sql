-- ============================================================================
-- Aartha Production Migration: WhatsApp Intelligence & Lead Engine (v2)
-- Architecture: Hardened Postgres with UUIDs, Idempotency, RLS, & Raw Event Sinks
-- ============================================================================

-- Ensure pgcrypto / uuid extensions are available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Automated updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Raw Webhook Events Log (High-throughput Idempotency Sink)
CREATE TABLE IF NOT EXISTS whatsapp_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processing_status TEXT DEFAULT 'PENDING' CHECK (processing_status IN ('PENDING', 'PROCESSED', 'FAILED', 'IGNORED')),
    error_message TEXT,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_wa_events_provider ON whatsapp_events(provider_event_id);
CREATE INDEX IF NOT EXISTS idx_wa_events_status ON whatsapp_events(processing_status);

-- 2. WhatsApp Contacts (Normalized E.164 Lead Registry)
CREATE TABLE IF NOT EXISTS whatsapp_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT UNIQUE NOT NULL, -- Normalized E.164 without '+' (e.g. 917208432138)
    display_name TEXT,
    company_name TEXT,
    user_type TEXT DEFAULT 'unknown' CHECK (user_type IN ('manufacturer', 'buyer', 'agent', 'unknown')),
    source_page TEXT,
    consent_status TEXT DEFAULT 'USER_INITIATED' CHECK (consent_status IN (
        'UNKNOWN', 'CONTACTED_MANUALLY', 'USER_INITIATED', 'OPTED_IN', 'OPTED_OUT'
    )),
    consent_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    linked_user_id TEXT,
    industry TEXT,
    city TEXT,
    notes TEXT,
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_contacts_phone ON whatsapp_contacts(phone_number);
CREATE INDEX IF NOT EXISTS idx_wa_contacts_type ON whatsapp_contacts(user_type);
CREATE INDEX IF NOT EXISTS idx_wa_contacts_consent ON whatsapp_contacts(consent_status);

CREATE TRIGGER trg_wa_contacts_updated_at
BEFORE UPDATE ON whatsapp_contacts
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- 3. WhatsApp Conversations (Thread & Pipeline Lifecycle)
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES whatsapp_contacts(id) ON DELETE RESTRICT,
    lead_stage TEXT DEFAULT 'NEW' CHECK (lead_stage IN (
        'NEW', 'DISCOVERY', 'PROBLEM_IDENTIFIED', 'QUALIFIED',
        'ACCOUNT_CREATED', 'PROFILE_INCOMPLETE', 'PROFILE_ACTIVE',
        'ENGAGED', 'CLOSED', 'OPTED_OUT'
    )),
    source_page TEXT,
    assigned_to TEXT,
    last_customer_message_at TIMESTAMP WITH TIME ZONE,
    message_count INTEGER DEFAULT 0,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_conv_contact ON whatsapp_conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_wa_conv_stage ON whatsapp_conversations(lead_stage);

CREATE TRIGGER trg_wa_conv_updated_at
BEFORE UPDATE ON whatsapp_conversations
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- 4. WhatsApp Messages (Immutable Message Stream)
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE RESTRICT,
    provider_message_id TEXT UNIQUE NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'template', 'interactive', 'reaction', 'system')),
    content TEXT NOT NULL,
    status TEXT DEFAULT 'received' CHECK (status IN ('received', 'sent', 'delivered', 'read', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_msg_conv ON whatsapp_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_wa_msg_provider ON whatsapp_messages(provider_message_id);
CREATE INDEX IF NOT EXISTS idx_wa_msg_direction ON whatsapp_messages(direction);

-- 5. Feedback Insights (AI-Assisted Qualitative Product Intelligence)
CREATE TABLE IF NOT EXISTS feedback_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES whatsapp_conversations(id) ON DELETE SET NULL,
    feedback_id TEXT,
    analysis_status TEXT DEFAULT 'ANALYZED' CHECK (analysis_status IN (
        'PENDING', 'ANALYZED', 'REVIEWED', 'ACKNOWLEDGED',
        'INVESTIGATING', 'PLANNED', 'RESOLVED', 'NOT_ACTIONABLE'
    )),
    primary_category TEXT NOT NULL,
    secondary_categories TEXT[],
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral', 'mixed')),
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    summary TEXT,
    confidence REAL DEFAULT 0.0,
    user_pain_points TEXT[],
    competitors_mentioned TEXT[],
    feature_requests TEXT[],
    raw_evidence TEXT,
    suggested_product_opportunity TEXT,
    analyzed_by TEXT DEFAULT 'heuristic',
    reviewed_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fi_category ON feedback_insights(primary_category);
CREATE INDEX IF NOT EXISTS idx_fi_status ON feedback_insights(analysis_status);

CREATE TRIGGER trg_fi_updated_at
BEFORE UPDATE ON feedback_insights
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- 6. Problem Clusters (Aggregated Product Bottlenecks)
CREATE TABLE IF NOT EXISTS feedback_problem_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_category TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    frequency INTEGER DEFAULT 1,
    affected_users INTEGER DEFAULT 1,
    trend TEXT DEFAULT 'stable' CHECK (trend IN ('rising', 'stable', 'declining')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    last_detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER trg_fpc_updated_at
BEFORE UPDATE ON feedback_problem_clusters
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — DEFAULT DENY FOR PUBLIC / SERVICE ROLE ACCESS
-- ============================================================================

ALTER TABLE whatsapp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_problem_clusters ENABLE ROW LEVEL SECURITY;

-- Explicit Service Role bypass policy (Next.js server-side backend operations)
CREATE POLICY "Service Role Full Access: whatsapp_events" ON whatsapp_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access: whatsapp_contacts" ON whatsapp_contacts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access: whatsapp_conversations" ON whatsapp_conversations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access: whatsapp_messages" ON whatsapp_messages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access: feedback_insights" ON feedback_insights FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access: feedback_problem_clusters" ON feedback_problem_clusters FOR ALL TO service_role USING (true) WITH CHECK (true);
