-- ========================================
-- Strategic Partnership Platform Database Schema
-- ========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- USERS TABLE
-- ========================================

CREATE TABLE users (
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

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_oauth ON users(oauth_id);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_created ON users(created_at);

-- ========================================
-- BUSINESS IDEAS TABLE
-- ========================================

CREATE TABLE business_ideas (
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
CREATE INDEX idx_business_ideas_creator ON business_ideas(creator_id);
CREATE INDEX idx_business_ideas_status ON business_ideas(status);
CREATE INDEX idx_business_ideas_category ON business_ideas(category);
CREATE INDEX idx_business_ideas_created ON business_ideas(created_at);

-- ========================================
-- INVESTMENT OFFERS TABLE
-- ========================================

CREATE TABLE investment_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
CREATE INDEX idx_investment_offers_investor ON investment_offers(investor_id);
CREATE INDEX idx_investment_offers_active ON investment_offers(is_active);
CREATE INDEX idx_investment_offers_industries ON investment_offers USING GIN(preferred_industries);

-- ========================================
-- MATCHES TABLE
-- ========================================

CREATE TABLE matches (
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
CREATE INDEX idx_matches_idea ON matches(idea_id);
CREATE INDEX idx_matches_investor ON matches(investor_id);
CREATE INDEX idx_matches_creator ON matches(creator_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_score ON matches(match_score DESC);

-- ========================================
-- CONVERSATIONS TABLE
-- ========================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  participant1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique conversation for each match
  UNIQUE(match_id)
);

-- Indexes for conversations table
CREATE INDEX idx_conversations_match ON conversations(match_id);
CREATE INDEX idx_conversations_participants ON conversations(participant1_id, participant2_id);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX idx_conversations_participant2 ON conversations(participant2_id);

-- ========================================
-- MESSAGES TABLE
-- ========================================

CREATE TABLE messages (
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

-- Indexes for messages table
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_unread ON messages(read) WHERE read = FALSE;

-- ========================================
-- TRANSACTIONS TABLE
-- ========================================

CREATE TABLE transactions (
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
CREATE INDEX idx_transactions_match ON transactions(match_id);
CREATE INDEX idx_transactions_investor ON transactions(investor_id);
CREATE INDEX idx_transactions_creator ON transactions(creator_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_crypto_hash ON transactions(crypto_tx_hash);

-- ========================================
-- FAVORITES TABLE
-- ========================================

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL, -- ID of the offer or idea being favorited
  item_type TEXT NOT NULL CHECK (item_type IN ('offer', 'idea')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique favorites
  UNIQUE(user_id, item_id, item_type)
);

-- Indexes for favorites table
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_item ON favorites(item_id, item_type);
CREATE INDEX idx_favorites_user_item ON favorites(user_id, item_id, item_type);

-- ========================================
-- ANALYTICS EVENTS TABLE
-- ========================================

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  data JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics_events table
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);

-- ========================================
-- TENANTS TABLE
-- ========================================

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

-- Indexes for tenants table
CREATE UNIQUE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_created ON tenants(created_at);

-- ========================================
-- TENANT SUBSCRIPTIONS TABLE
-- ========================================

CREATE TABLE tenant_subscriptions (
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
  UNIQUE(tenant_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Indexes for tenant_subscriptions table
CREATE INDEX idx_tenant_subscriptions_tenant ON tenant_subscriptions(tenant_id);
CREATE INDEX idx_tenant_subscriptions_status ON tenant_subscriptions(status);
CREATE INDEX idx_tenant_subscriptions_plan ON tenant_subscriptions(plan);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- USERS TABLE POLICIES
-- ========================================

-- Users can read their own profile and public profiles
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles" ON users
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ========================================
-- BUSINESS IDEAS POLICIES
-- ========================================

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

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own favorites
CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- ANALYTICS EVENTS POLICIES
-- ========================================

-- Users can view their own analytics events
CREATE POLICY "Users can view own analytics" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert analytics events
CREATE POLICY "System can insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- ========================================
-- TENANTS POLICIES
-- ========================================

-- Anyone can view active tenants (for tenant selection)
CREATE POLICY "Anyone can view active tenants" ON tenants
  FOR SELECT USING (status = 'active');

-- Super admin can manage all tenants
CREATE POLICY "Super admin can manage tenants" ON tenants
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

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_ideas_updated_at BEFORE UPDATE ON business_ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_offers_updated_at BEFORE UPDATE ON investment_offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_subscriptions_updated_at BEFORE UPDATE ON tenant_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at, last_message_id = NEW.id
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to messages table
CREATE TRIGGER update_conversation_on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- ========================================
-- INITIAL DATA (Optional)
-- ========================================

-- Insert sample categories for business ideas
INSERT INTO business_ideas (creator_id, title, description, category, tags, funding_goal, current_funding, equity_offered, stage, timeline, status)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'Sample Tech Startup', 'A sample business idea for testing', 'Technology', ARRAY['tech', 'startup'], 100000, 0, 10, 'concept', '6 months', 'published')
ON CONFLICT DO NOTHING;

-- Insert sample tenant for testing
INSERT INTO tenants (id, name, slug, status, settings)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Default Tenant', 'default', 'active', '{
    "branding": {
      "primary_color": "#007bff",
      "secondary_color": "#6c757d",
      "accent_color": "#28a745"
    },
    "features": {
      "ai_recommendations": true,
      "advanced_analytics": true,
      "custom_branding": false,
      "api_access": false
    },
    "limits": {
      "max_users": 100,
      "max_projects": 50,
      "storage_limit": 1073741824
    }
  }'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample tenant subscription
INSERT INTO tenant_subscriptions (tenant_id, plan, features, status, current_period_start, current_period_end)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'starter', '{
    "ai_recommendations": true,
    "advanced_analytics": true,
    "custom_branding": false,
    "api_access": false
  }'::jsonb, 'active', NOW(), NOW() + INTERVAL '1 month')
ON CONFLICT (tenant_id, status) DO NOTHING;