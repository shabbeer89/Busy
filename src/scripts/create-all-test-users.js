// Comprehensive script to create all test users with proper Supabase Auth integration
const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnvFile() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');

      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
          process.env[key] = value;
        }
      });
    }
  } catch (error) {
    console.warn('⚠️ Could not load .env.local file:', error.message);
  }
}

// Test users data (8 total: 4 creators, 4 investors)
const testUsers = [
  // Creators
  {
    email: 'sarah.chen@example.com',
    password: 'password123',
    name: 'Sarah Chen',
    user_type: 'creator',
    company_name: 'EcoTech Solutions',
    industry: 'Clean Technology',
    experience: '5+ years',
    bio: 'Passionate about sustainable technology and environmental innovation. Building the future of clean energy solutions.',
    location: 'San Francisco, CA',
    website: 'https://ecotech.example.com',
    is_verified: true,
    phone_verified: true
  },
  {
    email: 'mike.rodriguez@example.com',
    password: 'password123',
    name: 'Mike Rodriguez',
    user_type: 'creator',
    company_name: 'HealthAI',
    industry: 'Healthcare',
    experience: '7+ years',
    bio: 'AI-driven healthcare solutions for better patient outcomes. Transforming medical diagnosis with machine learning.',
    location: 'Austin, TX',
    website: 'https://healthai.example.com',
    is_verified: true,
    phone_verified: true
  },
  {
    email: 'amina.benali@example.com',
    password: 'password123',
    name: 'Amina Benali',
    user_type: 'creator',
    company_name: 'EduChain',
    industry: 'Education',
    experience: '6+ years',
    bio: 'Blockchain-based educational credentials and decentralized learning platforms. Making education accessible to all.',
    location: 'New York, NY',
    website: 'https://educhain.example.com',
    is_verified: true,
    phone_verified: true
  },
  {
    email: 'david.kim@example.com',
    password: 'password123',
    name: 'David Kim',
    user_type: 'creator',
    company_name: 'FinFlow',
    industry: 'Fintech',
    experience: '8+ years',
    bio: 'Next-generation financial technology for seamless global transactions. Building the infrastructure for digital finance.',
    location: 'Seattle, WA',
    website: 'https://finflow.example.com',
    is_verified: true,
    phone_verified: true
  },
  // Investors
  {
    email: 'alexandra.foster@example.com',
    password: 'password123',
    name: 'Alexandra Foster',
    user_type: 'investor',
    company_name: 'Healthcare Ventures',
    industry: 'Healthcare',
    experience: '12+ years',
    bio: 'Healthcare investor focused on innovative medical technologies and biotechnology startups.',
    location: 'Boston, MA',
    website: 'https://healthcareventures.example.com',
    is_verified: true,
    phone_verified: true
  },
  {
    email: 'james.wilson@example.com',
    password: 'password123',
    name: 'James Wilson',
    user_type: 'investor',
    company_name: 'TechFund Capital',
    industry: 'Technology',
    experience: '15+ years',
    bio: 'Venture capitalist specializing in AI, SaaS, and enterprise software. Former tech executive with multiple exits.',
    location: 'Silicon Valley, CA',
    website: 'https://techfund.example.com',
    is_verified: true,
    phone_verified: true
  },
  {
    email: 'priya.patel@example.com',
    password: 'password123',
    name: 'Priya Patel',
    user_type: 'investor',
    company_name: 'Social Impact Partners',
    industry: 'Social Impact',
    experience: '10+ years',
    bio: 'Impact investor focused on social enterprises and sustainable development. Committed to positive social change.',
    location: 'Washington, DC',
    website: 'https://socialimpact.example.com',
    is_verified: true,
    phone_verified: true
  },
  {
    email: 'robert.taylor@example.com',
    password: 'password123',
    name: 'Robert Taylor',
    user_type: 'investor',
    company_name: 'CleanTech Investments',
    industry: 'Clean Technology',
    experience: '13+ years',
    bio: 'Clean technology investor with focus on renewable energy, sustainability, and environmental solutions.',
    location: 'Denver, CO',
    website: 'https://cleantech.example.com',
    is_verified: true,
    phone_verified: true
  }
];

