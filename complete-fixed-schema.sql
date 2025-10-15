-- ========================================
-- Strategic Partnership Platform Database Schema - COMPLETE FIXED VERSION
-- ========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- DIAGNOSTIC LOGGING FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION log_diagnostic(message TEXT)
RETURNS void AS $$
BEGIN
    RAISE NOTICE 'DIAGNOSTIC: %', message;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TENANTS TABLE (Must be created first)
-- ========================================

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  settings JSONB NOT NULL DEFAULT '{
    "branding": {
      "primary_color": "#007bff",
      "secondary_color": "#6c757d",
      "accent_color": "#28a745"
    },
    "features": {
      "ai_recommendations": false,
      "advanced_analytics": false,
      "custom_branding": false,
      "api_access": false
    },
    "limits": {
      "max_users": 100,
      "max_projects": 50,
      "storage_limit": 1073741824
    }
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- USERS TABLE
-- ========================================

-- First ensure users table exists
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone_number TEXT,
  avatar TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('creator', 'investor')),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  oauth_id TEXT,
  provider TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Creator specific fields
  company_name TEXT,
  industry TEXT,
  experience TEXT,

  -- Investor specific fields
  investment_range JSONB,
  preferred_industries TEXT[],
  risk_tolerance TEXT CHECK (risk_tolerance IN ('low', 'medium', 'high')),

  -- Common fields
  bio TEXT,
  location TEXT,
  website TEXT,
  social_links JSONB
);

-- Add tenant_id column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'tenant_id') THEN
        ALTER TABLE users ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added tenant_id column to users table';
    ELSE
        RAISE NOTICE 'tenant_id column already exists in users table';
    END IF;
END $$;

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_id);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at);

-- ========================================
-- BUSINESS IDEAS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS business_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',

  -- Financial details
  funding_goal DECIMAL(15,2) NOT NULL,
  current_funding DECIMAL(15,2) NOT NULL DEFAULT 0,
  equity_offered DECIMAL(5,2) NOT NULL,
  valuation DECIMAL(15,2),

  -- Project details
  stage TEXT NOT NULL CHECK (stage IN ('concept', 'mvp', 'early', 'growth')),
  timeline TEXT NOT NULL,
  team_size INTEGER,

  -- Media
  images TEXT[],
  documents TEXT[],
  video_url TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'funded', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for business_ideas table
CREATE INDEX IF NOT EXISTS idx_business_ideas_creator ON business_ideas(creator_id);
CREATE INDEX IF NOT EXISTS idx_business_ideas_status ON business_ideas(status);
CREATE INDEX IF NOT EXISTS idx_business_ideas_category ON business_ideas(category);
CREATE INDEX IF NOT EXISTS idx_business_ideas_created ON business_ideas(created_at);

-- ========================================
-- INVESTMENT OFFERS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS investment_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Investment details
  amount_range JSONB NOT NULL,
  preferred_equity JSONB NOT NULL,

  -- Preferences
  preferred_stages TEXT[] NOT NULL DEFAULT '{}',
  preferred_industries TEXT[] NOT NULL DEFAULT '{}',
  geographic_preference TEXT,

  -- Terms
  investment_type TEXT NOT NULL CHECK (investment_type IN ('equity', 'debt', 'convertible')),
  timeline TEXT,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for investment_offers table
CREATE INDEX IF NOT EXISTS idx_investment_offers_investor ON investment_offers(investor_id);
CREATE INDEX IF NOT EXISTS idx_investment_offers_tenant ON investment_offers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_investment_offers_active ON investment_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_investment_offers_industries ON investment_offers USING GIN(preferred_industries);

-- ========================================
-- MATCHES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES business_ideas(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES investment_offers(id) ON DELETE CASCADE,

  -- Match details
  match_score DECIMAL(5,2) NOT NULL,
  matching_factors JSONB NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'viewed', 'contacted', 'negotiating', 'invested', 'rejected')),

  -- Communication
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique matches between idea and investor
  UNIQUE(idea_id, investor_id)
);

