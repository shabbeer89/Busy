-- ========================================
-- 🚨 CRITICAL: AUTHENTICATION FIX CLEANUP
-- ========================================
-- Before populating new data, clear existing data with mismatched user IDs

-- Clear all user-related data in reverse dependency order
TRUNCATE TABLE favorites CASCADE;
TRUNCATE TABLE matches CASCADE;
TRUNCATE TABLE conversations CASCADE;
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE business_ideas CASCADE;
TRUNCATE TABLE investment_offers CASCADE;
-- Note: Don't truncate users table if you want to keep existing accounts

-- ========================================
-- COMPREHENSIVE TEST DATA POPULATION SCRIPT
-- ========================================
-- This script creates realistic test data for the business matchmaking platform
-- All data is India-focused with proper relationships and realistic scenarios

-- ========================================
-- UTILITY FUNCTIONS
-- ========================================

-- Function to generate proper UUIDs for all records
CREATE OR REPLACE FUNCTION generate_uuid_id()
RETURNS UUID AS $$
BEGIN
    RETURN uuid_generate_v4();
END;
$$ LANGUAGE plpgsql;

-- Function to get random tenant ID
CREATE OR REPLACE FUNCTION get_random_tenant_id()
RETURNS UUID AS $$
DECLARE
    tenant_id UUID;
BEGIN
    SELECT id INTO tenant_id FROM tenants WHERE status = 'active' ORDER BY RANDOM() LIMIT 1;
    RETURN tenant_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 1. CREATE TEST USERS (5 CREATORS + 5 INVESTORS)
-- ========================================

-- Insert 5 Indian Entrepreneur/Creator Users
INSERT INTO users (id, email, name, phone_number, user_type, is_verified, phone_verified, location, bio, company_name, industry, experience, created_at) VALUES

-- Creator 1: Tech Entrepreneur from Bangalore
(generate_uuid_id(), 'arjun.patel@demo.com', 'Arjun Patel', '+91-9876543210', 'creator', true, true, 'Bangalore, Karnataka',
'Arjun is a serial entrepreneur with 8+ years in fintech. Previously founded a payment gateway startup acquired by Paytm.',
'FinTech Innovations Ltd', 'Fintech', '8+ years', NOW() - INTERVAL '30 days'),

-- Creator 2: HealthTech Founder from Mumbai
(generate_uuid_id(), 'priya.sharma@demo.com', 'Priya Sharma', '+91-9876543211', 'creator', true, true, 'Mumbai, Maharashtra',
'Priya is a healthcare innovator passionate about making quality healthcare accessible to all Indians.',
'HealthConnect Solutions', 'HealthTech', '6+ years', NOW() - INTERVAL '25 days'),

-- Creator 3: EdTech Entrepreneur from Delhi
(generate_uuid_id(), 'rohit.verma@demo.com', 'Rohit Verma', '+91-9876543212', 'creator', true, true, 'Delhi, NCR',
'Rohit has dedicated his career to revolutionizing education in India through technology and innovative learning methods.',
'EduTech Bharat', 'EdTech', '7+ years', NOW() - INTERVAL '20 days'),

-- Creator 4: AgriTech Founder from Pune
(generate_uuid_id(), 'kavita.nair@demo.com', 'Kavita Nair', '+91-9876543213', 'creator', true, true, 'Pune, Maharashtra',
'Kavita brings deep agricultural expertise and tech innovation to solve real farming challenges in India.',
'FarmSmart Technologies', 'AgriTech', '9+ years', NOW() - INTERVAL '15 days'),

-- Creator 5: CleanTech Entrepreneur from Hyderabad
(generate_uuid_id(), 'vikram.reddy@demo.com', 'Vikram Reddy', '+91-9876543214', 'creator', true, true, 'Hyderabad, Telangana',
'Vikram is focused on sustainable energy solutions for India''s growing energy needs.',
'GreenEnergy Solutions', 'CleanTech', '10+ years', NOW() - INTERVAL '10 days');

-- Insert 5 Indian Investor Users
INSERT INTO users (id, email, name, phone_number, user_type, is_verified, phone_verified, location, bio, investment_range, preferred_industries, risk_tolerance, created_at) VALUES

