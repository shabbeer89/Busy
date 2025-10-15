-- ========================================
-- South India Multitenant Sample Data
-- Strategic Partnership Platform
-- ========================================

-- ========================================
-- 1. CREATE 3 SOUTH INDIAN TENANTS/ORGANIZATIONS
-- ========================================

INSERT INTO tenants (id, name, slug, status, settings)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Chennai Innovation Hub', 'chennai-hub', 'active', '{
    "branding": {
      "primary_color": "#1e40af",
      "secondary_color": "#3b82f6",
      "accent_color": "#f59e0b",
      "name": "Chennai Innovation Hub",
      "logo": "/logos/chennai-hub.png"
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
  }'::jsonb),

  ('550e8400-e29b-41d4-a716-446655440002', 'Bangalore Tech Collective', 'bangalore-tech', 'active', '{
    "branding": {
      "primary_color": "#059669",
      "secondary_color": "#10b981",
      "accent_color": "#f59e0b",
      "name": "Bangalore Tech Collective",
      "logo": "/logos/bangalore-tech.png"
    },
    "features": {
      "ai_recommendations": true,
      "advanced_analytics": true,
      "custom_branding": true,
      "api_access": true
    },
    "limits": {
      "max_users": 1500,
      "max_projects": 750,
      "storage_limit": 21474836480
    }
  }'::jsonb),

  ('550e8400-e29b-41d4-a716-446655440003', 'Hyderabad Startup Network', 'hyderabad-startups', 'active', '{
    "branding": {
      "primary_color": "#7c3aed",
      "secondary_color": "#8b5cf6",
      "accent_color": "#ec4899",
      "name": "Hyderabad Startup Network",
      "logo": "/logos/hyderabad-startups.png"
    },
    "features": {
      "ai_recommendations": true,
      "advanced_analytics": true,
      "custom_branding": true,
      "api_access": true
    },
    "limits": {
      "max_users": 800,
      "max_projects": 400,
      "storage_limit": 8589934592
    }
  }'::jsonb);

-- ========================================
-- 2. CREATE TENANT SUBSCRIPTIONS
-- ========================================

INSERT INTO tenant_subscriptions (tenant_id, plan, features, status, current_period_start, current_period_end)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'professional', '{
    "ai_recommendations": true,
    "advanced_analytics": true,
    "custom_branding": true,
    "api_access": true
  }'::jsonb, 'active', NOW(), NOW() + INTERVAL '1 year'),

  ('550e8400-e29b-41d4-a716-446655440002', 'enterprise', '{
    "ai_recommendations": true,
    "advanced_analytics": true,
    "custom_branding": true,
    "api_access": true
  }'::jsonb, 'active', NOW(), NOW() + INTERVAL '1 year'),

  ('550e8400-e29b-41d4-a716-446655440003', 'starter', '{
    "ai_recommendations": true,
    "advanced_analytics": false,
    "custom_branding": false,
    "api_access": false
  }'::jsonb, 'active', NOW(), NOW() + INTERVAL '1 year');

-- ========================================
-- 3. CREATE 30 USERS (10 per tenant) - SOUTH INDIA FOCUSED
-- ========================================

-- CHENNAI HUB USERS (10 users)
INSERT INTO users (id, email, name, phone_number, user_type, is_verified, phone_verified, tenant_id, company_name, industry, experience, bio, location, website)
VALUES
  ('600e8400-e29b-41d4-a716-446655440001', 'arjun.patel@chennai-hub.com', 'Arjun Patel', '+91-94440-12345', 'creator', true, true, '550e8400-e29b-41d4-a716-446655440001', 'AgriTech Solutions', 'Agriculture Technology', '8+ years', 'Revolutionizing Tamil Nadu agriculture with IoT and AI-powered solutions for small farmers', 'Chennai, Tamil Nadu', 'https://agritech-solutions.com'),
  ('600e8400-e29b-41d4-a716-446655440002', 'priya.krishnan@chennai-hub.com', 'Priya Krishnan', '+91-94440-12346', 'creator', true, true, '550e8400-e29b-41d4-a716-446655440001', 'EduBridge', 'Education Technology', '6+ years', 'Bridging educational gaps in rural Tamil Nadu through innovative digital learning platforms', 'Coimbatore, Tamil Nadu', 'https://edubridge-learning.com'),
  ('600e8400-e29b-41d4-a716-446655440003', 'ravi.shankar@chennai-hub.com', 'Ravi Shankar', '+91-94440-12347', 'investor', true, true, '550e8400-e29b-41d4-a716-446655440001', 'Chennai Angels', 'Investment', '12+ years', 'Serial investor focused on Tamil Nadu startups with social impact', 'Chennai, Tamil Nadu', 'https://chennai-angels.in'),
  ('600e8400-e29b-41d4-a716-446655440004', 'deepa.nair@chennai-hub.com', 'Deepa Nair', '+91-94440-12348', 'creator', true, true, '550e8400-e29b-41d4-a716-446655440001', 'HealthTech Innovations', 'Healthcare Technology', '7+ years', 'Improving healthcare accessibility in South Tamil Nadu through telemedicine solutions', 'Madurai, Tamil Nadu', 'https://healthtech-innovations.com'),
  ('600e8400-e29b-41d4-a716-446655440005', 'karthik.bala@chennai-hub.com', 'Karthik Balaji', '+91-94440-12349', 'investor', true, true, '550e8400-e29b-41d4-a716-446655440001', 'SouthInvest Partners', 'Investment', '10+ years', 'Investment firm specializing in South Indian technology startups', 'Chennai, Tamil Nadu', 'https://southinvest.in'),
  ('600e8400-e29b-41d4-a716-446655440006', 'anitha.mohan@chennai-hub.com', 'Anitha Mohan', '+91-94440-12350', 'creator', true, true, '550e8400-e29b-41d4-a716-446655440001', 'CleanEnergy Tamil Nadu', 'Clean Energy', '5+ years', 'Developing solar energy solutions for rural Tamil Nadu communities', 'Trichy, Tamil Nadu', 'https://cleanenergy-tn.com'),
  ('600e8400-e29b-41d4-a716-446655440007', 'vijay.kumar@chennai-hub.com', 'Vijay Kumar', '+91-94440-12351', 'creator', true, true, '550e8400-e29b-41d4-a716-446655440001', 'Fisheries Tech', 'Fisheries Technology', '9+ years', 'Modernizing traditional fishing communities in coastal Tamil Nadu', 'Nagapattinam, Tamil Nadu', 'https://fisheries-tech.com'),
  ('600e8400-e29b-41d4-a716-446655440008', 'meera.lakshmi@chennai-hub.com', 'Meera Lakshmi', '+91-94440-12352', 'investor', true, true, '550e8400-e29b-41d4-a716-446655440001', 'TN Growth Capital', 'Investment', '8+ years', 'Growth stage investor focused on Tamil Nadu based companies', 'Chennai, Tamil Nadu', 'https://tngrowth.com'),
  ('600e8400-e29b-41d4-a716-446655440009', 'suresh.babu@chennai-hub.com', 'Suresh Babu', '+91-94440-12353', 'creator', true, true, '550e8400-e29b-41d4-a716-446655440001', 'TextileTech Innovations', 'Textile Technology', '11+ years', 'Revolutionizing Tamil Nadu textile industry with sustainable technologies', 'Tiruppur, Tamil Nadu', 'https://textiletech-innovations.com'),
  ('600e8400-e29b-41d4-a716-446655440010', 'kavitha.rajan@chennai-hub.com', 'Kavitha Rajan', '+91-94440-12354', 'creator', true, true, '550e8400-e29b-41d4-a716-446655440001', 'FinTech Tamil', 'Financial Technology', '6+ years', 'Digital financial inclusion for underserved communities in Tamil Nadu', 'Chennai, Tamil Nadu', 'https://fintech-tamil.com');

