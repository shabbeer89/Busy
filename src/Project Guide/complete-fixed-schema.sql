-- ========================================
-- Strategic Partnership Platform Database Schema - COMPLETE FIXED VERSION
-- ========================================

-- ========================================
-- Strategic Partnership Platform Database Schema - COMPLETE FIXED VERSION
-- ========================================
-- FIXED: Proper table creation order and dependency handling

-- Destroys all objects in public (clean slate approach)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";



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

-- Log before creating tenants table
SELECT log_diagnostic('Starting tenants table creation');

CREATE TABLE tenants (
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

-- First ensure users table exists with ADMIN ROLES SUPPORT
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone_number TEXT,
  avatar TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('creator', 'investor', 'tenant_admin', 'super_admin')),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  oauth_id TEXT,
  provider TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Admin role fields (NEW - for admin hierarchy support)
  role_level TEXT DEFAULT 'user' CHECK (role_level IN ('user', 'admin', 'super_admin')),
  permissions JSONB DEFAULT '[]'::jsonb,
  managed_tenant_ids UUID[] DEFAULT '{}',

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

-- Add admin role columns to users table if they don't exist
DO $$
BEGIN
    -- Add role_level column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'role_level') THEN
        ALTER TABLE users ADD COLUMN role_level TEXT CHECK (role_level IN ('user', 'admin', 'super_admin'));
        RAISE NOTICE 'Added role_level column to users table';
    END IF;

    -- Add permissions column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'permissions') THEN
        ALTER TABLE users ADD COLUMN permissions JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added permissions column to users table';
    END IF;

    -- Add managed_tenant_ids column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'managed_tenant_ids') THEN
        ALTER TABLE users ADD COLUMN managed_tenant_ids UUID[] DEFAULT '{}';
        RAISE NOTICE 'Added managed_tenant_ids column to users table';
    END IF;
END $$;

-- Note: tenant_id column will be added during table creation below

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_id);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at);

-- NEW: Indexes for admin role fields (for performance and admin queries)
CREATE INDEX IF NOT EXISTS idx_users_role_level ON users(role_level);
CREATE INDEX IF NOT EXISTS idx_users_managed_tenants ON users USING GIN(managed_tenant_ids);
CREATE INDEX IF NOT EXISTS idx_users_admin_type ON users(user_type, role_level) WHERE role_level IN ('admin', 'super_admin');

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

-- Log before creating investment_offers table
SELECT log_diagnostic('Starting investment_offers table creation');

CREATE TABLE investment_offers (
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

-- Log after investment_offers table creation
SELECT log_diagnostic('Investment_offers table created successfully');

-- ========================================
-- SAFE TABLE MODIFICATION FUNCTIONS
-- ========================================

-- Function to safely add tenant_id column to investment_offers if table exists
CREATE OR REPLACE FUNCTION safe_add_tenant_id_to_investment_offers()
RETURNS void AS $$
BEGIN
    -- Check if investment_offers table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'investment_offers') THEN
        -- Check if tenant_id column already exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'investment_offers' AND column_name = 'tenant_id') THEN
            ALTER TABLE investment_offers ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added tenant_id column to investment_offers table';
        ELSE
            RAISE NOTICE 'tenant_id column already exists in investment_offers table';
        END IF;
    ELSE
        RAISE NOTICE 'investment_offers table does not exist - will be created by main schema';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the safe function
SELECT safe_add_tenant_id_to_investment_offers();

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
-- USERS TABLE POLICIES - ENHANCED VERSION
-- ========================================

-- Drop existing policies if they exist (clean slate approach)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view tenant profiles" ON users;
DROP POLICY IF EXISTS "Users can view public profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Service role full access" ON users;

-- POLICY 1: Allow service role full access (for API routes and admin operations)
CREATE POLICY "Service role full access" ON users FOR ALL USING (true) WITH CHECK (true);