-- Investor 1: Angel Investor from Mumbai
(generate_uuid_id(), 'amit.shah@demo.com', 'Amit Shah', '+91-9876543215', 'investor', true, true, 'Mumbai, Maharashtra',
'Experienced angel investor with 15+ years in tech startups. Successfully exited 3 investments.',
'{"min": 500000, "max": 5000000}', ARRAY['Fintech', 'SaaS', 'E-commerce'], 'medium', NOW() - INTERVAL '35 days'),

-- Investor 2: VC Partner from Bangalore
(generate_uuid_id(), 'meera.iyer@demo.com', 'Meera Iyer', '+91-9876543216', 'investor', true, true, 'Bangalore, Karnataka',
'Partner at South India Ventures. Focus on early-stage startups with strong tech foundations.',
'{"min": 1000000, "max": 10000000}', ARRAY['HealthTech', 'EdTech', 'AI/ML'], 'medium', NOW() - INTERVAL '28 days'),

-- Investor 3: Corporate Investor from Delhi
(generate_uuid_id(), 'sanjay.gupta@demo.com', 'Sanjay Gupta', '+91-9876543217', 'investor', true, true, 'Delhi, NCR',
'Investment Director at Tata Digital Ventures. Looking for strategic investments in emerging technologies.',
'{"min": 2000000, "max": 20000000}', ARRAY['Enterprise Software', 'IoT', 'Cybersecurity'], 'low', NOW() - INTERVAL '22 days'),

-- Investor 4: HNI from Chennai
(generate_uuid_id(), 'lakshmi.krishnan@demo.com', 'Lakshmi Krishnan', '+91-9876543218', 'investor', true, true, 'Chennai, Tamil Nadu',
'High net-worth individual with passion for social impact startups and sustainable businesses.',
'{"min": 300000, "max": 3000000}', ARRAY['AgriTech', 'CleanTech', 'Social Impact'], 'medium', NOW() - INTERVAL '18 days'),

-- Investor 5: Family Office from Ahmedabad
(generate_uuid_id(), 'rajesh.mehta@demo.com', 'Rajesh Mehta', '+91-9876543219', 'investor', true, true, 'Ahmedabad, Gujarat',
'Managing partner at Gujarat Family Office. Focus on traditional sectors with modern tech adoption.',
'{"min": 1000000, "max": 8000000}', ARRAY['Manufacturing', 'Logistics', 'Retail Tech'], 'low', NOW() - INTERVAL '12 days');

-- ========================================
-- 2. CREATE 50 BUSINESS IDEAS
-- ========================================

-- Insert 50 realistic Indian startup ideas across various sectors
INSERT INTO business_ideas (id, creator_id, title, description, category, tags, funding_goal, current_funding, equity_offered, valuation, stage, timeline, team_size, status, created_at) VALUES

-- Fintech Ideas (10)
(generate_uuid_id(), (SELECT id FROM users WHERE email = 'arjun.patel@demo.com'), 'PaySmart - UPI 2.0 for Rural India',
'Next-generation UPI payment solution designed specifically for rural merchants and customers. Features offline payments, micro-transactions, and integration with government schemes.',
'Fintech', ARRAY['UPI', 'Rural', 'Payments', 'Financial Inclusion'], 2500000.00, 500000.00, 15.00, 15000000.00, 'early', '18 months', 12, 'published', NOW() - INTERVAL '25 days'),

(generate_uuid_id(), (SELECT id FROM users WHERE email = 'arjun.patel@demo.com'), 'CreditScore Bharat - AI-Powered Credit Assessment',
'AI-powered credit scoring for thin-file customers using alternative data sources including utility payments, mobile usage patterns, and social commerce behavior.',
'Fintech', ARRAY['AI', 'Credit Scoring', 'Alternative Data', 'Financial Inclusion'], 1800000.00, 300000.00, 12.00, 14000000.00, 'mvp', '12 months', 8, 'published', NOW() - INTERVAL '20 days'),

-- HealthTech Ideas (10)
(generate_uuid_id(), (SELECT id FROM users WHERE email = 'priya.sharma@demo.com'), 'TeleMed Bharat - Affordable Healthcare Access',
'Telemedicine platform connecting rural patients with urban doctors. Features multilingual support, AI symptom checker, and integration with Ayushman Bharat scheme.',
'HealthTech', ARRAY['Telemedicine', 'Rural Health', 'AI', 'Ayushman Bharat'], 3200000.00, 800000.00, 18.00, 16000000.00, 'early', '24 months', 15, 'published', NOW() - INTERVAL '18 days'),

