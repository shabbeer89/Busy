-- ========================================
-- TEST USER SETUP SCRIPT
-- ========================================

-- Insert test user for development/testing
-- Email: test@example.com
-- User Type: creator (can be changed to 'investor' if needed)

INSERT INTO users (
  id,
  email,
  name,
  phone_number,
  avatar,
  user_type,
  is_verified,
  phone_verified,
  oauth_id,
  provider,
  created_at,
  updated_at,
  company_name,
  industry,
  experience,
  bio,
  location,
  website
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'test@example.com',
  'Test User',
  '+1234567890',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'creator',
  true,
  false,
  'test-oauth-id',
  'email',
  NOW(),
  NOW(),
  'Test Company Inc.',
  'Technology',
  '5+ years',
  'Experienced entrepreneur and developer passionate about creating innovative solutions.',
  'San Francisco, CA',
  'https://testcompany.com'
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  phone_number = EXCLUDED.phone_number,
  user_type = EXCLUDED.user_type,
  is_verified = EXCLUDED.is_verified,
  updated_at = NOW();

-- Insert sample business idea for the test user
INSERT INTO business_ideas (
  id,
  creator_id,
  title,
  description,
  category,
  tags,
  funding_goal,
  current_funding,
  equity_offered,
  valuation,
  stage,
  timeline,
  team_size,
  status,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'AI-Powered Business Analytics Platform',
  'A comprehensive business intelligence platform that uses machine learning to provide actionable insights for businesses of all sizes. Features include predictive analytics, automated reporting, and real-time dashboards.',
  'Technology',
  ARRAY['AI', 'analytics', 'SaaS', 'enterprise'],
  500000.00,
  0.00,
  15.00,
  3000000.00,
  'mvp',
  '12 months',
  8,
  'published',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Insert sample investment offer for testing investor functionality
INSERT INTO investment_offers (
  id,
  investor_id,
  title,
  description,
  amount_range,
  preferred_equity,
  preferred_stages,
  preferred_industries,
  geographic_preference,
  investment_type,
  timeline,
  is_active,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'Tech Startup Investment Fund',
  'Looking to invest in early-stage technology startups with strong growth potential and experienced founding teams.',
  '{"min": 50000, "max": 500000}'::jsonb,
  '{"min": 5, "max": 25}'::jsonb,
  ARRAY['concept', 'mvp', 'early'],
  ARRAY['Technology', 'Healthcare', 'Fintech'],
  'North America',
  'equity',
  '2-3 years',
  true,
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Create a match between the test user as creator and investor
INSERT INTO matches (
  id,
  idea_id,
  investor_id,
  creator_id,
  offer_id,
  match_score,
  matching_factors,
  status,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  '550e8400-e29b-41d4-a716-446655440003'::uuid,
  85.50,
  '{
    "industry_match": 95,
    "stage_match": 90,
    "amount_match": 80,
    "experience_match": 85
  }'::jsonb,
  'suggested',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Create a conversation for the match
INSERT INTO conversations (
  id,
  match_id,
  participant1_id,
  participant2_id,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440005'::uuid,
  '550e8400-e29b-41d4-a716-446655440004'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Add some sample messages
INSERT INTO messages (
  id,
  conversation_id,
  sender_id,
  content,
  type,
  read,
  created_at
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440006'::uuid,
  '550e8400-e29b-41d4-a716-446655440005'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'Hi! I saw your business analytics platform and I''m very interested in learning more about your vision and technology stack.',
  'text',
  false,
  NOW() - INTERVAL '2 hours'
),
(
  '550e8400-e29b-41d4-a716-446655440007'::uuid,
  '550e8400-e29b-41d4-a716-446655440005'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'I''d love to schedule a call to discuss potential investment opportunities. Are you available next week?',
  'text',
  false,
  NOW() - INTERVAL '1 hour'
) ON CONFLICT DO NOTHING;

-- Add test user to favorites (favoriting their own investment offer)
INSERT INTO favorites (
  id,
  user_id,
  item_id,
  item_type,
  created_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440008'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  '550e8400-e29b-41d4-a716-446655440003',
  'offer',
  NOW()
) ON CONFLICT DO NOTHING;

-- Verify the test user was created successfully
SELECT
  u.id,
  u.email,
  u.name,
  u.user_type,
  u.is_verified,
  bi.title as business_idea_title,
  io.title as investment_offer_title,
  m.status as match_status
FROM users u
LEFT JOIN business_ideas bi ON u.id = bi.creator_id
LEFT JOIN investment_offers io ON u.id = io.investor_id
LEFT JOIN matches m ON u.id = m.creator_id OR u.id = m.investor_id
WHERE u.email = 'test@example.com';