-- BANGALORE TECH USERS (10 users)
INSERT INTO users (id, email, name, phone_number, user_type, is_verified, phone_verified, tenant_id, company_name, industry, experience, bio, location, website)
VALUES
  ('600e8400-e29b-41d4-a716-446655440011', 'rohit.sharma@bangalore-tech.com', 'Rohit Sharma', '+91-94450-12345', 'creator', true, true, '550e8400-e29b-41d4-a716-446655440002', 'AI Solutions Karnataka', 'Artificial Intelligence', '7+ years', 'AI-powered analytics for Karnataka agricultural sector optimization', 'Bangalore, Karnataka', 'https://ai-solutions-karnataka.com'),
  ('600e8400-e29b-41d4-a716-446655440012', 'sunita.patel@bangalore-tech.com', 'Sunita Patel', '+91-94450-12346', 'investor', true, true, '550e8400-e29b-41d4-a716-446655440002', 'Bangalore Ventures', 'Investment', '15+ years', 'Leading venture capital firm in Bangalore focused on Karnataka startups', 'Bangalore, Karnataka', 'https://bangalore-ventures.com'),
  ('600e8400-e29b-41d4-a716-446655440013', 'amit.kumar@bangalore-tech.com', 'Amit Kumar', '+91-94450-12347', 'creator', true, true, '550e8400-e29b-41d4-a716-446655440002', 'Mobility Solutions', 'Transportation', '8+ years', 'Smart mobility solutions for Bangalore traffic congestion', 'Bangalore, Karnataka', 'https://mobility-solutions.in'),
  ('600e8400-e29b-41d4-a716-446655440014', 'divya.nair@bangalore-tech.com', 'Divya Nair', '+91-94450-12348', 'creator', true, true, '550e8400-e29b-41d4-a716-446655440002', 'HealthAI Karnataka', 'Healthcare AI', '5+ years', 'AI-powered healthcare diagnostics for Karnataka hospitals', 'Mysore, Karnataka', 'https://healthai-karnataka.com'),
  ('600e8400-e29b-41d4-a716-446655440015', 'vikram.singh@bangalore-tech.com', 'Vikram Singh', '+91-94450-12349', 'investor', true, true, '550e8400-e29b-41d4-a716-446655440002', 'Karnataka Angels', 'Investment', '9+ years', 'Angel investment network for Karnataka entrepreneurs', 'Bangalore, Karnataka', 'https://karnataka-angels.in'),
  ('600e8400-e29b-41d4-a716-446655440016', 'pooja.gupta@bangalore-tech.com', 'Pooja Gupta', '+91-94450-12350', 'creator', true, true, '550e8400-e29b-41d4-a716-446655440002', 'EduTech Karnataka', 'Education Technology', '6+ years', 'Digital education platforms for Karnataka government schools', 'Bangalore, Karnataka', 'https://edutech-karnataka.com'),
  ('600e8400-e29b-41d4-a716-446655440017', 'manoj.reddy@bangalore-tech.com', 'Manoj Reddy', '+91-94450-12351', 'creator', true, true, '550e8400-e29b-41d4-a716-446655440002', 'AgriTech Karnataka', 'Agriculture Technology', '10+ years', 'Precision farming solutions for Karnataka farmers', 'Hubli, Karnataka', 'https://agritech-karnataka.com'),
  ('600e8400-e29b-41d4-a716-446655440018', 'sneha.das@bangalore-tech.com', 'Sneha Das', '+91-94450-12352', 'investor', true, true, '550e8400-e29b-41d4-a716-446655440002', 'Bangalore Growth Fund', 'Investment', '7+ years', 'Growth capital for Karnataka based technology companies', 'Bangalore, Karnataka', 'https://bangalore-growth.com'),
  ('600e8400-e29b-41d4-a716-446655440019', 'arun.naik@bangalore-tech.com', 'Arun Naik', '+91-94450-12353', 'creator', true, true, '550e8400-e29b-41d4-a716-446655440002', 'CleanTech Karnataka', 'Clean Technology', '8+ years', 'Renewable energy solutions for Karnataka industries', 'Mangalore, Karnataka', 'https://cleantech-karnataka.com'),
  ('600e8400-e29b-41d4-a716-446655440020', 'preethi.krishna@bangalore-tech.com', 'Preethi Krishna', '+91-94450-12354', 'creator', true, true, '550e8400-e29b-41d4-a716-446655440002', 'FinTech Karnataka', 'Financial Technology', '6+ years', 'Digital banking solutions for Karnataka rural communities', 'Bangalore, Karnataka', 'https://fintech-karnataka.com');

-- HYDERABAD STARTUPS USERS (10 users)
INSERT INTO users (id, email, name, phone_number, user_type, is_verified, phone_verified, tenant_id, company_name, industry, experience, bio, location, website)
VALUES
  ('600e8400-e29b-41d4-a716-446655440021', 'srinivas.raju@hyderabad-startups.com', 'Srinivas Raju', '+91-94460-12345', 'creator', true, true, '550e8400-e29b-41d4-a716-446655440003', 'Telangana AgriTech', 'Agriculture Technology', '9+ years', 'Innovative farming solutions for Telangana agricultural sector', 'Hyderabad, Telangana', 'https://telangana-agritech.com'),
  ('600e8400-e29b-41d4-a716-446655440022', 'anusha.verma@hyderabad-startups.com', 'Anusha Verma', '+91-94460-12346', 'investor', true, true, '550e8400-e29b-41d4-a716-446655440003', 'Hyderabad Capital', 'Investment', '11+ years', 'Premier investment firm in Hyderabad for Telangana startups', 'Hyderabad, Telangana', 'https://hyderabad-capital.in'),
  ('600e8400-e29b-41d4-a716-446655440023', 'mahesh.gowda@hyderabad-startups.com', 'Mahesh Gowda', '+91-94460-12347', 'creator', true, true, '550e8400-e29b-41d4-a716-446655440003', 'PharmaTech Telangana', 'Pharmaceutical Technology', '12+ years', 'Advanced pharmaceutical manufacturing technologies for Telangana', 'Hyderabad, Telangana', 'https://pharmatech-telangana.com'),
  ('600e8400-e29b-41d4-a716-446655440024', 'swathi.reddy@hyderabad-startups.com', 'Swathi Reddy', '+91-94460-12348', 'creator', true, true, '550e8400-e29b-41d4-a716-446655440003', 'EduSolutions Telangana', 'Education Technology', '7+ years', 'Digital learning platforms for Telangana educational institutions', 'Warangal, Telangana', 'https://edusolutions-telangana.com'),
  ('600e8400-e29b-41d4-a716-446655440025', 'ramesh.babu@hyderabad-startups.com', 'Ramesh Babu', '+91-94460-12349', 'investor', true, true, '550e8400-e29b-41d4-a716-446655440003', 'Telangana Ventures', 'Investment', '13+ years', 'Investment firm focused on Telangana innovation ecosystem', 'Hyderabad, Telangana', 'https://telangana-ventures.in'),
  ('600e8400-e29b-41d4-a716-446655440026', 'kiran.kumar@hyderabad-startups.com', 'Kiran Kumar', '+91-94460-12350', 'creator', true, true, '550e8400-e29b-41d4-a716-446655440003', 'LogisticsTech Telangana', 'Logistics Technology', '8+ years', 'Smart logistics solutions for Telangana supply chain optimization', 'Hyderabad, Telangana', 'https://logisticstech-telangana.com'),
  ('600e8400-e29b-41d4-a716-446655440027', 'divya.sharma@hyderabad-startups.com', 'Divya Sharma', '+91-94460-12351', 'creator', true, true, '550e8400-e29b-41d4-a716-446655440003', 'HealthTech Telangana', 'Healthcare Technology', '6+ years', 'Telemedicine platforms for Telangana healthcare accessibility', 'Khammam, Telangana', 'https://healthtech-telangana.com'),
  ('600e8400-e29b-41d4-a716-446655440028', 'santosh.patel@hyderabad-startups.com', 'Santosh Patel', '+91-94460-12352', 'investor', true, true, '550e8400-e29b-41d4-a716-446655440003', 'Hyderabad Innovation Fund', 'Investment', '9+ years', 'Early-stage investment fund for Hyderabad based startups', 'Hyderabad, Telangana', 'https://hyderabad-innovation.com'),
  ('600e8400-e29b-41d4-a716-446655440029', 'meghana.rao@hyderabad-startups.com', 'Meghana Rao', '+91-94460-12353', 'creator', true, true, '550e8400-e29b-41d4-a716-446655440003', 'Renewable Energy Telangana', 'Clean Energy', '7+ years', 'Solar and wind energy solutions for Telangana industries', 'Nizamabad, Telangana', 'https://renewable-telangana.com'),
  ('600e8400-e29b-41d4-a716-446655440030', 'harish.gupta@hyderabad-startups.com', 'Harish Gupta', '+91-94460-12354', 'creator', true, true, '550e8400-e29b-41d4-a716-446655440003', 'FinTech Telangana', 'Financial Technology', '8+ years', 'Digital financial services for Telangana unbanked populations', 'Hyderabad, Telangana', 'https://fintech-telangana.com');

-- ========================================
-- 4. CREATE 30 BUSINESS IDEAS (10 per category, distributed across tenants)
-- Categories: AgriTech, EduTech, HealthTech, CleanTech, FinTech
-- ========================================

-- AGRITECH IDEAS (6 ideas)
INSERT INTO business_ideas (id, creator_id, title, description, category, tags, funding_goal, current_funding, equity_offered, stage, timeline, status)
VALUES
  ('700e8400-e29b-41d4-a716-446655440001', '600e8400-e29b-41d4-a716-446655440001', 'AI-Powered Crop Disease Detection System', 'Revolutionary AI system using computer vision to detect crop diseases in Tamil Nadu farms within minutes, helping farmers save crops and increase yield by 40%. The system uses smartphone cameras and works offline.', 'Agriculture Technology', ARRAY['ai', 'computer-vision', 'mobile-app', 'agriculture', 'tamil-nadu'], 2500000, 0, 15, 'mvp', '12 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440002', '600e8400-e29b-41d4-a716-446655440011', 'Smart Irrigation System for Karnataka Farms', 'IoT-based precision irrigation system that reduces water usage by 60% while increasing crop yield. Uses soil moisture sensors and weather data to optimize watering schedules for Karnataka farmers.', 'Agriculture Technology', ARRAY['iot', 'precision-farming', 'water-conservation', 'karnataka', 'sensors'], 1800000, 0, 12, 'early', '10 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440003', '600e8400-e29b-41d4-a716-446655440021', 'Drone-Based Crop Monitoring for Telangana', 'Fleet of agricultural drones providing real-time crop health monitoring and yield prediction for Telangana farmers. Reduces manual scouting time by 80% and improves farming decisions.', 'Agriculture Technology', ARRAY['drones', 'monitoring', 'yield-prediction', 'telangana', 'automation'], 3200000, 0, 18, 'concept', '14 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440004', '600e8400-e29b-41d4-a716-446655440007', 'Sustainable Fisheries Management Platform', 'Digital platform connecting Tamil Nadu fishermen with markets, providing real-time price information, weather alerts, and sustainable fishing practices tracking.', 'Agriculture Technology', ARRAY['fisheries', 'marketplace', 'sustainability', 'tamil-nadu', 'mobile-platform'], 1500000, 0, 20, 'mvp', '8 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440005', '600e8400-e29b-41d4-a716-446655440017', 'Organic Farming Marketplace Karnataka', 'Mobile marketplace connecting organic farmers in Karnataka with urban consumers, ensuring fair prices and fresh produce delivery within 24 hours.', 'Agriculture Technology', ARRAY['organic-farming', 'marketplace', 'direct-to-consumer', 'karnataka', 'supply-chain'], 900000, 0, 25, 'early', '9 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440006', '600e8400-e29b-41d4-a716-446655440027', 'Vertical Farming Solutions Telangana', 'Compact vertical farming units designed for Telangana urban areas, enabling year-round production of vegetables with 90% less water usage.', 'Agriculture Technology', ARRAY['vertical-farming', 'urban-agriculture', 'water-efficient', 'telangana', 'sustainable'], 4100000, 0, 22, 'concept', '16 months', 'published');