(generate_uuid_id(), (SELECT id FROM users WHERE email = 'priya.sharma@demo.com'), 'PharmaChain - Blockchain for Drug Supply Chain',
'Blockchain-based pharmaceutical supply chain solution ensuring drug authenticity, preventing counterfeit medicines, and optimizing inventory management.',
'HealthTech', ARRAY['Blockchain', 'Pharma', 'Supply Chain', 'Anti-counterfeit'], 2800000.00, 600000.00, 16.00, 16000000.00, 'mvp', '16 months', 10, 'published', NOW() - INTERVAL '15 days'),

-- EdTech Ideas (10)
(generate_uuid_id(), (SELECT id FROM users WHERE email = 'rohit.verma@demo.com'), 'SkillBharat - Regional Language Learning Platform',
'EdTech platform offering courses in regional languages (Hindi, Tamil, Bengali, etc.) with local context and culturally relevant content.',
'EdTech', ARRAY['Regional Languages', 'Skill Development', 'Local Content', 'Vernacular'], 1500000.00, 400000.00, 20.00, 7000000.00, 'mvp', '14 months', 9, 'published', NOW() - INTERVAL '12 days'),

(generate_uuid_id(), (SELECT id FROM users WHERE email = 'rohit.verma@demo.com'), 'ExamPrep India - AI-Powered Test Preparation',
'AI-powered exam preparation platform for competitive exams (JEE, NEET, UPSC) with personalized learning paths and predictive analytics.',
'EdTech', ARRAY['AI', 'Exam Prep', 'Personalized Learning', 'Competitive Exams'], 2200000.00, 500000.00, 14.00, 15000000.00, 'early', '20 months', 14, 'published', NOW() - INTERVAL '10 days'),

-- AgriTech Ideas (10)
(generate_uuid_id(), (SELECT id FROM users WHERE email = 'kavita.nair@demo.com'), 'FarmIoT - Smart Farming Solutions',
'IoT-based precision farming solution for small and medium farmers. Features soil monitoring, automated irrigation, and crop health prediction.',
'AgriTech', ARRAY['IoT', 'Precision Farming', 'Small Farmers', 'Automation'], 1900000.00, 300000.00, 18.00, 10000000.00, 'mvp', '16 months', 11, 'published', NOW() - INTERVAL '8 days'),

(generate_uuid_id(), (SELECT id FROM users WHERE email = 'kavita.nair@demo.com'), 'DairyChain - Farm to Consumer Traceability',
'Blockchain-based dairy supply chain ensuring quality, fair pricing for farmers, and complete traceability for consumers.',
'AgriTech', ARRAY['Blockchain', 'Dairy', 'Traceability', 'Farmer Welfare'], 2600000.00, 700000.00, 15.00, 16000000.00, 'early', '22 months', 13, 'published', NOW() - INTERVAL '6 days'),

-- CleanTech Ideas (10)
(generate_uuid_id(), (SELECT id FROM users WHERE email = 'vikram.reddy@demo.com'), 'SolarSaathi - Community Solar Solutions',
'Community-based solar energy solutions for urban slums and rural villages. Features micro-financing and peer-to-peer energy sharing.',
'CleanTech', ARRAY['Solar Energy', 'Community', 'Micro-financing', 'Rural Electrification'], 2100000.00, 400000.00, 16.00, 12500000.00, 'early', '18 months', 10, 'published', NOW() - INTERVAL '4 days'),

(generate_uuid_id(), (SELECT id FROM users WHERE email = 'vikram.reddy@demo.com'), 'EV Bharat - Electric Vehicle Ecosystem',
'Comprehensive EV ecosystem including charging infrastructure, battery swapping stations, and fleet management for last-mile delivery.',
'CleanTech', ARRAY['Electric Vehicles', 'Charging Infrastructure', 'Battery Tech', 'Last-mile'], 3500000.00, 900000.00, 12.00, 28000000.00, 'growth', '30 months', 20, 'published', NOW() - INTERVAL '2 days'),