async function createAllTestUsers() {
  try {
    // Load environment variables first
    loadEnvFile();

    console.log('🚀 Creating all test users with proper Supabase Auth integration...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables');
      console.log('🔍 Checked for NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
      return;
    }

    console.log('✅ Environment variables loaded successfully');
    console.log(`📊 Creating ${testUsers.length} test users...`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      console.log(`\n👤 [${i + 1}/${testUsers.length}] Creating: ${user.name} (${user.email})`);

      try {
        // Step 1: Check if Supabase Auth user exists
        const listUsersUrl = `${supabaseUrl}/auth/v1/admin/users`;
        const existingUsers = await makeRequest(listUsersUrl, supabaseServiceKey, 'GET');

        let authUser = null;
        if (existingUsers && existingUsers.users) {
          authUser = existingUsers.users.find(u => u.email === user.email);
        }

        if (authUser) {
          console.log('  ✅ Found existing Supabase Auth user:', authUser.id);
        } else {
          // Step 2: Create new Supabase Auth user
          console.log('  👤 Creating new Supabase Auth user...');
          const createAuthUserUrl = `${supabaseUrl}/auth/v1/admin/users`;

          const authUserData = {
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: {
              name: user.name
            }
          };

          const newAuthUser = await makeRequest(createAuthUserUrl, supabaseServiceKey, 'POST', authUserData);

          if (!newAuthUser || !newAuthUser.id) {
            console.error(`  ❌ Failed to create Supabase Auth user for ${user.email}`);
            errorCount++;
            continue;
          }

          authUser = newAuthUser;
          console.log('  ✅ Created Supabase Auth user:', authUser.id);
        }

        // Step 3: Check if profile exists in custom users table
        const profileCheckUrl = `${supabaseUrl}/rest/v1/users?email=eq.${user.email}&select=id`;
        const existingProfile = await makeRequest(profileCheckUrl, supabaseServiceKey, 'GET');

        if (existingProfile && existingProfile.length > 0) {
          console.log('  ✅ Profile already exists in custom users table');
          successCount++;
          continue;
        }

        // Step 4: Create profile in custom users table
        console.log('  📝 Creating profile in custom users table...');
        const profileData = {
          id: authUser.id, // Use the Supabase Auth user ID
          email: user.email,
          name: user.name,
          user_type: user.user_type,
          is_verified: user.is_verified,
          phone_verified: user.phone_verified,
          company_name: user.company_name,
          industry: user.industry,
          experience: user.experience,
          bio: user.bio,
          location: user.location,
          website: user.website
        };

        const createProfileUrl = `${supabaseUrl}/rest/v1/users`;
        const newProfile = await makeRequest(createProfileUrl, supabaseServiceKey, 'POST', profileData);

        if (newProfile && newProfile.length > 0) {
          console.log('  ✅ Profile created successfully!');
          console.log(`     Email: ${user.email}`);
          console.log(`     Password: ${user.password}`);
          console.log(`     User ID: ${newProfile[0].id}`);
          successCount++;
        } else {
          console.error(`  ❌ Failed to create profile for ${user.email}`);
          errorCount++;
        }

      } catch (error) {
        console.error(`  ❌ Error creating user ${user.email}:`, error.message);
        errorCount++;
      }
    }

    // Summary
    console.log(`\n📊 Creation Summary:`);
    console.log(`✅ Successfully created: ${successCount} users`);
    console.log(`❌ Failed to create: ${errorCount} users`);
    console.log(`📧 Total users: ${testUsers.length}`);

    if (successCount > 0) {
      console.log(`\n🔑 Test Credentials (all users have the same password):`);
      testUsers.forEach(user => {
        console.log(`   ${user.name}: ${user.email} / ${user.password}`);
      });
    }

  } catch (error) {
    console.error('❌ Error in createAllTestUsers:', error.message);
  }
}

function makeRequest(url, apiKey, method, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    // Determine if this is an admin API call (auth endpoints)
    const isAdminAPI = url.includes('/auth/v1/admin/');

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        ...(isAdminAPI && { 'Prefer': 'return=representation' })
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          if (body) {
            resolve(JSON.parse(body));
          } else {
            resolve(null);
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Run the script
createAllTestUsers();
