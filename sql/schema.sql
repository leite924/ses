-- SES Email Marketing System Schema

-- Table for Leads (Contacts)
CREATE TABLE IF NOT EXISTS marketing_leads (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active', -- active, unsubscribed, bounced
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Lists (Segmentation)
CREATE TABLE IF NOT EXISTS marketing_lists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Relation Leads <-> Lists
CREATE TABLE IF NOT EXISTS marketing_list_leads (
    list_id INTEGER REFERENCES marketing_lists(id) ON DELETE CASCADE,
    lead_id INTEGER REFERENCES marketing_leads(id) ON DELETE CASCADE,
    PRIMARY KEY (list_id, lead_id)
);

-- Table for Templates
CREATE TABLE IF NOT EXISTS marketing_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content_html TEXT NOT NULL,
    content_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    template_id INTEGER REFERENCES marketing_templates(id),
    list_id INTEGER REFERENCES marketing_lists(id),
    status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, sending, completed, failed
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    total_recipients INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    complaint_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for System Settings (AWS Credentials, etc.)
CREATE TABLE IF NOT EXISTS marketing_settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    is_secret BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial Settings Placeholders
INSERT INTO marketing_settings (key, value, is_secret) VALUES 
('aws_region', 'us-east-1', FALSE),
('aws_access_key_id', '', TRUE),
('aws_secret_access_key', '', TRUE),
('from_email', '', FALSE)
ON CONFLICT (key) DO NOTHING;