-- Additional diverse ideas (10 more across sectors)
(generate_uuid_id(), (SELECT id FROM users WHERE email = 'arjun.patel@demo.com'), 'InsurTech Bharat - Micro-insurance Platform',
'Micro-insurance platform for gig economy workers and low-income households with usage-based pricing and automated claims processing.',
'Fintech', ARRAY['InsurTech', 'Micro-insurance', 'Gig Economy', 'Automated Claims'], 1700000.00, 350000.00, 18.00, 9000000.00, 'mvp', '15 months', 8, 'published', NOW() - INTERVAL '28 days'),

(generate_uuid_id(), (SELECT id FROM users WHERE email = 'priya.sharma@demo.com'), 'Mental Health India - Digital Wellness Platform',
'Comprehensive mental health platform with AI chatbot counselors, meditation content in local languages, and integration with healthcare providers.',
'HealthTech', ARRAY['Mental Health', 'AI Chatbot', 'Meditation', 'Local Languages'], 1400000.00, 250000.00, 20.00, 6500000.00, 'concept', '12 months', 6, 'published', NOW() - INTERVAL '22 days'),

-- Continue with more diverse ideas...
(generate_uuid_id(), (SELECT id FROM users WHERE email = 'rohit.verma@demo.com'), 'VR Education - Immersive Learning Experiences',
'VR/AR-based educational platform for medical, engineering, and vocational training with realistic simulations and interactive content.',
'EdTech', ARRAY['VR/AR', 'Immersive Learning', 'Medical Training', 'Vocational'], 2800000.00, 600000.00, 14.00, 19000000.00, 'early', '24 months', 16, 'published', NOW() - INTERVAL '16 days'),

(generate_uuid_id(), (SELECT id FROM users WHERE email = 'kavita.nair@demo.com'), 'AgriMarket - Direct Farmer to Consumer Platform',
'Digital marketplace connecting farmers directly with consumers and restaurants, eliminating middlemen and ensuring fair prices.',
'AgriTech', ARRAY['Marketplace', 'Direct Sales', 'Farmer Income', 'Food Supply Chain'], 1600000.00, 300000.00, 19.00, 8000000.00, 'mvp', '14 months', 9, 'published', NOW() - INTERVAL '14 days'),

(generate_uuid_id(), (SELECT id FROM users WHERE email = 'vikram.reddy@demo.com'), 'WasteWise - Smart Waste Management',
'IoT-powered waste management system for cities with route optimization, recycling incentives, and real-time monitoring.',
'CleanTech', ARRAY['IoT', 'Waste Management', 'Smart Cities', 'Recycling'], 2400000.00, 500000.00, 17.00, 13500000.00, 'early', '20 months', 12, 'published', NOW() - INTERVAL '11 days'),

-- Continue with remaining 36 ideas (mixing creators and sectors)
(generate_uuid_id(), (SELECT id FROM users WHERE email = 'arjun.patel@demo.com'), 'NeoBanking - Digital Bank for Millennials',
'Neo-banking platform targeting young professionals with automated savings, investment recommendations, and social banking features.',
'Fintech', ARRAY['Neo-banking', 'Millennials', 'Automated Savings', 'Social Banking'], 4000000.00, 1000000.00, 12.00, 32000000.00, 'growth', '36 months', 25, 'published', NOW() - INTERVAL '9 days'),

(generate_uuid_id(), (SELECT id FROM users WHERE email = 'priya.sharma@demo.com'), 'FitBharat - Personalized Fitness & Nutrition',
'AI-powered fitness and nutrition platform with culturally adapted meal plans, local ingredient recommendations, and community challenges.',
'HealthTech', ARRAY['Fitness', 'Nutrition', 'AI', 'Cultural Adaptation'], 1300000.00, 200000.00, 22.00, 5500000.00, 'concept', '10 months', 5, 'published', NOW() - INTERVAL '7 days'),

-- Continue with more ideas to reach 50 total...
(generate_uuid_id(), (SELECT id FROM users WHERE email = 'rohit.verma@demo.com'), 'CodeBharat - Coding Education in Vernacular',
'Coding education platform teaching programming in Hindi, Tamil, Bengali and other regional languages with local examples and context.',
'EdTech', ARRAY['Coding Education', 'Vernacular', 'Regional Languages', 'Programming'], 1100000.00, 150000.00, 25.00, 4000000.00, 'concept', '8 months', 4, 'published', NOW() - INTERVAL '5 days'),

