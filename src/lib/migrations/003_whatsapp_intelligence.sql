-- ============================================================================
-- Aartha WhatsApp Intelligence System — Database Migration
-- Run this in Supabase SQL Editor
-- ============================================================================

-- 1. WhatsApp Contacts (Lead Registry)
CREATE TABLE IF NOT EXISTS whatsapp_contacts (
    id TEXT PRIMARY KEY,
    phone_number TEXT NOT NULL,
    display_name TEXT,
    user_type TEXT DEFAULT 'unknown' CHECK (user_type IN ('manufacturer', 'buyer', 'agent', 'unknown')),
    source_page TEXT,
    consent_status TEXT DEFAULT 'IMPLICIT' CHECK (consent_status IN ('IMPLICIT', 'CONSENTED', 'OPTED_OUT')),
    consent_timestamp TIMESTAMP WITH TIME ZONE,
    linked_user_id TEXT,
    industry TEXT,
    city TEXT,
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_contacts_phone ON whatsapp_contacts(phone_number);

-- 2. WhatsApp Conversations (Lead Pipeline Tracker)
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
    id TEXT PRIMARY KEY,
    contact_id TEXT NOT NULL REFERENCES whatsapp_contacts(id),
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_conv_contact ON whatsapp_conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_wa_conv_stage ON whatsapp_conversations(lead_stage);

-- 3. WhatsApp Messages (Immutable Message Log)
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES whatsapp_conversations(id),
    provider_message_id TEXT UNIQUE,
    direction TEXT NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'template', 'interactive', 'reaction')),
    content TEXT NOT NULL,
    status TEXT DEFAULT 'received' CHECK (status IN ('received', 'sent', 'delivered', 'read', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_msg_conv ON whatsapp_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_wa_msg_provider ON whatsapp_messages(provider_message_id);

-- 4. Feedback Insights (AI-Extracted Problem Taxonomy)
CREATE TABLE IF NOT EXISTS feedback_insights (
    id TEXT PRIMARY KEY,
    conversation_id TEXT REFERENCES whatsapp_conversations(id),
    feedback_id TEXT,
    analysis_status TEXT DEFAULT 'PENDING' CHECK (analysis_status IN (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fi_category ON feedback_insights(primary_category);
CREATE INDEX IF NOT EXISTS idx_fi_status ON feedback_insights(analysis_status);

-- 5. Problem Clusters (Aggregated Pattern Detection)
CREATE TABLE IF NOT EXISTS feedback_problem_clusters (
    id TEXT PRIMARY KEY,
    problem_category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    frequency INTEGER DEFAULT 1,
    affected_users INTEGER DEFAULT 1,
    trend TEXT DEFAULT 'stable' CHECK (trend IN ('rising', 'stable', 'declining')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    last_detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. OTPs Table (if not already created)
CREATE TABLE IF NOT EXISTS otps (
    email TEXT PRIMARY KEY,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0
);

-- Enable RLS on all new tables
ALTER TABLE whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_problem_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE otps ENABLE ROW LEVEL SECURITY;