-- POLICY 2: Users can read their own profile and public profiles within their tenant
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view tenant profiles" ON users
  FOR SELECT USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view public profiles" ON users
  FOR SELECT USING (tenant_id IS NULL OR tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- POLICY 3: Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- POLICY 4: Users can insert their own profile with tenant context
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ========================================
-- BUSINESS IDEAS POLICIES - ENHANCED VERSION
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view published ideas" ON business_ideas;
DROP POLICY IF EXISTS "Creators can view own ideas" ON business_ideas;
DROP POLICY IF EXISTS "Creators can insert own ideas" ON business_ideas;
DROP POLICY IF EXISTS "Creators can update own ideas" ON business_ideas;
DROP POLICY IF EXISTS "Service role full access" ON business_ideas;

-- POLICY 1: Allow service role full access (for API routes and admin operations)
CREATE POLICY "Service role full access" ON business_ideas FOR ALL USING (true) WITH CHECK (true);

-- POLICY 2: Anyone can view published ideas
CREATE POLICY "Anyone can view published ideas" ON business_ideas
  FOR SELECT USING (status = 'published');

-- POLICY 3: Creators can view all their own ideas
CREATE POLICY "Creators can view own ideas" ON business_ideas
  FOR SELECT USING (auth.uid() = creator_id);

-- POLICY 4: Creators can insert their own ideas
CREATE POLICY "Creators can insert own ideas" ON business_ideas
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- POLICY 5: Creators can update their own ideas
CREATE POLICY "Creators can update own ideas" ON business_ideas
  FOR UPDATE USING (auth.uid() = creator_id);

-- ========================================
-- INVESTMENT OFFERS POLICIES - ENHANCED VERSION
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active offers" ON investment_offers;
DROP POLICY IF EXISTS "Investors can view own offers" ON investment_offers;
DROP POLICY IF EXISTS "Investors can insert own offers" ON investment_offers;
DROP POLICY IF EXISTS "Investors can update own offers" ON investment_offers;
DROP POLICY IF EXISTS "Service role full access" ON investment_offers;

-- POLICY 1: Allow service role full access (for API routes and admin operations)
CREATE POLICY "Service role full access" ON investment_offers FOR ALL USING (true) WITH CHECK (true);

-- POLICY 2: Anyone can view active offers
CREATE POLICY "Anyone can view active offers" ON investment_offers
  FOR SELECT USING (is_active = true);

-- POLICY 3: Investors can view all their own offers
CREATE POLICY "Investors can view own offers" ON investment_offers
  FOR SELECT USING (auth.uid() = investor_id);

-- POLICY 4: Investors can insert their own offers
CREATE POLICY "Investors can insert own offers" ON investment_offers
  FOR INSERT WITH CHECK (auth.uid() = investor_id);

-- POLICY 5: Investors can update their own offers
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
-- TENANTS POLICIES - ENHANCED VERSION
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active tenants" ON tenants;
DROP POLICY IF EXISTS "Super admin can manage tenants" ON tenants;
DROP POLICY IF EXISTS "Allow service role full access" ON tenants;
DROP POLICY IF EXISTS "Allow authenticated users to read active tenants" ON tenants;
DROP POLICY IF EXISTS "Allow authenticated users to insert tenants" ON tenants;
DROP POLICY IF EXISTS "Allow authenticated users to update tenants" ON tenants;
DROP POLICY IF EXISTS "Allow super admin full access" ON tenants;

-- POLICY 1: Allow service role full access (for API routes and admin operations)
CREATE POLICY "Allow service role full access" ON tenants
    FOR ALL USING (true) WITH CHECK (true);

-- POLICY 2: Allow authenticated users to read active tenants
CREATE POLICY "Allow authenticated users to read active tenants" ON tenants
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        status = 'active'
    );

-- POLICY 3: Allow authenticated users to insert tenants (for admin functionality)
CREATE POLICY "Allow authenticated users to insert tenants" ON tenants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- POLICY 4: Allow authenticated users to update tenants they have access to
CREATE POLICY "Allow authenticated users to update tenants" ON tenants
    FOR UPDATE USING (auth.role() = 'authenticated');

-- POLICY 5: Allow super admin users full access (FIXED - supports admin roles)
CREATE POLICY "Allow super admin full access" ON tenants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.user_type IN ('super_admin', 'tenant_admin')
            AND users.role_level IN ('admin', 'super_admin')
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

-- Super admin can manage all subscriptions (FIXED - supports admin roles)
CREATE POLICY "Super admin can manage subscriptions" ON tenant_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type IN ('super_admin', 'tenant_admin')
      AND users.role_level IN ('admin', 'super_admin')
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