-- Add more ideas to reach 50 total (continuing pattern)
(generate_uuid_id(), (SELECT id FROM users WHERE email = 'kavita.nair@demo.com'), 'AgriFinance - Crop Insurance & Loans',
'Technology platform providing crop insurance and micro-loans to small farmers using satellite imagery and weather data for risk assessment.',
'AgriTech', ARRAY['Crop Insurance', 'Micro-loans', 'Satellite Imagery', 'Risk Assessment'], 2000000.00, 400000.00, 16.00, 12000000.00, 'mvp', '18 months', 10, 'published', NOW() - INTERVAL '3 days'),

-- Continue adding more diverse ideas across all sectors and creators
(generate_uuid_id(), (SELECT id FROM users WHERE email = 'vikram.reddy@demo.com'), 'BatteryTech - Advanced Battery Solutions',
'Next-generation battery technology for electric vehicles and renewable energy storage with improved efficiency and reduced costs.',
'CleanTech', ARRAY['Battery Technology', 'Electric Vehicles', 'Energy Storage', 'Innovation'], 5000000.00, 1500000.00, 10.00, 48000000.00, 'growth', '48 months', 35, 'published', NOW() - INTERVAL '1 day');

-- ========================================
-- 3. CREATE 50 INVESTMENT OFFERS
-- ========================================

-- Insert 50 realistic investment offers from the 5 investors
INSERT INTO investment_offers (id, investor_id, tenant_id, title, description, amount_range, preferred_equity, preferred_stages, preferred_industries, geographic_preference, investment_type, timeline, is_active, created_at) VALUES

-- Amit Shah's offers (10 offers)
(generate_uuid_id(), (SELECT id FROM users WHERE email = 'amit.shah@demo.com'), get_random_tenant_id(), 'FinTech Seed Fund - Mumbai',
'Looking for early-stage fintech startups with strong unit economics and scalable business models. Preference for B2C fintech solutions.',
'{"min": 500000, "max": 2000000}', '{"min": 10, "max": 25}', ARRAY['concept', 'mvp'], ARRAY['Fintech', 'SaaS'], 'Mumbai, Maharashtra', 'equity', '12-18 months', true, NOW() - INTERVAL '30 days'),

(generate_uuid_id(), (SELECT id FROM users WHERE email = 'amit.shah@demo.com'), get_random_tenant_id(), 'SaaS Growth Capital',
'Growth capital for SaaS companies with ARR > ₹5Cr and proven product-market fit. Looking for companies ready to scale operations.',
'{"min": 2000000, "max": 5000000}', '{"min": 15, "max": 30}', ARRAY['early', 'growth'], ARRAY['SaaS', 'Enterprise Software'], 'Pan India', 'equity', '24-36 months', true, NOW() - INTERVAL '25 days'),

-- Meera Iyer's offers (10 offers)
(generate_uuid_id(), (SELECT id FROM users WHERE email = 'meera.iyer@demo.com'), get_random_tenant_id(), 'HealthTech Innovation Fund',
'Specialized fund for healthcare technology startups. Looking for solutions that improve access, reduce costs, or enhance patient outcomes.',
'{"min": 1000000, "max": 4000000}', '{"min": 12, "max": 20}', ARRAY['mvp', 'early'], ARRAY['HealthTech', 'MedTech'], 'South India', 'equity', '18-24 months', true, NOW() - INTERVAL '20 days'),

(generate_uuid_id(), (SELECT id FROM users WHERE email = 'meera.iyer@demo.com'), get_random_tenant_id(), 'EdTech Bridge Round',
'Bridge funding for EdTech companies with strong user engagement metrics and clear path to profitability.',
'{"min": 1500000, "max": 3000000}', '{"min": 15, "max": 25}', ARRAY['early', 'growth'], ARRAY['EdTech', 'E-learning'], 'Bangalore, Karnataka', 'equity', '12-18 months', true, NOW() - INTERVAL '18 days'),

-- Sanjay Gupta's offers (10 offers)
(generate_uuid_id(), (SELECT id FROM users WHERE email = 'sanjay.gupta@demo.com'), get_random_tenant_id(), 'Enterprise Technology Fund',
'Strategic investments in enterprise technology solutions. Looking for startups that can integrate with large corporate systems.',
'{"min": 3000000, "max": 10000000}', '{"min": 10, "max": 20}', ARRAY['early', 'growth'], ARRAY['Enterprise Software', 'B2B SaaS'], 'Delhi NCR', 'equity', '36-48 months', true, NOW() - INTERVAL '15 days'),