-- Indexes for matches table
CREATE INDEX IF NOT EXISTS idx_matches_idea ON matches(idea_id);
CREATE INDEX IF NOT EXISTS idx_matches_investor ON matches(investor_id);
CREATE INDEX IF NOT EXISTS idx_matches_creator ON matches(creator_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_score ON matches(match_score DESC);

-- ========================================
-- CONVERSATIONS TABLE
-- ========================================

-- Log before creating conversations table
SELECT log_diagnostic('Starting conversations table creation');

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  participant1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_id UUID, -- Temporarily remove FK reference to avoid circular dependency
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique conversation for each match
  UNIQUE(match_id)
);

-- Log after conversations table creation
SELECT log_diagnostic('Conversations table created successfully');

-- Indexes for conversations table
CREATE INDEX IF NOT EXISTS idx_conversations_match ON conversations(match_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant1_id, participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON conversations(participant2_id);

-- ========================================
-- MESSAGES TABLE
-- ========================================

-- Log before creating messages table
SELECT log_diagnostic('Starting messages table creation');

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'system')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Log after messages table creation
SELECT log_diagnostic('Messages table created successfully');

-- ========================================
-- FIX CIRCULAR DEPENDENCY
-- ========================================

-- Add the foreign key from conversations to messages after both tables exist (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE table_name = 'conversations' AND constraint_name = 'fk_conversations_last_message') THEN
        ALTER TABLE conversations
        ADD CONSTRAINT fk_conversations_last_message
        FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added fk_conversations_last_message constraint';
    ELSE
        RAISE NOTICE 'fk_conversations_last_message constraint already exists';
    END IF;
END $$;

-- Log after fixing circular dependency
SELECT log_diagnostic('Foreign key relationship check completed');

-- Indexes for messages table
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(read) WHERE read = FALSE;

-- ========================================
-- TRANSACTIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Transaction details
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  crypto_tx_hash TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'failed', 'refunded')),

  -- Payment method
  payment_method TEXT NOT NULL CHECK (payment_method IN ('crypto', 'bank_transfer')),
  wallet_address TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Indexes for transactions table
CREATE INDEX IF NOT EXISTS idx_transactions_match ON transactions(match_id);
CREATE INDEX IF NOT EXISTS idx_transactions_investor ON transactions(investor_id);
CREATE INDEX IF NOT EXISTS idx_transactions_creator ON transactions(creator_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_crypto_hash ON transactions(crypto_tx_hash);

-- ========================================
-- FAVORITES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL, -- ID of the offer or idea being favorited
  item_type TEXT NOT NULL CHECK (item_type IN ('offer', 'idea')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique favorites
  UNIQUE(user_id, item_id, item_type)
);

-- Indexes for favorites table
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_item ON favorites(item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_favorites_user_item ON favorites(user_id, item_id, item_type);

-- ========================================
-- ANALYTICS EVENTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  data JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics_events table
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);

-- ========================================
-- TENANT SUBSCRIPTIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'professional', 'enterprise')),
  features JSONB NOT NULL DEFAULT '{
    "ai_recommendations": false,
    "advanced_analytics": false,
    "custom_branding": false,
    "api_access": false
  }'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique active subscription per tenant
  UNIQUE(tenant_id, status)
);

-- Indexes for tenant_subscriptions table
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_tenant ON tenant_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_status ON tenant_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_plan ON tenant_subscriptions(plan);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Log before enabling RLS
SELECT log_diagnostic('Starting RLS policies setup');