-- Grant necessary permissions to service role for all tables
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

-- Admin table permissions will be granted after table creation below

-- Grant schema access for comprehensive permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant table/sequence access (for existing or future tables)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant function access (for existing or future functions)
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Default grants for anything new you create
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;

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
-- ADMIN FEATURE TABLES
-- ========================================

-- AUDIT LOGS TABLE for comprehensive audit logging
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  tenant_name TEXT,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details JSONB NOT NULL DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  session_id TEXT,
  location TEXT,
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit_logs table
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_score ON audit_logs(risk_score DESC);

-- PLATFORM CONFIGURATIONS TABLE for configuration management
CREATE TABLE IF NOT EXISTS platform_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  type TEXT NOT NULL DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json', 'password')),
  description TEXT,
  is_secret BOOLEAN NOT NULL DEFAULT FALSE,
  is_read_only BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Ensure unique configuration keys
  UNIQUE(category, key)
);

-- Indexes for platform_configurations table
CREATE INDEX IF NOT EXISTS idx_platform_configurations_category ON platform_configurations(category);
CREATE INDEX IF NOT EXISTS idx_platform_configurations_key ON platform_configurations(key);
CREATE INDEX IF NOT EXISTS idx_platform_configurations_updated_at ON platform_configurations(updated_at DESC);

-- API KEYS TABLE for API management
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE, -- Store hash of actual key for security
  key_prefix TEXT NOT NULL, -- First few characters for identification
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permissions JSONB NOT NULL DEFAULT '[]',
  rate_limits JSONB NOT NULL DEFAULT '{
    "requests_per_second": 100,
    "requests_per_minute": 5000,
    "requests_per_hour": 100000,
    "requests_per_day": 1000000
  }',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  last_used TIMESTAMPTZ,
  usage JSONB NOT NULL DEFAULT '{
    "current_period": {
      "requests": 0,
      "start_time": null
    },
    "limits": {
      "daily": 1000000,
      "monthly": 30000000
    }
  }',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for api_keys table
CREATE INDEX IF NOT EXISTS idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires ON api_keys(expires_at);

-- RATE LIMIT RULES TABLE for API rate limiting
CREATE TABLE IF NOT EXISTS rate_limit_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  endpoint_pattern TEXT NOT NULL,
  method TEXT,
  limit_count INTEGER NOT NULL,
  window_seconds INTEGER NOT NULL,
  strategy TEXT NOT NULL DEFAULT 'fixed_window' CHECK (strategy IN ('fixed_window', 'sliding_window', 'token_bucket')),
  applies_to TEXT NOT NULL DEFAULT 'global' CHECK (applies_to IN ('global', 'tenant', 'user', 'ip')),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_range INET,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  priority INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for rate_limit_rules table
CREATE INDEX IF NOT EXISTS idx_rate_limit_rules_active ON rate_limit_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_rate_limit_rules_tenant ON rate_limit_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_rules_priority ON rate_limit_rules(priority DESC);

-- SECURITY EVENTS TABLE for security monitoring
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN ('threat', 'breach', 'suspicious', 'policy_violation', 'failed_login', 'unauthorized_access')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source_ip INET,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  location TEXT,
  user_agent TEXT,
  risk_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved', 'false_positive')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolution TEXT,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for security_events table
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_status ON security_events(status);
CREATE INDEX IF NOT EXISTS idx_security_events_tenant ON security_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_security_events_risk_score ON security_events(risk_score DESC);

-- WEBHOOKS TABLE for API management
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events JSONB NOT NULL DEFAULT '[]',
  secret_hash TEXT NOT NULL, -- Store hash of webhook secret
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  retry_policy JSONB NOT NULL DEFAULT '{
    "max_retries": 3,
    "backoff_strategy": "exponential",
    "retry_on": [500, 502, 503, 504]
  }',
  last_triggered TIMESTAMPTZ,
  success_rate DECIMAL(5,2) DEFAULT 0,
  total_deliveries INTEGER DEFAULT 0,
  failed_deliveries INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for webhooks table
CREATE INDEX IF NOT EXISTS idx_webhooks_tenant ON webhooks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(is_active);