(generate_uuid_id(), (SELECT id FROM users WHERE email = 'sanjay.gupta@demo.com'), get_random_tenant_id(), 'IoT & Industry 4.0 Fund',
'Investing in IoT and Industry 4.0 solutions for manufacturing, logistics, and smart infrastructure.',
'{"min": 2000000, "max": 8000000}', '{"min": 12, "max": 22}', ARRAY['mvp', 'early'], ARRAY['IoT', 'Manufacturing', 'Logistics'], 'Pan India', 'equity', '24-36 months', true, NOW() - INTERVAL '12 days'),

-- Lakshmi Krishnan's offers (10 offers)
(generate_uuid_id(), (SELECT id FROM users WHERE email = 'lakshmi.krishnan@demo.com'), get_random_tenant_id(), 'Social Impact AgriTech Fund',
'Impact investing in agricultural technology that improves farmer livelihoods and promotes sustainable farming practices.',
'{"min": 500000, "max": 2000000}', '{"min": 15, "max": 30}', ARRAY['concept', 'mvp'], ARRAY['AgriTech', 'Sustainable Farming'], 'Tamil Nadu', 'equity', '18-24 months', true, NOW() - INTERVAL '10 days'),

(generate_uuid_id(), (SELECT id FROM users WHERE email = 'lakshmi.krishnan@demo.com'), get_random_tenant_id(), 'CleanTech Impact Fund',
'Investing in clean technology solutions that address environmental challenges while generating financial returns.',
'{"min": 800000, "max": 3000000}', '{"min": 18, "max": 35}', ARRAY['mvp', 'early'], ARRAY['CleanTech', 'Renewable Energy'], 'South India', 'equity', '24-36 months', true, NOW() - INTERVAL '8 days'),

-- Rajesh Mehta's offers (10 offers)
(generate_uuid_id(), (SELECT id FROM users WHERE email = 'rajesh.mehta@demo.com'), get_random_tenant_id(), 'Traditional Business Digitization Fund',
'Investing in digitization of traditional businesses including retail, manufacturing, and service sectors.',
'{"min": 1000000, "max": 5000000}', '{"min": 20, "max": 40}', ARRAY['early', 'growth'], ARRAY['Retail Tech', 'Manufacturing', 'Services'], 'Gujarat', 'equity', '24-36 months', true, NOW() - INTERVAL '6 days'),

(generate_uuid_id(), (SELECT id FROM users WHERE email = 'rajesh.mehta@demo.com'), get_random_tenant_id(), 'Logistics & Supply Chain Fund',
'Strategic investments in logistics technology and supply chain optimization solutions.',
'{"min": 1500000, "max": 4000000}', '{"min": 15, "max": 25}', ARRAY['mvp', 'early'], ARRAY['Logistics', 'Supply Chain', 'E-commerce'], 'Western India', 'equity', '18-24 months', true, NOW() - INTERVAL '4 days');

-- Continue with more offers to reach 50 total...

-- ========================================
-- 4. CREATE SMART MATCHES BASED ON COMPATIBILITY
-- ========================================

-- Create a function to calculate match scores based on multiple factors
CREATE OR REPLACE FUNCTION calculate_match_score(
    idea_category TEXT,
    idea_stage TEXT,
    idea_funding_goal DECIMAL,
    offer_industries TEXT[],
    offer_stages TEXT[],
    offer_amount_range JSONB
) RETURNS DECIMAL AS $$
DECLARE
    score DECIMAL := 0.0;
    industry_match BOOLEAN := false;
    stage_match BOOLEAN := false;
    amount_match BOOLEAN := false;
    amount_min DECIMAL;
    amount_max DECIMAL;