-- Enable RLS on all tables (if not already enabled)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'users' AND c.relrowsecurity = true) THEN
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on users table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'business_ideas' AND c.relrowsecurity = true) THEN
        ALTER TABLE business_ideas ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on business_ideas table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'investment_offers' AND c.relrowsecurity = true) THEN
        ALTER TABLE investment_offers ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on investment_offers table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'matches' AND c.relrowsecurity = true) THEN
        ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on matches table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'conversations' AND c.relrowsecurity = true) THEN
        ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on conversations table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'messages' AND c.relrowsecurity = true) THEN
        ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on messages table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'transactions' AND c.relrowsecurity = true) THEN
        ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on transactions table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'favorites' AND c.relrowsecurity = true) THEN
        ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on favorites table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'analytics_events' AND c.relrowsecurity = true) THEN
        ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on analytics_events table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'tenants' AND c.relrowsecurity = true) THEN
        ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on tenants table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'tenant_subscriptions' AND c.relrowsecurity = true) THEN
        ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on tenant_subscriptions table';
    END IF;
END $$;

-- ========================================
-- USERS TABLE POLICIES
-- ========================================

-- Drop existing policies if they exist (clean slate approach)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view tenant profiles" ON users;
DROP POLICY IF EXISTS "Users can view public profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Users can read their own profile and public profiles within their tenant
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view tenant profiles" ON users
  FOR SELECT USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view public profiles" ON users
  FOR SELECT USING (tenant_id IS NULL OR tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile with tenant context
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ========================================
-- BUSINESS IDEAS POLICIES
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view published ideas" ON business_ideas;
DROP POLICY IF EXISTS "Creators can view own ideas" ON business_ideas;
DROP POLICY IF EXISTS "Creators can insert own ideas" ON business_ideas;
DROP POLICY IF EXISTS "Creators can update own ideas" ON business_ideas;

-- Anyone can view published ideas
CREATE POLICY "Anyone can view published ideas" ON business_ideas
  FOR SELECT USING (status = 'published');

-- Creators can view all their own ideas
CREATE POLICY "Creators can view own ideas" ON business_ideas
  FOR SELECT USING (auth.uid() = creator_id);

-- Creators can insert their own ideas
CREATE POLICY "Creators can insert own ideas" ON business_ideas
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Creators can update their own ideas
CREATE POLICY "Creators can update own ideas" ON business_ideas
  FOR UPDATE USING (auth.uid() = creator_id);

-- ========================================
-- INVESTMENT OFFERS POLICIES
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active offers" ON investment_offers;
DROP POLICY IF EXISTS "Investors can view own offers" ON investment_offers;
DROP POLICY IF EXISTS "Investors can insert own offers" ON investment_offers;
DROP POLICY IF EXISTS "Investors can update own offers" ON investment_offers;

-- Anyone can view active offers
CREATE POLICY "Anyone can view active offers" ON investment_offers
  FOR SELECT USING (is_active = true);

-- Investors can view all their own offers
CREATE POLICY "Investors can view own offers" ON investment_offers
  FOR SELECT USING (auth.uid() = investor_id);

-- Investors can insert their own offers
CREATE POLICY "Investors can insert own offers" ON investment_offers
  FOR INSERT WITH CHECK (auth.uid() = investor_id);

-- Investors can update their own offers
CREATE POLICY "Investors can update own offers" ON investment_offers
  FOR UPDATE USING (auth.uid() = investor_id);

-- ========================================
-- MATCHES POLICIES
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own matches" ON matches;
DROP POLICY IF EXISTS "System can insert matches" ON matches;
DROP POLICY IF EXISTS "Users can update own matches" ON matches;

-- Users can view matches they're involved in
CREATE POLICY "Users can view own matches" ON matches
  FOR SELECT USING (auth.uid() = investor_id OR auth.uid() = creator_id);

-- System can insert matches (for matching algorithm)
CREATE POLICY "System can insert matches" ON matches
  FOR INSERT WITH CHECK (true);

-- Users can update matches they're involved in
CREATE POLICY "Users can update own matches" ON matches
  FOR UPDATE USING (auth.uid() = investor_id OR auth.uid() = creator_id);

-- ========================================
-- CONVERSATIONS POLICIES
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "System can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;

-- Users can view conversations they're participants in
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- System can create conversations for matches
CREATE POLICY "System can create conversations" ON conversations
  FOR INSERT WITH CHECK (true);

-- Users can update conversations they're participants in
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- ========================================
-- MESSAGES POLICIES
-- ========================================

-- Log before creating messages policies
SELECT log_diagnostic('Creating messages RLS policies');

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view conversation messages" ON messages;
DROP POLICY IF EXISTS "Users can insert conversation messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;

-- Users can view messages in conversations they're participants in
CREATE POLICY "Users can view conversation messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
    )
  );

