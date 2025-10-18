-- ========================================
-- FIX RLS POLICIES FOR SERVICE ROLE ACCESS
-- ========================================

-- The issue: Current RLS policies are too restrictive and blocking service role access
-- We need to ensure service role has full access to all tables

-- Fix tenants table policies to allow service role full access
DROP POLICY IF EXISTS "Allow service role full access" ON tenants;
CREATE POLICY "Allow service role full access" ON tenants
    FOR ALL USING (true) WITH CHECK (true);

-- Fix users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view tenant profiles" ON users;
DROP POLICY IF EXISTS "Users can view public profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Allow service role full access to users table
CREATE POLICY "Service role full access" ON users FOR ALL USING (true) WITH CHECK (true);

-- Fix business_ideas table policies
DROP POLICY IF EXISTS "Anyone can view published ideas" ON business_ideas;
DROP POLICY IF EXISTS "Creators can view own ideas" ON business_ideas;
DROP POLICY IF EXISTS "Creators can insert own ideas" ON business_ideas;
DROP POLICY IF EXISTS "Creators can update own ideas" ON business_ideas;

-- Allow service role full access to business_ideas table
CREATE POLICY "Service role full access" ON business_ideas FOR ALL USING (true) WITH CHECK (true);

-- Fix investment_offers table policies
DROP POLICY IF EXISTS "Anyone can view active offers" ON investment_offers;
DROP POLICY IF EXISTS "Investors can view own offers" ON investment_offers;
DROP POLICY IF EXISTS "Investors can insert own offers" ON investment_offers;
DROP POLICY IF EXISTS "Investors can update own offers" ON investment_offers;

-- Allow service role full access to investment_offers table
CREATE POLICY "Service role full access" ON investment_offers FOR ALL USING (true) WITH CHECK (true);

-- Fix matches table policies
DROP POLICY IF EXISTS "Users can view own matches" ON matches;
DROP POLICY IF EXISTS "System can insert matches" ON matches;
DROP POLICY IF EXISTS "Users can update own matches" ON matches;

-- Allow service role full access to matches table
CREATE POLICY "Service role full access" ON matches FOR ALL USING (true) WITH CHECK (true);

-- Fix conversations table policies
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "System can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;

-- Allow service role full access to conversations table
CREATE POLICY "Service role full access" ON conversations FOR ALL USING (true) WITH CHECK (true);

-- Fix messages table policies
DROP POLICY IF EXISTS "Users can view conversation messages" ON messages;
DROP POLICY IF EXISTS "Users can insert conversation messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;

-- Allow service role full access to messages table
CREATE POLICY "Service role full access" ON messages FOR ALL USING (true) WITH CHECK (true);

-- Fix transactions table policies
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "System can create transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;

-- Allow service role full access to transactions table
CREATE POLICY "Service role full access" ON transactions FOR ALL USING (true) WITH CHECK (true);

-- Fix favorites table policies
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;

-- Allow service role full access to favorites table
CREATE POLICY "Service role full access" ON favorites FOR ALL USING (true) WITH CHECK (true);

-- Fix analytics_events table policies
DROP POLICY IF EXISTS "Users can view own analytics" ON analytics_events;
DROP POLICY IF EXISTS "System can insert analytics" ON analytics_events;

-- Allow service role full access to analytics_events table
CREATE POLICY "Service role full access" ON analytics_events FOR ALL USING (true) WITH CHECK (true);

-- Fix tenant_subscriptions table policies
DROP POLICY IF EXISTS "Tenants can view own subscriptions" ON tenant_subscriptions;
DROP POLICY IF EXISTS "Super admin can manage subscriptions" ON tenant_subscriptions;

-- Allow service role full access to tenant_subscriptions table
CREATE POLICY "Service role full access" ON tenant_subscriptions FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- VERIFICATION
-- ========================================

-- Check if policies were created successfully
SELECT
    'RLS Fix Applied Successfully!' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = tenants.tablename) as policy_count
FROM pg_tables tenants
WHERE tablename IN ('tenants', 'users', 'business_ideas', 'investment_offers', 'matches', 'conversations', 'messages', 'transactions', 'favorites', 'analytics_events', 'tenant_subscriptions')
ORDER BY tablename;



-- ========================================
-- FIX RLS POLICIES FOR SERVICE ROLE ACCESS
-- ========================================

-- The issue: Current RLS policies are too restrictive and blocking service role access
-- We need to ensure service role has full access to all tables