-- EDUTECH IDEAS (6 ideas)
INSERT INTO business_ideas (id, creator_id, title, description, category, tags, funding_goal, current_funding, equity_offered, stage, timeline, status)
VALUES
  ('700e8400-e29b-41d4-a716-446655440007', '600e8400-e29b-41d4-a716-446655440002', 'VR Learning Platform for Tamil Nadu Schools', 'Virtual reality educational platform bringing interactive lessons to rural Tamil Nadu schools, making learning engaging for subjects like history, science, and geography.', 'Education Technology', ARRAY['vr', 'interactive-learning', 'rural-education', 'tamil-nadu', 'k-12'], 1800000, 0, 18, 'early', '11 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440008', '600e8400-e29b-41d4-a716-446655440016', 'AI-Powered Personalized Learning Karnataka', 'Artificial intelligence tutoring system that adapts to individual student learning patterns in Karnataka government schools, improving learning outcomes by 50%.', 'Education Technology', ARRAY['ai', 'personalized-learning', 'tutoring', 'karnataka', 'adaptive'], 2200000, 0, 15, 'mvp', '10 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440009', '600e8400-e29b-41d4-a716-446655440024', 'Mobile Learning Platform Telangana', 'Comprehensive mobile learning platform for Telangana students preparing for competitive exams, featuring video lessons, practice tests, and peer learning communities.', 'Education Technology', ARRAY['mobile-learning', 'exam-preparation', 'video-content', 'telangana', 'competitive-exams'], 1300000, 0, 20, 'early', '9 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440010', '600e8400-e29b-41d4-a716-446655440010', 'Financial Literacy App for Tamil Nadu Youth', 'Gamified financial literacy mobile app teaching money management, investment basics, and entrepreneurship to young people in Tamil Nadu.', 'Education Technology', ARRAY['financial-literacy', 'gamification', 'mobile-app', 'tamil-nadu', 'youth'], 800000, 0, 25, 'concept', '8 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440011', '600e8400-e29b-41d4-a716-446655440030', 'Digital Skills Training Telangana', 'Comprehensive digital skills training platform for Telangana rural youth, covering coding, digital marketing, and entrepreneurship skills.', 'Education Technology', ARRAY['digital-skills', 'coding', 'rural-development', 'telangana', 'vocational-training'], 1600000, 0, 22, 'early', '12 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440012', '600e8400-e29b-41d4-a716-446655440026', 'Regional Language Learning Platform', 'AI-powered platform for learning South Indian languages, preserving cultural heritage while enabling better communication across states.', 'Education Technology', ARRAY['language-learning', 'ai', 'cultural-preservation', 'south-india', 'regional'], 1100000, 0, 28, 'concept', '10 months', 'published');

-- HEALTHTECH IDEAS (6 ideas)
INSERT INTO business_ideas (id, creator_id, title, description, category, tags, funding_goal, current_funding, equity_offered, stage, timeline, status)
VALUES
  ('700e8400-e29b-41d4-a716-446655440013', '600e8400-e29b-41d4-a716-446655440004', 'Telemedicine Platform for Rural Tamil Nadu', 'Comprehensive telemedicine platform connecting rural patients in Tamil Nadu with specialist doctors in cities, reducing travel time and improving healthcare access.', 'Healthcare Technology', ARRAY['telemedicine', 'rural-healthcare', 'mobile-health', 'tamil-nadu', 'accessibility'], 2100000, 0, 16, 'early', '11 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440014', '600e8400-e29b-41d4-a716-446655440014', 'AI-Powered Diagnostics for Karnataka', 'Artificial intelligence system for early disease detection using routine blood tests and symptoms analysis, specifically designed for Karnataka healthcare system.', 'Healthcare Technology', ARRAY['ai-diagnostics', 'early-detection', 'blood-analysis', 'karnataka', 'preventive-care'], 3500000, 0, 14, 'mvp', '13 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440015', '600e8400-e29b-41d4-a716-446655440027', 'Mental Health App for Telangana Youth', 'Culturally sensitive mental health support app designed for Telangana youth, featuring local language support, traditional wellness practices, and professional counseling.', 'Healthcare Technology', ARRAY['mental-health', 'mobile-app', 'telangana', 'youth', 'culturally-sensitive'], 1200000, 0, 20, 'concept', '9 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440016', '600e8400-e29b-41d4-a716-446655440030', 'Medical Supply Chain Platform Telangana', 'Blockchain-based platform for tracking medical supplies across Telangana, ensuring authenticity and preventing counterfeit drugs in the supply chain.', 'Healthcare Technology', ARRAY['blockchain', 'supply-chain', 'drug-authenticity', 'telangana', 'pharmaceutical'], 2800000, 0, 18, 'early', '12 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440017', '600e8400-e29b-41d4-a716-446655440010', 'Elderly Care Monitoring Tamil Nadu', 'IoT-based monitoring system for elderly care in Tamil Nadu, enabling family members and healthcare providers to track vital signs and daily activities remotely.', 'Healthcare Technology', ARRAY['iot', 'elderly-care', 'remote-monitoring', 'tamil-nadu', 'wearables'], 1600000, 0, 22, 'mvp', '10 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440018', '600e8400-e29b-41d4-a716-446655440024', 'Pharmacy Inventory Management Telangana', 'Smart inventory management system for Telangana pharmacies using computer vision and AI to track medicine stock levels and expiry dates automatically.', 'Healthcare Technology', ARRAY['inventory-management', 'computer-vision', 'ai', 'telangana', 'pharmacy'], 950000, 0, 25, 'concept', '8 months', 'published');

-- CLEANTECH IDEAS (6 ideas)
INSERT INTO business_ideas (id, creator_id, title, description, category, tags, funding_goal, current_funding, equity_offered, stage, timeline, status)
VALUES
  ('700e8400-e29b-41d4-a716-446655440019', '600e8400-e29b-41d4-a716-446655440006', 'Solar Panel Cleaning Robot Tamil Nadu', 'Autonomous robot for cleaning solar panels in Tamil Nadu solar farms, increasing energy output by 15% and reducing maintenance costs by 60%.', 'Clean Technology', ARRAY['solar-energy', 'autonomous-robot', 'cleaning', 'tamil-nadu', 'maintenance'], 1900000, 0, 17, 'early', '11 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440020', '600e8400-e29b-41d4-a716-446655440019', 'Wind Energy Optimization Karnataka', 'AI-powered wind farm optimization system for Karnataka wind farms, using predictive analytics to increase energy production by 25%.', 'Clean Technology', ARRAY['wind-energy', 'ai-optimization', 'predictive-analytics', 'karnataka', 'renewable'], 4200000, 0, 12, 'mvp', '14 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440021', '600e8400-e29b-41d4-a716-446655440029', 'E-Waste Recycling Platform Telangana', 'Comprehensive e-waste collection and recycling platform for Telangana, using blockchain for tracking and incentivizing proper disposal.', 'Clean Technology', ARRAY['e-waste', 'recycling', 'blockchain', 'telangana', 'circular-economy'], 2300000, 0, 19, 'concept', '13 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440022', '600e8400-e29b-41d4-a716-446655440007', 'Sustainable Fishing Technology Tamil Nadu', 'Eco-friendly fishing technology that reduces bycatch by 70% while maintaining catch efficiency for traditional Tamil Nadu fishing communities.', 'Clean Technology', ARRAY['sustainable-fishing', 'bycatch-reduction', 'marine-conservation', 'tamil-nadu', 'traditional'], 1400000, 0, 23, 'early', '10 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440023', '600e8400-e29b-41d4-a716-446655440017', 'Organic Waste Management Karnataka', 'Community-based organic waste management system for Karnataka cities, converting waste to compost and biogas for local use.', 'Clean Technology', ARRAY['organic-waste', 'compost', 'biogas', 'karnataka', 'community'], 1100000, 0, 26, 'mvp', '9 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440024', '600e8400-e29b-41d4-a716-446655440023', 'Green Pharmaceutical Manufacturing Telangana', 'Sustainable pharmaceutical manufacturing processes for Telangana pharma companies, reducing water usage by 50% and implementing zero-waste policies.', 'Clean Technology', ARRAY['green-manufacturing', 'pharmaceutical', 'water-conservation', 'telangana', 'zero-waste'], 3800000, 0, 15, 'concept', '15 months', 'published');