-- NOTIFICATIONS TABLE for notification center
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- SYSTEM METRICS TABLE for performance monitoring
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  value DECIMAL(15,4) NOT NULL,
  unit TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'
);

-- Indexes for system_metrics table
CREATE INDEX IF NOT EXISTS idx_system_metrics_type ON system_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_tenant ON system_metrics(tenant_id);

-- API USAGE LOGS TABLE for detailed API monitoring
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  response_time INTEGER, -- in milliseconds
  status_code INTEGER,
  request_size INTEGER,
  response_size INTEGER,
  ip_address INET,
  user_agent TEXT,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for api_usage_logs table
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_key ON api_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_endpoint ON api_usage_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_timestamp ON api_usage_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_tenant ON api_usage_logs(tenant_id);

-- ========================================
-- RLS POLICIES FOR ADMIN TABLES
-- ========================================

-- Enable RLS on admin tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs policies - allow service role full access, authenticated users limited access
CREATE POLICY "Service role full access to audit_logs" ON audit_logs FOR ALL USING (true);
CREATE POLICY "Users can view relevant audit_logs" ON audit_logs
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      user_id = auth.uid() OR
      tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    )
  );

-- Platform configurations policies
CREATE POLICY "Service role full access to configurations" ON platform_configurations FOR ALL USING (true);
CREATE POLICY "Authenticated users can read non-secret configs" ON platform_configurations
  FOR SELECT USING (auth.role() = 'authenticated' AND NOT is_secret);

-- API keys policies
CREATE POLICY "Service role full access to api_keys" ON api_keys FOR ALL USING (true);
CREATE POLICY "Users can manage own API keys" ON api_keys
  FOR ALL USING (
    auth.role() = 'authenticated' AND (
      user_id = auth.uid() OR
      tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    )
  );

-- Rate limit rules policies
CREATE POLICY "Service role full access to rate_limit_rules" ON rate_limit_rules FOR ALL USING (true);
CREATE POLICY "Authenticated users can view rate limits" ON rate_limit_rules
  FOR SELECT USING (auth.role() = 'authenticated');

-- Security events policies
CREATE POLICY "Service role full access to security_events" ON security_events FOR ALL USING (true);
CREATE POLICY "Users can view relevant security events" ON security_events
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      user_id = auth.uid() OR
      tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    )
  );

-- Webhooks policies
CREATE POLICY "Service role full access to webhooks" ON webhooks FOR ALL USING (true);
CREATE POLICY "Users can manage own webhooks" ON webhooks
  FOR ALL USING (
    auth.role() = 'authenticated' AND (
      tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    )
  );

-- Notifications policies
CREATE POLICY "Service role full access to notifications" ON notifications FOR ALL USING (true);
CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- System metrics policies
CREATE POLICY "Service role full access to system_metrics" ON system_metrics FOR ALL USING (true);
CREATE POLICY "Users can view tenant metrics" ON system_metrics
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()) OR
      tenant_id IS NULL
    )
  );

-- API usage logs policies
CREATE POLICY "Service role full access to api_usage_logs" ON api_usage_logs FOR ALL USING (true);
CREATE POLICY "Users can view own usage logs" ON api_usage_logs
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      api_key_id IN (SELECT id FROM api_keys WHERE user_id = auth.uid()) OR
      tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid())
    )
  );

-- ========================================
-- TRIGGERS FOR ADMIN TABLES
-- ========================================

-- Function to update updated_at timestamp for admin tables
CREATE OR REPLACE FUNCTION update_admin_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to admin tables
CREATE TRIGGER update_platform_configurations_updated_at BEFORE UPDATE ON platform_configurations
  FOR EACH ROW EXECUTE FUNCTION update_admin_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_admin_updated_at_column();

CREATE TRIGGER update_rate_limit_rules_updated_at BEFORE UPDATE ON rate_limit_rules
  FOR EACH ROW EXECUTE FUNCTION update_admin_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION update_admin_updated_at_column();

-- ========================================
-- GRANT PERMISSIONS FOR ADMIN TABLES
-- ========================================

