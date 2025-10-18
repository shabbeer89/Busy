// Direct test user creation script using Supabase REST API
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

async function createTestUser() {
  try {
    // Load environment variables first
    loadEnvFile();

    console.log('🚀 Creating test user properly with Supabase Auth integration...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables');
      console.log('🔍 Checked for NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
      return;
    }

    console.log('✅ Environment variables loaded successfully');

    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';

    // Step 1: Check if Supabase Auth user exists
    console.log('🔍 Checking for existing Supabase Auth user...');
    const listUsersUrl = `${supabaseUrl}/auth/v1/admin/users`;

    try {
      const existingUsers = await makeRequest(listUsersUrl, supabaseServiceKey, 'GET');

      if (existingUsers && existingUsers.users) {
        const existingAuthUser = existingUsers.users.find(user => user.email === testEmail);

        if (existingAuthUser) {
          console.log('✅ Found existing Supabase Auth user:', existingAuthUser.id);

          // Check if profile exists in custom users table
          const profileCheckUrl = `${supabaseUrl}/rest/v1/users?email=eq.${testEmail}&select=id`;
          const existingProfile = await makeRequest(profileCheckUrl, supabaseServiceKey, 'GET');

          if (existingProfile && existingProfile.length > 0) {
            console.log('✅ Test user profile already exists:', existingProfile[0].id);
            console.log('📧 Email: test@example.com');
            console.log('🔑 Password: testpassword123');
            return existingProfile[0].id;
          }

          // Create profile in custom users table using auth user ID
          console.log('📝 Creating user profile in custom users table...');
          const profileData = {
            id: existingAuthUser.id, // Use the Supabase Auth user ID
            email: testEmail,
            name: 'Test User',
            user_type: 'creator',
            is_verified: true,
            phone_verified: true,
            company_name: 'Test Company',
            industry: 'Technology',
            experience: '5+ years',
            bio: 'Test user for development and testing purposes',
            location: 'San Francisco, CA',
            website: 'https://example.com',
            social_links: {
              linkedin: 'https://linkedin.com/in/testuser',
              twitter: 'https://twitter.com/testuser'
            }
          };

          const createProfileUrl = `${supabaseUrl}/rest/v1/users`;
          const newProfile = await makeRequest(createProfileUrl, supabaseServiceKey, 'POST', profileData);

          if (newProfile && newProfile.length > 0) {
            console.log('✅ Test user profile created successfully!');
            console.log('📧 Email: test@example.com');
            console.log('🔑 Password: testpassword123');
            console.log('🆔 User ID:', newProfile[0].id);
            return newProfile[0].id;
          }
        }
      }
    } catch (error) {
      console.log('ℹ️ Could not check existing users, creating new auth user...');
    }

    // Step 2: Create new Supabase Auth user
    console.log('👤 Creating new Supabase Auth user...');
    const createAuthUserUrl = `${supabaseUrl}/auth/v1/admin/users`;

    const authUserData = {
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        name: 'Test User'
      }
    };

    const newAuthUser = await makeRequest(createAuthUserUrl, supabaseServiceKey, 'POST', authUserData);

    if (!newAuthUser || !newAuthUser.id) {
      console.error('❌ Failed to create Supabase Auth user');
      return;
    }

    console.log('✅ Created Supabase Auth user:', newAuthUser.id);

    // Step 3: Create profile in custom users table
    console.log('📝 Creating user profile in custom users table...');
    const profileData = {
      id: newAuthUser.id, // Use the Supabase Auth user ID
      email: testEmail,
      name: 'Test User',
      user_type: 'creator',
      is_verified: true,
      phone_verified: true,
      company_name: 'Test Company',
      industry: 'Technology',
      experience: '5+ years',
      bio: 'Test user for development and testing purposes',
      location: 'San Francisco, CA',
      website: 'https://example.com',
      social_links: {
        linkedin: 'https://linkedin.com/in/testuser',
        twitter: 'https://twitter.com/testuser'
      }
    };

    const createProfileUrl = `${supabaseUrl}/rest/v1/users`;
    const newProfile = await makeRequest(createProfileUrl, supabaseServiceKey, 'POST', profileData);

    if (newProfile && newProfile.length > 0) {
      console.log('✅ Test user created successfully!');
      console.log('📧 Email: test@example.com');
      console.log('🔑 Password: testpassword123');
      console.log('🆔 User ID:', newProfile[0].id);
      return newProfile[0].id;
    } else {
      console.error('❌ Failed to create test user profile');
    }

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
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
createTestUser();