-- FINTECH IDEAS (6 ideas)
INSERT INTO business_ideas (id, creator_id, title, description, category, tags, funding_goal, current_funding, equity_offered, stage, timeline, status)
VALUES
  ('700e8400-e29b-41d4-a716-446655440025', '600e8400-e29b-41d4-a716-446655440010', 'Micro-Insurance Platform Tamil Nadu', 'AI-powered micro-insurance platform providing affordable crop and health insurance to small farmers and daily wage workers in Tamil Nadu.', 'Financial Technology', ARRAY['micro-insurance', 'ai-underwriting', 'rural-finance', 'tamil-nadu', 'inclusive'], 1700000, 0, 18, 'early', '10 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440026', '600e8400-e29b-41d4-a716-446655440030', 'Regional Payment Gateway Telangana', 'Unified payment gateway for Telangana SMEs, supporting UPI, cards, and local payment methods with integrated accounting features.', 'Financial Technology', ARRAY['payment-gateway', 'upi', 'sme-banking', 'telangana', 'accounting'], 2600000, 0, 16, 'mvp', '12 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440027', '600e8400-e29b-41d4-a716-446655440010', 'Peer-to-Peer Lending Tamil Nadu', 'Community-based P2P lending platform for Tamil Nadu, connecting local investors with borrowers for personal and business loans.', 'Financial Technology', ARRAY['p2p-lending', 'community-finance', 'local-investment', 'tamil-nadu', 'social-lending'], 3200000, 0, 14, 'concept', '14 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440028', '600e8400-e29b-41d4-a716-446655440026', 'Supply Chain Finance Telangana', 'Blockchain-based supply chain financing platform for Telangana textile and pharmaceutical industries, unlocking working capital for suppliers.', 'Financial Technology', ARRAY['supply-chain-finance', 'blockchain', 'working-capital', 'telangana', 'textile'], 4100000, 0, 12, 'early', '13 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440029', '600e8400-e29b-41d4-a716-446655440002', 'Digital Banking for Rural Tamil Nadu', 'Mobile-first banking platform designed for rural Tamil Nadu communities, offering savings, loans, and investment products in local languages.', 'Financial Technology', ARRAY['mobile-banking', 'rural-finance', 'local-language', 'tamil-nadu', 'financial-inclusion'], 1900000, 0, 20, 'mvp', '11 months', 'published'),
  ('700e8400-e29b-41d4-a716-446655440030', '600e8400-e29b-41d4-a716-446655440030', 'Agricultural Commodity Trading Telangana', 'Digital marketplace for Telangana agricultural commodities with price discovery, quality grading, and integrated logistics for farmers.', 'Financial Technology', ARRAY['commodity-trading', 'agricultural-marketplace', 'price-discovery', 'telangana', 'logistics'], 2800000, 0, 17, 'concept', '12 months', 'published');

-- ========================================
-- 5. CREATE 30 INVESTMENT OFFERS (6 per category, distributed across tenants)
-- ========================================