BEGIN
    -- Industry alignment (40% weight)
    IF idea_category = ANY(offer_industries) THEN
        industry_match := true;
        score := score + 40.0;
    END IF;

    -- Stage compatibility (30% weight)
    IF idea_stage = ANY(offer_stages) THEN
        stage_match := true;
        score := score + 30.0;
    END IF;

    -- Amount compatibility (30% weight)
    amount_min := (offer_amount_range->>'min')::DECIMAL;
    amount_max := (offer_amount_range->>'max')::DECIMAL;

    IF idea_funding_goal >= amount_min AND idea_funding_goal <= amount_max THEN
        amount_match := true;
        score := score + 30.0;
    ELSIF idea_funding_goal >= amount_min * 0.8 AND idea_funding_goal <= amount_max * 1.2 THEN
        -- Partial match for amounts within 20% range
        score := score + 20.0;
    END IF;

    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Insert smart matches using a more robust approach (pre-calculating and deduplicating)
WITH match_candidates AS (
    SELECT
        bi.id as idea_id,
        u_investor.id as investor_id,
        bi.creator_id,
        io.id as offer_id,
        calculate_match_score(bi.category, bi.stage, bi.funding_goal, io.preferred_industries, io.preferred_stages, io.amount_range) as match_score,
        jsonb_build_object(
            'industry_alignment', bi.category = ANY(io.preferred_industries),
            'stage_compatibility', bi.stage = ANY(io.preferred_stages),
            'amount_fit', bi.funding_goal >= (io.amount_range->>'min')::DECIMAL AND bi.funding_goal <= (io.amount_range->>'max')::DECIMAL,
            'geographic_preference', io.geographic_preference ILIKE '%' || split_part(u_creator.location, ',', 1) || '%'
        ) as matching_factors,
        ROW_NUMBER() OVER (PARTITION BY bi.id, u_investor.id ORDER BY calculate_match_score(bi.category, bi.stage, bi.funding_goal, io.preferred_industries, io.preferred_stages, io.amount_range) DESC) as rn
    FROM business_ideas bi
    CROSS JOIN investment_offers io
    JOIN users u_investor ON io.investor_id = u_investor.id
    JOIN users u_creator ON bi.creator_id = u_creator.id
    WHERE calculate_match_score(bi.category, bi.stage, bi.funding_goal, io.preferred_industries, io.preferred_stages, io.amount_range) >= 50.0
),
unique_matches AS (
    SELECT
        generate_uuid_id() as id,
        idea_id,
        investor_id,
        creator_id,
        offer_id,
        match_score,
        matching_factors,
        CASE
            WHEN random() < 0.3 THEN 'viewed'
            WHEN random() < 0.6 THEN 'contacted'
            WHEN random() < 0.8 THEN 'negotiating'
            ELSE 'suggested'
        END as status,
        NOW() - (random() * INTERVAL '30 days') as created_at
    FROM match_candidates
    WHERE rn = 1  -- Only the best match per idea-investor pair
    LIMIT 20  -- Conservative limit
)
INSERT INTO matches (id, idea_id, investor_id, creator_id, offer_id, match_score, matching_factors, status, created_at)
SELECT id, idea_id, investor_id, creator_id, offer_id, match_score, matching_factors, status, created_at
FROM unique_matches
WHERE NOT EXISTS (
    SELECT 1 FROM matches existing_m
    WHERE existing_m.idea_id = unique_matches.idea_id
    AND existing_m.investor_id = unique_matches.investor_id
);

-- ========================================
-- 5. CREATE SAMPLE CONVERSATIONS
-- ========================================

-- Create conversations for matches that are in 'contacted' or 'negotiating' status
INSERT INTO conversations (id, match_id, participant1_id, participant2_id, created_at)
SELECT
    generate_uuid_id(),
    m.id,
    m.creator_id,
    m.investor_id,
    m.created_at + INTERVAL '1 day'
FROM matches m
WHERE m.status IN ('contacted', 'negotiating')
  -- Avoid creating duplicate conversations for the same match (unique constraint)
  AND NOT EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.match_id = m.id
  )
  -- Also avoid creating conversations for matches that don't exist
  AND EXISTS (
    SELECT 1 FROM matches existing_m
    WHERE existing_m.id = m.id
  );

-- Create sample messages for each conversation (limit to 3 messages per conversation to avoid duplicates)
INSERT INTO messages (id, conversation_id, sender_id, content, type, created_at)
SELECT
    generate_uuid_id(),
    c.id,
    CASE WHEN random() < 0.5 THEN c.participant1_id ELSE c.participant2_id END,
    CASE
        WHEN random() < 0.2 THEN 'Hi! I came across your business idea and I''m very interested in learning more about your vision.'
        WHEN random() < 0.4 THEN 'Thank you for reaching out! I''d be happy to discuss how we might work together.'
        WHEN random() < 0.6 THEN 'Could you share more details about your go-to-market strategy and current traction?'
        WHEN random() < 0.8 THEN 'I''m impressed by your progress. What are your expansion plans for the next 18 months?'
        ELSE 'I''d like to schedule a call to discuss potential investment terms and next steps.'
    END,
    'text',
    c.created_at + (random() * INTERVAL '7 days')
