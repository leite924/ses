-- SES Email Marketing System Schema (Supabase Migration - Multi-tenant)

-- Table for Leads (Contacts)
CREATE TABLE IF NOT EXISTS marketing_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(studio_id, email)
);

-- Table for Lists (Segmentation)
CREATE TABLE IF NOT EXISTS marketing_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Relation Leads <-> Lists
CREATE TABLE IF NOT EXISTS marketing_list_leads (
    list_id UUID REFERENCES marketing_lists(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES marketing_leads(id) ON DELETE CASCADE,
    PRIMARY KEY (list_id, lead_id)
);

-- Table for Templates
CREATE TABLE IF NOT EXISTS marketing_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content_html TEXT NOT NULL,
    content_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for Campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_id UUID REFERENCES marketing_templates(id),
    list_id UUID REFERENCES marketing_lists(id),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'failed')),
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    total_recipients INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    complaint_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for System Settings (AWS Credentials, etc. - Per Studio)
CREATE TABLE IF NOT EXISTS marketing_settings (
    studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    is_secret BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (studio_id, key)
);

-- Enable RLS
ALTER TABLE marketing_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_list_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_settings ENABLE ROW LEVEL SECURITY;

-- Note: These policies assume a function or check exists to verify user access to the studio.
-- For now, we'll use a placeholder logic that should be refined based on the project's actual auth structure.
CREATE POLICY "Users can access their studio leads" ON marketing_leads
    FOR ALL TO authenticated USING (studio_id IN (SELECT studio_id FROM user_roles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their studio lists" ON marketing_lists
    FOR ALL TO authenticated USING (studio_id IN (SELECT studio_id FROM user_roles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their studio marketing_list_leads" ON marketing_list_leads
    FOR ALL TO authenticated USING (
        list_id IN (SELECT id FROM marketing_lists WHERE studio_id IN (SELECT studio_id FROM user_roles WHERE user_id = auth.uid()))
    );

CREATE POLICY "Users can access their studio templates" ON marketing_templates
    FOR ALL TO authenticated USING (studio_id IN (SELECT studio_id FROM user_roles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their studio campaigns" ON marketing_campaigns
    FOR ALL TO authenticated USING (studio_id IN (SELECT studio_id FROM user_roles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their studio settings" ON marketing_settings
    FOR ALL TO authenticated USING (studio_id IN (SELECT studio_id FROM user_roles WHERE user_id = auth.uid()));