-- AGRITECH OFFERS (6 offers)
INSERT INTO investment_offers (id, investor_id, tenant_id, title, description, amount_range, preferred_equity, preferred_stages, preferred_industries, geographic_preference, investment_type, timeline)
VALUES
  ('800e8400-e29b-41d4-a716-446655440001', '600e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'AgriTech Investment Fund Chennai', 'Dedicated fund for Tamil Nadu agricultural technology startups focusing on sustainable farming solutions and rural development.', '{"min": 500000, "max": 2000000}', '{"min": 10, "max": 25}', ARRAY['concept', 'mvp', 'early'], ARRAY['Agriculture Technology', 'Clean Technology'], 'Tamil Nadu', 'equity', '2-3 years'),
  ('800e8400-e29b-41d4-a716-446655440002', '600e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'SouthInvest AgriTech Portfolio', 'Portfolio investment in agricultural technology companies serving South Indian markets with proven traction.', '{"min": 1000000, "max": 5000000}', '{"min": 15, "max": 30}', ARRAY['mvp', 'early', 'growth'], ARRAY['Agriculture Technology'], 'South India', 'equity', '3-5 years'),
  ('800e8400-e29b-41d4-a716-446655440003', '600e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'Bangalore AgriTech Accelerator', 'Accelerator program for Karnataka agricultural startups with investment component and mentorship from industry experts.', '{"min": 250000, "max": 1000000}', '{"min": 8, "max": 20}', ARRAY['concept', 'mvp'], ARRAY['Agriculture Technology'], 'Karnataka', 'convertible', '1-2 years'),
  ('800e8400-e29b-41d4-a716-446655440004', '600e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440002', 'Karnataka Agricultural Innovation Fund', 'Investment fund specifically for agricultural innovations addressing Karnataka farming challenges and market opportunities.', '{"min": 750000, "max": 3000000}', '{"min": 12, "max": 25}', ARRAY['mvp', 'early'], ARRAY['Agriculture Technology', 'Clean Technology'], 'Karnataka', 'equity', '3-4 years'),
  ('800e8400-e29b-41d4-a716-446655440005', '600e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440003', 'Hyderabad AgriTech Investment', 'Strategic investments in Telangana agricultural technology startups with focus on Telangana market expansion.', '{"min": 300000, "max": 1500000}', '{"min": 10, "max": 22}', ARRAY['concept', 'mvp', 'early'], ARRAY['Agriculture Technology'], 'Telangana', 'equity', '2-3 years'),
  ('800e8400-e29b-41d4-a716-446655440006', '600e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440003', 'Telangana Rural Development Fund', 'Impact investment fund for agricultural and rural development technologies in Telangana with measurable social outcomes.', '{"min": 600000, "max": 2500000}', '{"min": 15, "max": 28}', ARRAY['early', 'growth'], ARRAY['Agriculture Technology', 'Clean Technology'], 'Telangana', 'equity', '4-5 years');

-- EDUTECH OFFERS (6 offers)
INSERT INTO investment_offers (id, investor_id, tenant_id, title, description, amount_range, preferred_equity, preferred_stages, preferred_industries, geographic_preference, investment_type, timeline)
VALUES
  ('800e8400-e29b-41d4-a716-446655440007', '600e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', 'Tamil Nadu Education Technology Fund', 'Investment fund dedicated to education technology solutions for Tamil Nadu schools and educational institutions.', '{"min": 400000, "max": 1800000}', '{"min": 12, "max": 24}', ARRAY['mvp', 'early'], ARRAY['Education Technology'], 'Tamil Nadu', 'equity', '2-4 years'),
  ('800e8400-e29b-41d4-a716-446655440008', '600e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440002', 'Bangalore EdTech Growth Fund', 'Growth stage investment fund for Karnataka education technology companies with proven user traction.', '{"min": 1500000, "max": 8000000}', '{"min": 18, "max": 35}', ARRAY['early', 'growth'], ARRAY['Education Technology'], 'Karnataka', 'equity', '3-5 years'),
  ('800e8400-e29b-41d4-a716-446655440009', '600e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440003', 'Hyderabad Learning Innovation Fund', 'Early-stage investment fund for innovative learning technologies addressing Telangana educational challenges.', '{"min": 200000, "max": 1200000}', '{"min": 8, "max": 20}', ARRAY['concept', 'mvp'], ARRAY['Education Technology'], 'Telangana', 'convertible', '1-3 years'),
  ('800e8400-e29b-41d4-a716-446655440010', '600e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'SouthInvest Education Portfolio', 'Portfolio investment in education technology companies with focus on South Indian language and cultural adaptation.', '{"min": 800000, "max": 4000000}', '{"min": 15, "max": 30}', ARRAY['mvp', 'early', 'growth'], ARRAY['Education Technology'], 'South India', 'equity', '3-4 years'),
  ('800e8400-e29b-41d4-a716-446655440011', '600e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'Karnataka Digital Learning Fund', 'Investment fund for digital learning platforms serving Karnataka government schools and higher education institutions.', '{"min": 500000, "max": 2500000}', '{"min": 10, "max": 25}', ARRAY['early', 'growth'], ARRAY['Education Technology'], 'Karnataka', 'equity', '2-4 years'),
  ('800e8400-e29b-41d4-a716-446655440012', '600e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440003', 'Telangana Skills Development Investment', 'Impact investment fund for skill development and vocational training technologies in Telangana.', '{"min": 300000, "max": 2000000}', '{"min": 12, "max": 28}', ARRAY['concept', 'mvp', 'early'], ARRAY['Education Technology'], 'Telangana', 'equity', '2-3 years');

-- HEALTHTECH OFFERS (6 offers)
INSERT INTO investment_offers (id, investor_id, tenant_id, title, description, amount_range, preferred_equity, preferred_stages, preferred_industries, geographic_preference, investment_type, timeline)
VALUES
  ('800e8400-e29b-41d4-a716-446655440013', '600e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Tamil Nadu Healthcare Innovation Fund', 'Investment fund for healthcare technology solutions addressing Tamil Nadu rural healthcare challenges.', '{"min": 600000, "max": 3000000}', '{"min": 14, "max": 26}', ARRAY['mvp', 'early'], ARRAY['Healthcare Technology'], 'Tamil Nadu', 'equity', '3-4 years'),
  ('800e8400-e29b-41d4-a716-446655440014', '600e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', 'SouthInvest HealthTech Portfolio', 'Portfolio investment in healthcare technology companies with focus on South Indian healthcare systems.', '{"min": 1000000, "max": 6000000}', '{"min": 16, "max": 32}', ARRAY['early', 'growth'], ARRAY['Healthcare Technology'], 'South India', 'equity', '4-5 years'),
  ('800e8400-e29b-41d4-a716-446655440015', '600e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440002', 'Karnataka HealthTech Investment', 'Strategic investments in Karnataka healthcare startups with government partnerships and hospital integrations.', '{"min": 800000, "max": 4000000}', '{"min": 12, "max": 28}', ARRAY['mvp', 'early', 'growth'], ARRAY['Healthcare Technology'], 'Karnataka', 'equity', '3-5 years'),
  ('800e8400-e29b-41d4-a716-446655440016', '600e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440002', 'Bangalore Medical Innovation Fund', 'Investment fund for medical technology innovations serving Bangalore hospitals and healthcare networks.', '{"min": 400000, "max": 2000000}', '{"min": 10, "max": 24}', ARRAY['concept', 'mvp', 'early'], ARRAY['Healthcare Technology'], 'Bangalore', 'convertible', '2-3 years'),
  ('800e8400-e29b-41d4-a716-446655440017', '600e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440003', 'Hyderabad PharmaTech Investment', 'Specialized investment fund for pharmaceutical and healthcare technology companies in Hyderabad pharma corridor.', '{"min": 1200000, "max": 8000000}', '{"min": 18, "max": 35}', ARRAY['early', 'growth'], ARRAY['Healthcare Technology', 'Pharmaceutical Technology'], 'Telangana', 'equity', '4-6 years'),
  ('800e8400-e29b-41d4-a716-446655440018', '600e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440003', 'Telangana Healthcare Innovation Fund', 'Early-stage investment fund for healthcare innovations addressing Telangana public health challenges.', '{"min": 300000, "max": 1800000}', '{"min": 8, "max": 22}', ARRAY['concept', 'mvp'], ARRAY['Healthcare Technology'], 'Telangana', 'equity', '2-4 years');

-- CLEANTECH OFFERS (6 offers)
INSERT INTO investment_offers (id, investor_id, tenant_id, title, description, amount_range, preferred_equity, preferred_stages, preferred_industries, geographic_preference, investment_type, timeline)
VALUES
  ('800e8400-e29b-41d4-a716-446655440019', '600e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Tamil Nadu Clean Energy Fund', 'Investment fund for clean energy solutions addressing Tamil Nadu energy needs and environmental challenges.', '{"min": 700000, "max": 3500000}', '{"min": 15, "max": 28}', ARRAY['mvp', 'early', 'growth'], ARRAY['Clean Technology'], 'Tamil Nadu', 'equity', '3-5 years'),
  ('800e8400-e29b-41d4-a716-446655440020', '600e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'Karnataka Sustainability Fund', 'Sustainability-focused investment fund for Karnataka cleantech companies with measurable environmental impact.', '{"min": 500000, "max": 2500000}', '{"min": 12, "max": 26}', ARRAY['concept', 'mvp', 'early'], ARRAY['Clean Technology'], 'Karnataka', 'equity', '3-4 years'),
  ('800e8400-e29b-41d4-a716-446655440021', '600e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440002', 'Bangalore GreenTech Portfolio', 'Portfolio investment in green technology companies serving Karnataka industrial and urban sustainability needs.', '{"min": 900000, "max": 5000000}', '{"min": 16, "max": 32}', ARRAY['early', 'growth'], ARRAY['Clean Technology'], 'Karnataka', 'equity', '4-6 years'),
  ('800e8400-e29b-41d4-a716-446655440022', '600e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440003', 'Hyderabad Environmental Innovation Fund', 'Investment fund for environmental technologies addressing Telangana pollution and sustainability challenges.', '{"min": 400000, "max": 2200000}', '{"min": 10, "max": 25}', ARRAY['mvp', 'early'], ARRAY['Clean Technology'], 'Telangana', 'convertible', '2-4 years'),
  ('800e8400-e29b-41d4-a716-446655440023', '600e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440003', 'Telangana CleanTech Investment', 'Strategic investments in Telangana cleantech startups with focus on Hyderabad industrial sustainability.', '{"min": 600000, "max": 3000000}', '{"min": 14, "max": 28}', ARRAY['early', 'growth'], ARRAY['Clean Technology'], 'Telangana', 'equity', '3-5 years'),
  ('800e8400-e29b-41d4-a716-446655440024', '600e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', 'SouthInvest CleanTech Portfolio', 'Portfolio investment in clean technology companies with proven environmental impact in South India.', '{"min": 1200000, "max": 7000000}', '{"min": 18, "max": 35}', ARRAY['growth'], ARRAY['Clean Technology'], 'South India', 'equity', '4-6 years');

-- FINTECH OFFERS (6 offers)
INSERT INTO investment_offers (id, investor_id, tenant_id, title, description, amount_range, preferred_equity, preferred_stages, preferred_industries, geographic_preference, investment_type, timeline)
VALUES
  ('800e8400-e29b-41d4-a716-446655440025', '600e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Chennai FinTech Innovation Fund', 'Investment fund for financial technology solutions addressing Tamil Nadu financial inclusion and digital banking needs.', '{"min": 500000, "max": 2800000}', '{"min": 12, "max": 26}', ARRAY['mvp', 'early'], ARRAY['Financial Technology'], 'Tamil Nadu', 'equity', '3-4 years'),
  ('800e8400-e29b-41d4-a716-446655440026', '600e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'SouthInvest FinTech Portfolio', 'Portfolio investment in fintech companies serving South Indian markets with focus on regional payment systems.', '{"min": 800000, "max": 4500000}', '{"min": 15, "max": 30}', ARRAY['early', 'growth'], ARRAY['Financial Technology'], 'South India', 'equity', '3-5 years'),
  ('800e8400-e29b-41d4-a716-446655440027', '600e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'Bangalore Digital Banking Fund', 'Investment fund for digital banking and payment solutions targeting Karnataka urban and rural markets.', '{"min": 600000, "max": 3200000}', '{"min": 14, "max": 28}', ARRAY['mvp', 'early', 'growth'], ARRAY['Financial Technology'], 'Karnataka', 'equity', '3-5 years'),
  ('800e8400-e29b-41d4-a716-446655440028', '600e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440002', 'Karnataka Financial Inclusion Fund', 'Impact investment fund for fintech solutions improving financial access for underserved Karnataka communities.', '{"min": 300000, "max": 1600000}', '{"min": 8, "max": 22}', ARRAY['concept', 'mvp'], ARRAY['Financial Technology'], 'Karnataka', 'convertible', '2-3 years'),
  ('800e8400-e29b-41d4-a716-446655440029', '600e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440003', 'Hyderabad FinTech Investment', 'Strategic investments in Hyderabad fintech ecosystem with focus on Telangana financial services innovation.', '{"min": 700000, "max": 4000000}', '{"min": 16, "max": 30}', ARRAY['early', 'growth'], ARRAY['Financial Technology'], 'Telangana', 'equity', '3-5 years'),
  ('800e8400-e29b-41d4-a716-446655440030', '600e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440003', 'Telangana Digital Finance Fund', 'Investment fund for digital financial services and fintech innovations serving Telangana markets.', '{"min": 400000, "max": 2200000}', '{"min": 10, "max": 24}', ARRAY['concept', 'mvp', 'early'], ARRAY['Financial Technology'], 'Telangana', 'equity', '2-4 years');

-- ========================================
-- 6. CREATE 15 MATCHES (across categories and tenants)
-- ========================================

INSERT INTO matches (id, idea_id, investor_id, creator_id, offer_id, match_score, matching_factors, status)
VALUES
  -- AGRITECH MATCHES
  ('900e8400-e29b-41d4-a716-446655440001', '700e8400-e29b-41d4-a716-446655440001', '600e8400-e29b-41d4-a716-446655440003', '600e8400-e29b-41d4-a716-446655440001', '800e8400-e29b-41d4-a716-446655440001', 0.87, '{"industryAlignment": 0.95, "amountCompatibility": 0.80, "stagePreference": 0.85, "geographicFit": 0.90}', 'suggested'),
  ('900e8400-e29b-41d4-a716-446655440002', '700e8400-e29b-41d4-a716-446655440002', '600e8400-e29b-41d4-a716-446655440005', '600e8400-e29b-41d4-a716-446655440011', '800e8400-e29b-41d4-a716-446655440002', 0.82, '{"industryAlignment": 0.90, "amountCompatibility": 0.75, "stagePreference": 0.80, "geographicFit": 0.85}', 'viewed'),
  ('900e8400-e29b-41d4-a716-446655440003', '700e8400-e29b-41d4-a716-446655440003', '600e8400-e29b-41d4-a716-446655440015', '600e8400-e29b-41d4-a716-446655440021', '800e8400-e29b-41d4-a716-446655440004', 0.79, '{"industryAlignment": 0.85, "amountCompatibility": 0.70, "stagePreference": 0.75, "geographicFit": 0.80}', 'contacted'),

  -- EDUTECH MATCHES
  ('900e8400-e29b-41d4-a716-446655440004', '700e8400-e29b-41d4-a716-446655440007', '600e8400-e29b-41d4-a716-446655440008', '600e8400-e29b-41d4-a716-446655440002', '800e8400-e29b-41d4-a716-446655440007', 0.91, '{"industryAlignment": 0.95, "amountCompatibility": 0.85, "stagePreference": 0.90, "geographicFit": 0.95}', 'negotiating'),
  ('900e8400-e29b-41d4-a716-446655440005', '700e8400-e29b-41d4-a716-446655440008', '600e8400-e29b-41d4-a716-446655440012', '600e8400-e29b-41d4-a716-446655440016', '800e8400-e29b-41d4-a716-446655440008', 0.88, '{"industryAlignment": 0.92, "amountCompatibility": 0.80, "stagePreference": 0.85, "geographicFit": 0.90}', 'viewed'),
  ('900e8400-e29b-41d4-a716-446655440006', '700e8400-e29b-41d4-a716-446655440009', '600e8400-e29b-41d4-a716-446655440018', '600e8400-e29b-41d4-a716-446655440024', '800e8400-e29b-41d4-a716-446655440009', 0.84, '{"industryAlignment": 0.88, "amountCompatibility": 0.75, "stagePreference": 0.80, "geographicFit": 0.85}', 'suggested'),

  -- HEALTHTECH MATCHES
  ('900e8400-e29b-41d4-a716-446655440007', '700e8400-e29b-41d4-a716-446655440013', '600e8400-e29b-41d4-a716-446655440003', '600e8400-e29b-41d4-a716-446655440004', '800e8400-e29b-41d4-a716-446655440013', 0.89, '{"industryAlignment": 0.93, "amountCompatibility": 0.82, "stagePreference": 0.85, "geographicFit": 0.90}', 'contacted'),
  ('900e8400-e29b-41d4-a716-446655440008', '700e8400-e29b-41d4-a716-446655440014', '600e8400-e29b-41d4-a716-446655440005', '600e8400-e29b-41d4-a716-446655440014', '800e8400-e29b-41d4-a716-446655440014', 0.86, '{"industryAlignment": 0.90, "amountCompatibility": 0.78, "stagePreference": 0.80, "geographicFit": 0.85}', 'viewed'),
  ('900e8400-e29b-41d4-a716-446655440009', '700e8400-e29b-41d4-a716-446655440015', '600e8400-e29b-41d4-a716-446655440015', '600e8400-e29b-41d4-a716-446655440027', '800e8400-e29b-41d4-a716-446655440015', 0.83, '{"industryAlignment": 0.87, "amountCompatibility": 0.75, "stagePreference": 0.78, "geographicFit": 0.80}', 'suggested'),

  -- CLEANTECH MATCHES
  ('900e8400-e29b-41d4-a716-446655440010', '700e8400-e29b-41d4-a716-446655440019', '600e8400-e29b-41d4-a716-446655440008', '600e8400-e29b-41d4-a716-446655440006', '800e8400-e29b-41d4-a716-446655440019', 0.90, '{"industryAlignment": 0.94, "amountCompatibility": 0.83, "stagePreference": 0.85, "geographicFit": 0.92}', 'negotiating'),
  ('900e8400-e29b-41d4-a716-446655440011', '700e8400-e29b-41d4-a716-446655440020', '600e8400-e29b-41d4-a716-446655440012', '600e8400-e29b-41d4-a716-446655440019', '800e8400-e29b-41d4-a716-446655440020', 0.87, '{"industryAlignment": 0.91, "amountCompatibility": 0.80, "stagePreference": 0.82, "geographicFit": 0.88}', 'viewed'),
  ('900e8400-e29b-41d4-a716-446655440012', '700e8400-e29b-41d4-a716-446655440021', '600e8400-e29b-41d4-a716-446655440018', '600e8400-e29b-41d4-a716-446655440029', '800e8400-e29b-41d4-a716-446655440021', 0.81, '{"industryAlignment": 0.85, "amountCompatibility": 0.73, "stagePreference": 0.78, "geographicFit": 0.82}', 'contacted'),

  -- FINTECH MATCHES
  ('900e8400-e29b-41d4-a716-446655440013', '700e8400-e29b-41d4-a716-446655440025', '600e8400-e29b-41d4-a716-446655440003', '600e8400-e29b-41d4-a716-446655440010', '800e8400-e29b-41d4-a716-446655440025', 0.92, '{"industryAlignment": 0.96, "amountCompatibility": 0.85, "stagePreference": 0.88, "geographicFit": 0.93}', 'negotiating'),
  ('900e8400-e29b-41d4-a716-446655440014', '700e8400-e29b-41d4-a716-446655440026', '600e8400-e29b-41d4-a716-446655440005', '600e8400-e29b-41d4-a716-446655440030', '800e8400-e29b-41d4-a716-446655440026', 0.88, '{"industryAlignment": 0.92, "amountCompatibility": 0.80, "stagePreference": 0.84, "geographicFit": 0.89}', 'viewed'),
  ('900e8400-e29b-41d4-a716-446655440015', '700e8400-e29b-41d4-a716-446655440027', '600e8400-e29b-41d4-a716-446655440015', '600e8400-e29b-41d4-a716-446655440010', '800e8400-e29b-41d4-a716-446655440027', 0.85, '{"industryAlignment": 0.89, "amountCompatibility": 0.77, "stagePreference": 0.81, "geographicFit": 0.86}', 'suggested');

-- ========================================
-- 7. CREATE CONVERSATIONS FOR MATCHES
-- ========================================

INSERT INTO conversations (id, match_id, participant1_id, participant2_id)
VALUES
  ('a00e8400-e29b-41d4-a716-446655440001', '900e8400-e29b-41d4-a716-446655440001', '600e8400-e29b-41d4-a716-446655440001', '600e8400-e29b-41d4-a716-446655440003'),
  ('a00e8400-e29b-41d4-a716-446655440002', '900e8400-e29b-41d4-a716-446655440004', '600e8400-e29b-41d4-a716-446655440002', '600e8400-e29b-41d4-a716-446655440008'),
  ('a00e8400-e29b-41d4-a716-446655440003', '900e8400-e29b-41d4-a716-446655440007', '600e8400-e29b-41d4-a716-446655440004', '600e8400-e29b-41d4-a716-446655440003'),
  ('a00e8400-e29b-41d4-a716-446655440004', '900e8400-e29b-41d4-a716-446655440010', '600e8400-e29b-41d4-a716-446655440006', '600e8400-e29b-41d4-a716-446655440008'),
  ('a00e8400-e29b-41d4-a716-446655440005', '900e8400-e29b-41d4-a716-446655440013', '600e8400-e29b-41d4-a716-446655440010', '600e8400-e29b-41d4-a716-446655440003');

-- ========================================
-- 8. CREATE 40 MESSAGES (realistic South India business conversations)
-- ========================================

INSERT INTO messages (id, conversation_id, sender_id, content, type, read)
VALUES
  -- Conversation 1: AgriTech Investment Discussion
  ('b00e8400-e29b-41d4-a716-446655440001', 'a00e8400-e29b-41d4-a716-446655440001', '600e8400-e29b-41d4-a716-446655440001', 'Namaste! I am very interested in your AI-powered crop disease detection system. As a Tamil Nadu based investor, I see great potential for this technology in our agricultural sector.', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440002', 'a00e8400-e29b-41d4-a716-446655440001', '600e8400-e29b-41d4-a716-446655440003', 'Thank you for your interest! We have developed this system specifically for Tamil Nadu farming conditions. Could you tell me more about your investment experience in AgriTech?', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440003', 'a00e8400-e29b-41d4-a716-446655440001', '600e8400-e29b-41d4-a716-446655440001', 'I have invested in 3 AgriTech startups in the last 5 years, with 2 successful exits. I am particularly interested in how your system handles Tamil Nadu specific crops like rice and sugarcane.', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440004', 'a00e8400-e29b-41d4-a716-446655440001', '600e8400-e29b-41d4-a716-446655440003', 'Excellent! Our system has been trained on Tamil Nadu crop varieties and local farming practices. We are currently achieving 94% accuracy in disease detection. Would you like to schedule a demo?', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440005', 'a00e8400-e29b-41d4-a716-446655440001', '600e8400-e29b-41d4-a716-446655440001', 'Yes, I would love to see a demonstration. Also, could you share your go-to-market strategy for Tamil Nadu?', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440006', 'a00e8400-e29b-41d4-a716-446655440001', '600e8400-e29b-41d4-a716-446655440003', 'Certainly! We plan to partner with Tamil Nadu agricultural cooperatives and offer the service through existing farmer service centers. This will ensure quick adoption.', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440007', 'a00e8400-e29b-41d4-a716-446655440001', '600e8400-e29b-41d4-a716-446655440001', 'That is a smart approach. I think this has significant potential. Let us discuss investment terms - I am considering a ₹25 lakh investment for 15% equity.', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440008', 'a00e8400-e29b-41d4-a716-446655440001', '600e8400-e29b-41d4-a716-446655440003', 'Thank you for the offer! We were hoping for ₹25 lakh at 12% equity. Given your experience and network in Tamil Nadu, we are open to negotiation.', 'text', false),

  -- Conversation 2: EduTech Investment Discussion
  ('b00e8400-e29b-41d4-a716-446655440009', 'a00e8400-e29b-41d4-a716-446655440002', '600e8400-e29b-41d4-a716-446655440002', 'Hello! Your VR learning platform for rural Tamil Nadu schools caught my attention. This could be transformative for education accessibility.', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440010', 'a00e8400-e29b-41d4-a716-446655440002', '600e8400-e29b-41d4-a716-446655440008', 'Thank you! We are passionate about improving education quality in rural areas. Our VR platform makes complex subjects like science and history engaging and interactive.', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440011', 'a00e8400-e29b-41d4-a716-446655440002', '600e8400-e29b-41d4-a716-446655440002', 'That is commendable. I have been investing in EduTech for the past 8 years. How do you plan to scale this across Tamil Nadu districts?', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440012', 'a00e8400-e29b-41d4-a716-446655440002', '600e8400-e29b-41d4-a716-446655440008', 'We have partnered with the Tamil Nadu education department for pilot programs in 5 districts. The plan is to expand to all 38 districts within 2 years.', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440013', 'a00e8400-e29b-41d4-a716-446655440002', '600e8400-e29b-41d4-a716-446655440002', 'Impressive! Government partnerships are crucial for scale. I am interested in investing ₹18 lakh for 18% equity to support this expansion.', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440014', 'a00e8400-e29b-41d4-a716-446655440002', '600e8400-e29b-41d4-a716-446655440008', 'Thank you for the offer! We value strategic investors who can help with government relationships. We are seeking ₹18 lakh at 15% equity.', 'text', false),

  -- Conversation 3: HealthTech Investment Discussion
  ('b00e8400-e29b-41d4-a716-446655440015', 'a00e8400-e29b-41d4-a716-446655440003', '600e8400-e29b-41d4-a716-446655440004', 'Hello! Your telemedicine platform for rural Tamil Nadu addresses a critical healthcare gap. I am very interested in this social impact investment.', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440016', 'a00e8400-e29b-41d4-a716-446655440003', '600e8400-e29b-41d4-a716-446655440003', 'Thank you! We are committed to improving healthcare access in rural areas. Our platform connects patients with specialists across Tamil Nadu.', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440017', 'a00e8400-e29b-41d4-a716-446655440003', '600e8400-e29b-41d4-a716-446655440004', 'This is exactly the kind of healthcare innovation Tamil Nadu needs. I have invested in 4 healthcare startups. How do you handle doctor onboarding and quality assurance?', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440018', 'a00e8400-e29b-41d4-a716-446655440003', '600e8400-e29b-41d4-a716-446655440003', 'We have a rigorous vetting process for doctors and work with Tamil Nadu Medical Council. Currently, we have 150+ verified doctors across 12 specializations.', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440019', 'a00e8400-e29b-41d4-a716-446655440003', '600e8400-e29b-41d4-a716-446655440004', 'Excellent credentials! I am considering investing ₹21 lakh for 16% equity. This would be my 5th healthcare investment in South India.', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440020', 'a00e8400-e29b-41d4-a716-446655440003', '600e8400-e29b-41d4-a716-446655440003', 'Thank you for your interest! We are seeking ₹21 lakh at 14% equity. Your healthcare investment experience would be valuable for our growth.', 'text', false),

  -- Conversation 4: CleanTech Investment Discussion
  ('b00e8400-e29b-41d4-a716-446655440021', 'a00e8400-e29b-41d4-a716-446655440004', '600e8400-e29b-41d4-a716-446655440006', 'Hello! Your solar panel cleaning robot is innovative. As someone focused on Tamil Nadu sustainability, I see great potential for this technology.', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440022', 'a00e8400-e29b-41d4-a716-446655440004', '600e8400-e29b-41d4-a716-446655440008', 'Thank you! We developed this robot specifically for Tamil Nadu solar farms where dust accumulation is a major issue affecting energy output.', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440023', 'a00e8400-e29b-41d4-a716-446655440004', '600e8400-e29b-41d4-a716-446655440006', 'Perfect! I have invested in 6 clean energy projects in Tamil Nadu. What is your current customer acquisition strategy?', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440024', 'a00e8400-e29b-41d4-a716-446655440004', '600e8400-e29b-41d4-a716-446655440008', 'We are working with TANGEDCO (Tamil Nadu Generation and Distribution Corporation) for pilot projects and plan to expand to private solar farm operators.', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440025', 'a00e8400-e29b-41d4-a716-446655440004', '600e8400-e29b-41d4-a716-446655440006', 'Excellent partnerships! I am interested in investing ₹19 lakh for 17% equity to support your expansion across Tamil Nadu solar installations.', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440026', 'a00e8400-e29b-41d4-a716-446655440004', '600e8400-e29b-41d4-a716-446655440008', 'Thank you for the offer! We are seeking ₹19 lakh at 15% equity. Your clean energy investment experience in Tamil Nadu would be invaluable.', 'text', false),

  -- Conversation 5: FinTech Investment Discussion
  ('b00e8400-e29b-41d4-a716-446655440027', 'a00e8400-e29b-41d4-a716-446655440005', '600e8400-e29b-41d4-a716-446655440010', 'Hello! Your micro-insurance platform for Tamil Nadu is addressing a real need in the market. I am very interested in this inclusive finance solution.', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440028', 'a00e8400-e29b-41d4-a716-446655440005', '600e8400-e29b-41d4-a716-446655440003', 'Thank you! We are committed to financial inclusion for underserved communities in Tamil Nadu. Our AI-powered underwriting makes insurance accessible and affordable.', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440029', 'a00e8400-e29b-41d4-a716-446655440005', '600e8400-e29b-41d4-a716-446655440010', 'This is exactly what Tamil Nadu needs! I have invested in 5 fintech companies focused on financial inclusion. How do you handle claim processing and fraud prevention?', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440030', 'a00e8400-e29b-41d4-a716-446655440005', '600e8400-e29b-41d4-a716-446655440003', 'We use AI for automated claim assessment and have integrated with Tamil Nadu government databases for verification. Our fraud detection rate is 97%.', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440031', 'a00e8400-e29b-41d4-a716-446655440005', '600e8400-e29b-41d4-a716-446655440010', 'Impressive! I am considering investing ₹17 lakh for 18% equity. This would be my 6th fintech investment in South India.', 'text', true),
  ('b00e8400-e29b-41d4-a716-446655440032', 'a00e8400-e29b-41d4-a716-446655440005', '600e8400-e29b-41d4-a716-446655440003', 'Thank you for your interest! We are seeking ₹17 lakh at 15% equity. Your fintech investment experience would greatly benefit our expansion plans.', 'text', false),

  -- Additional messages for realistic conversation flow
  ('b00e8400-e29b-41d4-a716-446655440033', 'a00e8400-e29b-41d4-a716-446655440001', '600e8400-e29b-41d4-a716-446655440003', 'I have reviewed your pitch deck and technical documentation. The solution looks solid. Can we schedule a call to discuss due diligence requirements?', 'text', false),
  ('b00e8400-e29b-41d4-a716-446655440034', 'a00e8400-e29b-41d4-a716-446655440002', '600e8400-e29b-41d4-a716-446655440008', 'I am impressed by your government partnerships in Karnataka. This gives you significant credibility. Let us discuss investment terms in detail.', 'text', false),
  ('b00e8400-e29b-41d4-a716-446655440035', 'a00e8400-e29b-41d4-a716-446655440003', '600e8400-e29b-41d4-a716-446655440003', 'I would like to visit your facility in Madurai to see the telemedicine platform in action. When would be convenient for you?', 'text', false),
  ('b00e8400-e29b-41d4-a716-446655440036', 'a00e8400-e29b-41d4-a716-446655440004', '600e8400-e29b-41d4-a716-446655440008', 'Your approach to solar farm maintenance is innovative. I have contacts at several Tamil Nadu solar installations who might be interested in pilot projects.', 'text', false),
  ('b00e8400-e29b-41d4-a716-446655440037', 'a00e8400-e29b-41d4-a716-446655440005', '600e8400-e29b-41d4-a716-446655440003', 'Your AI underwriting model is impressive. I would like to understand your data sources for Tamil Nadu risk assessment and how you handle regional variations.', 'text', false),

  -- System messages for context
  ('b00e8400-e29b-41d4-a716-446655440038', 'a00e8400-e29b-41d4-a716-446655440001', '600e8400-e29b-41d4-a716-446655440001', 'Match suggestion: AgriTech investment opportunity in Tamil Nadu', 'system', true),
  ('b00e8400-e29b-41d4-a716-446655440039', 'a00e8400-e29b-41d4-a716-446655440002', '600e8400-e29b-41d4-a716-446655440002', 'Match suggestion: EduTech investment opportunity in Karnataka', 'system', true),
  ('b00e8400-e29b-41d4-a716-446655440040', 'a00e8400-e29b-41d4-a716-446655440003', '600e8400-e29b-41d4-a716-446655440004', 'Match suggestion: HealthTech investment opportunity in Tamil Nadu', 'system', true);

-- ========================================
-- SAMPLE DATA CREATION COMPLETE
-- ========================================

-- ========================================
-- 9. CREATE TRANSACTIONS (10+ entries for completed investments)
-- ========================================

INSERT INTO transactions (id, match_id, investor_id, creator_id, amount, currency, status, payment_method, created_at, confirmed_at)
VALUES
  -- Successful AgriTech investments
  ('c00e8400-e29b-41d4-a716-446655440001', '900e8400-e29b-41d4-a716-446655440001', '600e8400-e29b-41d4-a716-446655440003', '600e8400-e29b-41d4-a716-446655440001', 2500000, 'INR', 'completed', 'bank_transfer', NOW() - INTERVAL '30 days', NOW() - INTERVAL '28 days'),
  ('c00e8400-e29b-41d4-a716-446655440002', '900e8400-e29b-41d4-a716-446655440004', '600e8400-e29b-41d4-a716-446655440008', '600e8400-e29b-41d4-a716-446655440002', 1800000, 'INR', 'completed', 'bank_transfer', NOW() - INTERVAL '25 days', NOW() - INTERVAL '23 days'),
  ('c00e8400-e29b-41d4-a716-446655440003', '900e8400-e29b-41d4-a716-446655440007', '600e8400-e29b-41d4-a716-446655440003', '600e8400-e29b-41d4-a716-446655440004', 2100000, 'INR', 'completed', 'bank_transfer', NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days'),

  -- Pending transactions
  ('c00e8400-e29b-41d4-a716-446655440004', '900e8400-e29b-41d4-a716-446655440010', '600e8400-e29b-41d4-a716-446655440008', '600e8400-e29b-41d4-a716-446655440006', 3500000, 'INR', 'pending', 'bank_transfer', NOW() - INTERVAL '5 days', NULL),
  ('c00e8400-e29b-41d4-a716-446655440005', '900e8400-e29b-41d4-a716-446655440013', '600e8400-e29b-41d4-a716-446655440003', '600e8400-e29b-41d4-a716-446655440010', 1700000, 'INR', 'confirmed', 'bank_transfer', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),

  -- Crypto transactions for tech-savvy users
  ('c00e8400-e29b-41d4-a716-446655440006', '900e8400-e29b-41d4-a716-446655440002', '600e8400-e29b-41d4-a716-446655440005', '600e8400-e29b-41d4-a716-446655440011', 1800000, 'INR', 'completed', 'crypto', NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days'),
  ('c00e8400-e29b-41d4-a716-446655440007', '900e8400-e29b-41d4-a716-446655440005', '600e8400-e29b-41d4-a716-446655440008', '600e8400-e29b-41d4-a716-446655440016', 2200000, 'INR', 'completed', 'crypto', NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days'),

  -- Additional completed transactions
  ('c00e8400-e29b-41d4-a716-446655440008', '900e8400-e29b-41d4-a716-446655440008', '600e8400-e29b-41d4-a716-446655440005', '600e8400-e29b-41d4-a716-446655440014', 3500000, 'INR', 'completed', 'bank_transfer', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days'),
  ('c00e8400-e29b-41d4-a716-446655440009', '900e8400-e29b-41d4-a716-446655440011', '600e8400-e29b-41d4-a716-446655440012', '600e8400-e29b-41d4-a716-446655440019', 4200000, 'INR', 'completed', 'bank_transfer', NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days'),
  ('c00e8400-e29b-41d4-a716-446655440010', '900e8400-e29b-41d4-a716-446655440014', '600e8400-e29b-41d4-a716-446655440005', '600e8400-e29b-41d4-a716-446655440030', 2600000, 'INR', 'confirmed', 'bank_transfer', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day');

-- ========================================
-- 10. CREATE FAVORITES (10+ entries for user bookmarks)
-- ========================================

INSERT INTO favorites (id, user_id, item_id, item_type, created_at)
VALUES
  -- Chennai Hub users' favorites
  ('d00e8400-e29b-41d4-a716-446655440001', '600e8400-e29b-41d4-a716-446655440001', '700e8400-e29b-41d4-a716-446655440008', 'idea', NOW() - INTERVAL '10 days'),
  ('d00e8400-e29b-41d4-a716-446655440002', '600e8400-e29b-41d4-a716-446655440001', '800e8400-e29b-41d4-a716-446655440002', 'offer', NOW() - INTERVAL '8 days'),
  ('d00e8400-e29b-41d4-a716-446655440003', '600e8400-e29b-41d4-a716-446655440003', '700e8400-e29b-41d4-a716-446655440013', 'idea', NOW() - INTERVAL '7 days'),
  ('d00e8400-e29b-41d4-a716-446655440004', '600e8400-e29b-41d4-a716-446655440004', '800e8400-e29b-41d4-a716-446655440007', 'offer', NOW() - INTERVAL '6 days'),
  ('d00e8400-e29b-41d4-a716-446655440005', '600e8400-e29b-41d4-a716-446655440005', '700e8400-e29b-41d4-a716-446655440019', 'idea', NOW() - INTERVAL '5 days'),

  -- Bangalore Tech users' favorites
  ('d00e8400-e29b-41d4-a716-446655440006', '600e8400-e29b-41d4-a716-446655440011', '700e8400-e29b-41d4-a716-446655440014', 'idea', NOW() - INTERVAL '9 days'),
  ('d00e8400-e29b-41d4-a716-446655440007', '600e8400-e29b-41d4-a716-446655440012', '800e8400-e29b-41d4-a716-446655440008', 'offer', NOW() - INTERVAL '7 days'),
  ('d00e8400-e29b-41d4-a716-446655440008', '600e8400-e29b-41d4-a716-446655440014', '700e8400-e29b-41d4-a716-446655440020', 'idea', NOW() - INTERVAL '6 days'),
  ('d00e8400-e29b-41d4-a716-446655440009', '600e8400-e29b-41d4-a716-446655440016', '800e8400-e29b-41d4-a716-446655440014', 'offer', NOW() - INTERVAL '4 days'),
  ('d00e8400-e29b-41d4-a716-446655440010', '600e8400-e29b-41d4-a716-446655440018', '700e8400-e29b-41d4-a716-446655440026', 'idea', NOW() - INTERVAL '3 days'),

  -- Hyderabad Startups users' favorites
  ('d00e8400-e29b-41d4-a716-446655440011', '600e8400-e29b-41d4-a716-446655440021', '700e8400-e29b-41d4-a716-446655440032', 'idea', NOW() - INTERVAL '8 days'),
  ('d00e8400-e29b-41d4-a716-446655440012', '600e8400-e29b-41d4-a716-446655440022', '800e8400-e29b-41d4-a716-446655440017', 'offer', NOW() - INTERVAL '6 days'),
  ('d00e8400-e29b-41d4-a716-446655440013', '600e8400-e29b-41d4-a716-446655440024', '700e8400-e29b-41d4-a716-446655440028', 'idea', NOW() - INTERVAL '5 days'),
  ('d00e8400-e29b-41d4-a716-446655440014', '600e8400-e29b-41d4-a716-446655440026', '800e8400-e29b-41d4-a716-446655440023', 'offer', NOW() - INTERVAL '4 days'),
  ('d00e8400-e29b-41d4-a716-446655440015', '600e8400-e29b-41d4-a716-446655440028', '700e8400-e29b-41d4-a716-446655440030', 'idea', NOW() - INTERVAL '2 days');

-- ========================================
-- 11. CREATE ANALYTICS EVENTS (10+ entries for platform insights)
-- ========================================

INSERT INTO analytics_events (id, user_id, event_type, data, timestamp)
VALUES
  -- Profile views and engagement
  ('e00e8400-e29b-41d4-a716-446655440001', '600e8400-e29b-41d4-a716-446655440001', 'profile_view', '{"source": "search", "tenant": "chennai-hub", "user_type": "creator"}', NOW() - INTERVAL '7 days'),
  ('e00e8400-e29b-41d4-a716-446655440002', '600e8400-e29b-41d4-a716-446655440003', 'profile_view', '{"source": "match_suggestion", "tenant": "chennai-hub", "user_type": "investor"}', NOW() - INTERVAL '6 days'),
  ('e00e8400-e29b-41d4-a716-446655440003', '600e8400-e29b-41d4-a716-446655440002', 'profile_view', '{"source": "idea_detail", "tenant": "chennai-hub", "user_type": "creator"}', NOW() - INTERVAL '5 days'),
  ('e00e8400-e29b-41d4-a716-446655440004', '600e8400-e29b-41d4-a716-446655440011', 'profile_view', '{"source": "offer_detail", "tenant": "bangalore-tech", "user_type": "creator"}', NOW() - INTERVAL '4 days'),
  ('e00e8400-e29b-41d4-a716-446655440005', '600e8400-e29b-41d4-a716-446655440012', 'profile_view', '{"source": "search", "tenant": "bangalore-tech", "user_type": "investor"}', NOW() - INTERVAL '3 days'),

  -- Idea and offer interactions
  ('e00e8400-e29b-41d4-a716-446655440006', '600e8400-e29b-41d4-a716-446655440005', 'idea_view', '{"idea_id": "700e8400-e29b-41d4-a716-446655440001", "category": "Agriculture Technology", "source": "search"}', NOW() - INTERVAL '8 days'),
  ('e00e8400-e29b-41d4-a716-446655440007', '600e8400-e29b-41d4-a716-446655440015', 'offer_view', '{"offer_id": "800e8400-e29b-41d4-a716-446655440004", "amount_range": "750000-3000000", "source": "browse"}', NOW() - INTERVAL '7 days'),
  ('e00e8400-e29b-41d4-a716-446655440008', '600e8400-e29b-41d4-a716-446655440025', 'idea_view', '{"idea_id": "700e8400-e29b-41d4-a716-446655440009", "category": "Education Technology", "source": "category_browse"}', NOW() - INTERVAL '6 days'),
  ('e00e8400-e29b-41d4-a716-446655440009', '600e8400-e29b-41d4-a716-446655440008', 'offer_view', '{"offer_id": "800e8400-e29b-41d4-a716-446655440013", "amount_range": "600000-3000000", "source": "match_suggestion"}', NOW() - INTERVAL '5 days'),
  ('e00e8400-e29b-41d4-a716-446655440010', '600e8400-e29b-41d4-a716-446655440018', 'idea_view', '{"idea_id": "700e8400-e29b-41d4-a716-446655440020", "category": "Clean Technology", "source": "featured"}', NOW() - INTERVAL '4 days'),

  -- Match and conversation events
  ('e00e8400-e29b-41d4-a716-446655440011', '600e8400-e29b-41d4-a716-446655440003', 'match_view', '{"match_id": "900e8400-e29b-41d4-a716-446655440001", "match_score": 0.87, "action": "interested"}', NOW() - INTERVAL '10 days'),
  ('e00e8400-e29b-41d4-a716-446655440012', '600e8400-e29b-41d4-a716-446655440008', 'match_view', '{"match_id": "900e8400-e29b-41d4-a716-446655440004", "match_score": 0.91, "action": "contact_initiated"}', NOW() - INTERVAL '9 days'),
  ('e00e8400-e29b-41d4-a716-446655440013', '600e8400-e29b-41d4-a716-446655440001', 'conversation_started', '{"match_id": "900e8400-e29b-41d4-a716-446655440001", "message_count": 8}', NOW() - INTERVAL '8 days'),
  ('e00e8400-e29b-41d4-a716-446655440014', '600e8400-e29b-41d4-a716-446655440002', 'conversation_started', '{"match_id": "900e8400-e29b-41d4-a716-446655440004", "message_count": 6}', NOW() - INTERVAL '7 days'),
  ('e00e8400-e29b-41d4-a716-446655440015', '600e8400-e29b-41d4-a716-446655440004', 'conversation_started', '{"match_id": "900e8400-e29b-41d4-a716-446655440007", "message_count": 7}', NOW() - INTERVAL '6 days'),

  -- Platform engagement events
  ('e00e8400-e29b-41d4-a716-446655440016', '600e8400-e29b-41d4-a716-446655440001', 'search_performed', '{"query": "agritech tamil nadu", "results_count": 12, "filters_applied": ["category", "location"]}', NOW() - INTERVAL '5 days'),
  ('e00e8400-e29b-41d4-a716-446655440017', '600e8400-e29b-41d4-a716-446655440011', 'search_performed', '{"query": "ai karnataka", "results_count": 8, "filters_applied": ["category", "investment_range"]}', NOW() - INTERVAL '4 days'),
  ('e00e8400-e29b-41d4-a716-446655440018', '600e8400-e29b-41d4-a716-446655440021', 'search_performed', '{"query": "pharma telangana", "results_count": 15, "filters_applied": ["category", "stage"]}', NOW() - INTERVAL '3 days'),
  ('e00e8400-e29b-41d4-a716-446655440019', '600e8400-e29b-41d4-a716-446655440005', 'filter_applied', '{"filter_type": "amount_range", "filter_value": "1000000-5000000", "results_count": 23}', NOW() - INTERVAL '2 days'),
  ('e00e8400-e29b-41d4-a716-446655440020', '600e8400-e29b-41d4-a716-446655440015', 'filter_applied', '{"filter_type": "equity_range", "filter_value": "10-25", "results_count": 18}', NOW() - INTERVAL '1 day');

-- Final diagnostic log
SELECT 'Complete sample data creation finished successfully for South India multitenant platform with all 11 tables populated' as status;