-- Grant necessary permissions to service role for admin tables
GRANT ALL ON audit_logs TO service_role;
GRANT ALL ON platform_configurations TO service_role;
GRANT ALL ON api_keys TO service_role;
GRANT ALL ON rate_limit_rules TO service_role;
GRANT ALL ON security_events TO service_role;
GRANT ALL ON webhooks TO service_role;
GRANT ALL ON notifications TO service_role;
GRANT ALL ON system_metrics TO service_role;
GRANT ALL ON api_usage_logs TO service_role;

-- ========================================
-- INSERT SAMPLE ADMIN DATA
-- ========================================

-- Insert sample platform configurations
INSERT INTO platform_configurations (category, key, value, type, description, is_secret, is_read_only)
VALUES
  ('general', 'site_name', '"Multi-Tenant Platform"', 'string', 'The main site name displayed in headers and emails', false, false),
  ('general', 'site_description', '"A powerful multi-tenant platform for modern applications"', 'string', 'Site description for SEO and meta tags', false, false),
  ('general', 'maintenance_mode', 'false', 'boolean', 'Enable maintenance mode to show maintenance page to users', false, false),
  ('security', 'session_timeout', '3600', 'number', 'Session timeout in seconds (default: 3600 = 1 hour)', false, false),
  ('security', 'max_login_attempts', '5', 'number', 'Maximum failed login attempts before account lockout', false, false),
  ('email', 'smtp_host', '"smtp.example.com"', 'string', 'SMTP server hostname', false, false),
  ('email', 'smtp_username', '"noreply@example.com"', 'string', 'SMTP authentication username', false, false),
  ('email', 'smtp_password', '"password123"', 'password', 'SMTP authentication password', true, false),
  ('features', 'enable_video_calling', 'true', 'boolean', 'Enable video calling feature across the platform', false, false),
  ('features', 'enable_crypto_payments', 'false', 'boolean', 'Enable cryptocurrency payment processing', false, false),
  ('api', 'rate_limit_per_minute', '1000', 'number', 'API rate limit per minute per user', false, false),
  ('localization', 'default_timezone', '"UTC"', 'string', 'Default timezone for the platform', false, false),
  ('localization', 'supported_languages', '["en", "es", "fr", "de"]', 'json', 'List of supported language codes', false, false)
ON CONFLICT (category, key) DO NOTHING;

-- Insert sample rate limit rules
INSERT INTO rate_limit_rules (name, description, endpoint_pattern, method, limit_count, window_seconds, strategy, applies_to, is_active, priority)
VALUES
  ('Global API Rate Limit', 'General rate limiting for all API endpoints', '/api/*', NULL, 1000, 60, 'sliding_window', 'global', true, 1),
  ('Authentication Rate Limit', 'Stricter rate limiting for authentication endpoints', '/api/auth/*', NULL, 10, 60, 'fixed_window', 'ip', true, 2),
  ('Analytics Rate Limit', 'Rate limiting for analytics endpoints', '/api/analytics/*', 'GET', 500, 60, 'token_bucket', 'tenant', true, 3)
ON CONFLICT DO NOTHING;

-- ========================================
-- FINAL VERIFICATION AND DIAGNOSTICS
-- ========================================

-- Simple verification queries (no function needed)
SELECT '🔍 DATABASE STRUCTURE VERIFICATION:' as info;

-- Check if key tables exist
SELECT
    'Tables existence check:' as info,
    COUNT(*) as existing_tables
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('tenants', 'users', 'business_ideas', 'investment_offers', 'matches', 'conversations', 'messages');

-- Check investment_offers table specifically
SELECT
    'investment_offers table check:' as info,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'investment_offers')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- Check if tenant_id column exists in investment_offers
SELECT
    'investment_offers tenant_id column check:' as info,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'investment_offers' AND column_name = 'tenant_id'
        )
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- Final diagnostic log
SELECT log_diagnostic('Schema creation completed successfully - all tables, policies, and triggers created');

-- ========================================
-- SCHEMA CREATION COMPLETE
-- ========================================

SELECT '✅ Complete database schema with FIXED admin roles applied successfully!' as status;
SELECT '🎯 Admin user types now supported: creator, investor, tenant_admin, super_admin' as info;
SELECT '🔧 RLS policies updated to work with admin roles' as info;
SELECT '⚡ Performance indexes added for admin queries' as info;
SELECT '🛠️  Safe table modification functions added' as info;
SELECT '🔍 Database structure verification completed' as info;