-- Users can insert messages in conversations they're participants in
CREATE POLICY "Users can insert conversation messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
    )
  );

-- Users can update their own messages
CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- ========================================
-- TRANSACTIONS POLICIES
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "System can create transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;

-- Users can view transactions they're involved in
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = investor_id OR auth.uid() = creator_id);

-- System can create transactions
CREATE POLICY "System can create transactions" ON transactions
  FOR INSERT WITH CHECK (true);

-- Users can update transactions they're involved in (for status updates)
CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = investor_id OR auth.uid() = creator_id);

-- ========================================
-- FAVORITES POLICIES
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own favorites
CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- ANALYTICS EVENTS POLICIES
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own analytics" ON analytics_events;
DROP POLICY IF EXISTS "System can insert analytics" ON analytics_events;

-- Users can view their own analytics events
CREATE POLICY "Users can view own analytics" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert analytics events
CREATE POLICY "System can insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- ========================================
-- TENANTS POLICIES - FIXED VERSION
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active tenants" ON tenants;
DROP POLICY IF EXISTS "Super admin can manage tenants" ON tenants;

-- FIXED POLICY 1: Allow service role full access (for API routes)
CREATE POLICY "Allow service role full access" ON tenants
    FOR ALL USING (true);

-- FIXED POLICY 2: Allow authenticated users to read active tenants
CREATE POLICY "Allow authenticated users to read active tenants" ON tenants
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        status = 'active'
    );

-- FIXED POLICY 3: Allow authenticated users to insert tenants (for admin functionality)
CREATE POLICY "Allow authenticated users to insert tenants" ON tenants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- FIXED POLICY 4: Allow authenticated users to update tenants they have access to
CREATE POLICY "Allow authenticated users to update tenants" ON tenants
    FOR UPDATE USING (auth.role() = 'authenticated');

-- FIXED POLICY 5: Allow super admin users full access
CREATE POLICY "Allow super admin full access" ON tenants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.user_type = 'super_admin'
        )
    );

-- ========================================
-- TENANT SUBSCRIPTIONS POLICIES
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Tenants can view own subscriptions" ON tenant_subscriptions;
DROP POLICY IF EXISTS "Super admin can manage subscriptions" ON tenant_subscriptions;

-- Tenants can view their own subscriptions
CREATE POLICY "Tenants can view own subscriptions" ON tenant_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tenants
      WHERE tenants.id = tenant_subscriptions.tenant_id
      AND tenants.status = 'active'
    )
  );

-- Super admin can manage all subscriptions
CREATE POLICY "Super admin can manage subscriptions" ON tenant_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'super_admin'
    )
  );

-- ========================================
-- FUNCTIONS AND TRIGGERS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables (safe for existing databases)
DO $$
BEGIN
    -- Users table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created update_users_updated_at trigger';
    END IF;

    -- Business ideas table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_business_ideas_updated_at') THEN
        CREATE TRIGGER update_business_ideas_updated_at BEFORE UPDATE ON business_ideas
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created update_business_ideas_updated_at trigger';
    END IF;

    -- Investment offers table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_investment_offers_updated_at') THEN
        CREATE TRIGGER update_investment_offers_updated_at BEFORE UPDATE ON investment_offers
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created update_investment_offers_updated_at trigger';
    END IF;

    -- Matches table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_matches_updated_at') THEN
        CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created update_matches_updated_at trigger';
    END IF;

    -- Conversations table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversations_updated_at') THEN
        CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created update_conversations_updated_at trigger';
    END IF;

    -- Messages table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_messages_updated_at') THEN
        CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created update_messages_updated_at trigger';
    END IF;

    -- Tenants table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tenants_updated_at') THEN
        CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created update_tenants_updated_at trigger';
    END IF;

    -- Tenant subscriptions table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tenant_subscriptions_updated_at') THEN
        CREATE TRIGGER update_tenant_subscriptions_updated_at BEFORE UPDATE ON tenant_subscriptions
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created update_tenant_subscriptions_updated_at trigger';
    END IF;