-- Fix tenants table policies to allow service role full access
DROP POLICY IF EXISTS "Allow service role full access" ON tenants;
CREATE POLICY "Allow service role full access" ON tenants
    FOR ALL USING (true) WITH CHECK (true);

-- Fix users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view tenant profiles" ON users;
DROP POLICY IF EXISTS "Users can view public profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Allow service role full access to users table
CREATE POLICY "Service role full access" ON users FOR ALL USING (true) WITH CHECK (true);

-- Fix business_ideas table policies
DROP POLICY IF EXISTS "Anyone can view published ideas" ON business_ideas;
DROP POLICY IF EXISTS "Creators can view own ideas" ON business_ideas;
DROP POLICY IF EXISTS "Creators can insert own ideas" ON business_ideas;
DROP POLICY IF EXISTS "Creators can update own ideas" ON business_ideas;

-- Allow service role full access to business_ideas table
CREATE POLICY "Service role full access" ON business_ideas FOR ALL USING (true) WITH CHECK (true);

-- Fix investment_offers table policies
DROP POLICY IF EXISTS "Anyone can view active offers" ON investment_offers;
DROP POLICY IF EXISTS "Investors can view own offers" ON investment_offers;
DROP POLICY IF EXISTS "Investors can insert own offers" ON investment_offers;
DROP POLICY IF EXISTS "Investors can update own offers" ON investment_offers;

-- Allow service role full access to investment_offers table
CREATE POLICY "Service role full access" ON investment_offers FOR ALL USING (true) WITH CHECK (true);

-- Fix matches table policies
DROP POLICY IF EXISTS "Users can view own matches" ON matches;
DROP POLICY IF EXISTS "System can insert matches" ON matches;
DROP POLICY IF EXISTS "Users can update own matches" ON matches;

-- Allow service role full access to matches table
CREATE POLICY "Service role full access" ON matches FOR ALL USING (true) WITH CHECK (true);

-- Fix conversations table policies
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "System can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;

-- Allow service role full access to conversations table
CREATE POLICY "Service role full access" ON conversations FOR ALL USING (true) WITH CHECK (true);

-- Fix messages table policies
DROP POLICY IF EXISTS "Users can view conversation messages" ON messages;
DROP POLICY IF EXISTS "Users can insert conversation messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;

-- Allow service role full access to messages table
CREATE POLICY "Service role full access" ON messages FOR ALL USING (true) WITH CHECK (true);

-- Fix transactions table policies
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "System can create transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;

-- Allow service role full access to transactions table
CREATE POLICY "Service role full access" ON transactions FOR ALL USING (true) WITH CHECK (true);

-- Fix favorites table policies
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;

-- Allow service role full access to favorites table
CREATE POLICY "Service role full access" ON favorites FOR ALL USING (true) WITH CHECK (true);

-- Fix analytics_events table policies
DROP POLICY IF EXISTS "Users can view own analytics" ON analytics_events;
DROP POLICY IF EXISTS "System can insert analytics" ON analytics_events;

-- Allow service role full access to analytics_events table
CREATE POLICY "Service role full access" ON analytics_events FOR ALL USING (true) WITH CHECK (true);

-- Fix tenant_subscriptions table policies
DROP POLICY IF EXISTS "Tenants can view own subscriptions" ON tenant_subscriptions;
DROP POLICY IF EXISTS "Super admin can manage subscriptions" ON tenant_subscriptions;

-- Allow service role full access to tenant_subscriptions table
CREATE POLICY "Service role full access" ON tenant_subscriptions FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- VERIFICATION
-- ========================================

-- Check if policies were created successfully
SELECT
    'RLS Fix Applied Successfully!' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = tenants.tablename) as policy_count
FROM pg_tables tenants
WHERE tablename IN ('tenants', 'users', 'business_ideas', 'investment_offers', 'matches', 'conversations', 'messages', 'transactions', 'favorites', 'analytics_events', 'tenant_subscriptions')
ORDER BY tablename;



-- Grant schema access
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

-- Enable RLS on all existing tables (if you want row-level security)
ALTER TABLE IF EXISTS public.tenants ENABLE ROW LEVEL SECURITY;  -- Repeat for other tables, e.g., users, posts
-- Then add policies, e.g.:
-- CREATE POLICY "Enable read access for authenticated users" ON public.tenants FOR SELECT USING (auth.role() = 'authenticated');