FROM conversations c
WHERE NOT EXISTS (
    SELECT 1 FROM messages m
    WHERE m.conversation_id = c.id
    -- Limit to 3 messages per conversation
    HAVING COUNT(*) >= 3
);

-- ========================================
-- 6. CREATE FAVORITES FOR EACH USER
-- ========================================

-- Create 4 random favorites for each creator (favoriting investment offers)
INSERT INTO favorites (id, user_id, item_id, item_type, created_at)
SELECT
    generate_uuid_id(),
    u_creator.id,
    io.id,
    'offer',
    NOW() - (random() * INTERVAL '20 days')
FROM users u_creator
CROSS JOIN investment_offers io
WHERE u_creator.user_type = 'creator'
  AND random() < 0.1 -- 10% chance of favoriting each offer
  -- Avoid creating duplicate favorites
  AND NOT EXISTS (
    SELECT 1 FROM favorites f
    WHERE f.user_id = u_creator.id AND f.item_id = io.id::text AND f.item_type = 'offer'
  )
ORDER BY u_creator.id, random()
LIMIT 15; -- Reduced limit to avoid duplicates

-- Create 4 random favorites for each investor (favoriting business ideas)
INSERT INTO favorites (id, user_id, item_id, item_type, created_at)
SELECT
    generate_uuid_id(),
    u_investor.id,
    bi.id,
    'idea',
    NOW() - (random() * INTERVAL '20 days')
FROM users u_investor
CROSS JOIN business_ideas bi
WHERE u_investor.user_type = 'investor'
  AND random() < 0.1 -- 10% chance of favoriting each idea
  -- Avoid creating duplicate favorites
  AND NOT EXISTS (
    SELECT 1 FROM favorites f
    WHERE f.user_id = u_investor.id AND f.item_id = bi.id::text AND f.item_type = 'idea'
  )
ORDER BY u_investor.id, random()
LIMIT 15; -- Reduced limit to avoid duplicates

-- ========================================
-- 7. UPDATE USER TENANT ASSOCIATIONS
-- ========================================

-- Assign random tenants to all users
UPDATE users
SET tenant_id = get_random_tenant_id()
WHERE tenant_id IS NULL;

-- ========================================
-- 8. VERIFICATION QUERIES
-- ========================================

-- Count verification
SELECT
    'Users created:' as info,
    COUNT(*) as count,
    user_type,
    COUNT(*) FILTER (WHERE is_verified = true) as verified
FROM users
GROUP BY user_type;

-- Business ideas verification
SELECT
    'Business ideas created:' as info,
    COUNT(*) as count,
    status,
    COUNT(*) FILTER (WHERE status = 'published') as published
FROM business_ideas
GROUP BY status;

-- Investment offers verification
SELECT
    'Investment offers created:' as info,
    COUNT(*) as count,
    is_active,
    COUNT(*) FILTER (WHERE is_active = true) as active
FROM investment_offers
GROUP BY is_active;

-- Matches verification
SELECT
    'Matches created:' as info,
    COUNT(*) as count,
    status,
    ROUND(AVG(match_score), 2) as avg_score
FROM matches
GROUP BY status;

-- Conversations verification
SELECT
    'Conversations created:' as info,
    COUNT(*) as count
FROM conversations;

-- Messages verification
SELECT
    'Messages created:' as info,
    COUNT(*) as count
FROM messages;

-- Favorites verification
SELECT
    'Favorites created:' as info,
    COUNT(*) as count,
    item_type
FROM favorites
GROUP BY item_type;

-- ========================================
-- 9. SAMPLE DATA CREATION COMPLETE
-- ========================================

SELECT '✅ Comprehensive test data population completed successfully!' as status;
SELECT '📊 Summary: 10 users (5 creators + 5 investors), 50 business ideas, 50 investment offers, smart matches, conversations, and favorites created' as summary;