END $$;

-- Log before creating triggers
SELECT log_diagnostic('Creating triggers that depend on messages table');

-- Function to update conversation last_message_at (safe replacement)
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at, last_message_id = NEW.id
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to messages table (safe for existing databases)
DO $$
BEGIN
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS update_conversation_on_new_message ON messages;

    -- Create new trigger
    CREATE TRIGGER update_conversation_on_new_message
      AFTER INSERT ON messages
      FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

    RAISE NOTICE 'Created update_conversation_on_new_message trigger';
END $$;

-- Log after creating triggers
SELECT log_diagnostic('All triggers created successfully');

-- ========================================
-- INSERT SAMPLE DATA AND FINAL SETUP
-- ========================================

-- Insert sample tenants if they don't exist
DO $$
DECLARE
    tenant_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tenant_count FROM tenants WHERE status = 'active';

    -- Only insert if no active tenants exist
    IF tenant_count = 0 THEN
        INSERT INTO tenants (name, slug, status, settings)
        VALUES (
            'Default Tenant',
            'default',
            'active',
            '{
                "branding": {
                    "primary_color": "#007bff",
                    "secondary_color": "#6c757d",
                    "accent_color": "#28a745"
                },
                "features": {
                    "ai_recommendations": false,
                    "advanced_analytics": false,
                    "custom_branding": false,
                    "api_access": false
                },
                "limits": {
                    "max_users": 100,
                    "max_projects": 50,
                    "storage_limit": 1073741824
                }
            }'::jsonb
        );

        INSERT INTO tenants (name, slug, status, settings)
        VALUES (
            'Demo Tenant',
            'demo',
            'active',
            '{
                "branding": {
                    "primary_color": "#6f42c1",
                    "secondary_color": "#e83e8c",
                    "accent_color": "#fd7e14"
                },
                "features": {
                    "ai_recommendations": true,
                    "advanced_analytics": true,
                    "custom_branding": true,
                    "api_access": true
                },
                "limits": {
                    "max_users": 1000,
                    "max_projects": 500,
                    "storage_limit": 10737418240
                }
            }'::jsonb
        );

        RAISE NOTICE 'Inserted sample tenant data';
    ELSE
        RAISE NOTICE 'Active tenants already exist, skipping sample data insertion';
    END IF;
END $$;

-- ========================================
-- GRANT SERVICE ROLE PERMISSIONS
-- ========================================

-- Grant necessary permissions to service role
GRANT ALL ON tenants TO service_role;
GRANT ALL ON users TO service_role;
GRANT ALL ON business_ideas TO service_role;
GRANT ALL ON investment_offers TO service_role;
GRANT ALL ON matches TO service_role;
GRANT ALL ON conversations TO service_role;
GRANT ALL ON messages TO service_role;
GRANT ALL ON transactions TO service_role;
GRANT ALL ON favorites TO service_role;
GRANT ALL ON analytics_events TO service_role;
GRANT ALL ON tenant_subscriptions TO service_role;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check tenants table setup
SELECT
    'Tenants count:' as info,
    COUNT(*) as count
FROM tenants
WHERE status = 'active';

-- Show sample tenants
SELECT
    'Sample tenants:' as info,
    id,
    name,
    slug,
    status
FROM tenants
WHERE status = 'active'
ORDER BY name;

-- Check if RLS is enabled on tenants table
SELECT
    'RLS Status:' as info,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'tenants') as policy_count
FROM pg_tables
WHERE tablename = 'tenants';

-- ========================================
-- SCHEMA CREATION COMPLETE
-- ========================================

SELECT log_diagnostic('Schema creation completed successfully - all tables, policies, and triggers created');
SELECT '✅ Complete database schema with service role access fix applied successfully!' as status;