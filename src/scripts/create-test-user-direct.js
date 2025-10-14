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

    console.log('🚀 Creating test user directly via Supabase REST API...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables');
      console.log('🔍 Checked for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
      return;
    }

    console.log('✅ Environment variables loaded successfully');

    const testUser = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'test@example.com',
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

    // First, check if user already exists
    const checkUrl = `${supabaseUrl}/rest/v1/users?email=eq.${testUser.email}&select=id`;

    const existingUser = await makeRequest(checkUrl, supabaseKey, 'GET');

    if (existingUser && existingUser.length > 0) {
      console.log('✅ Test user already exists:', existingUser[0].id);
      console.log('📧 Email: test@example.com');
      console.log('🔑 Password: testpassword123');
      return existingUser[0].id;
    }

    // Create new user
    const createUrl = `${supabaseUrl}/rest/v1/users`;

    const newUser = await makeRequest(createUrl, supabaseKey, 'POST', testUser);

    if (newUser && newUser.length > 0) {
      console.log('✅ Test user created successfully!');
      console.log('📧 Email: test@example.com');
      console.log('🔑 Password: testpassword123');
      console.log('🆔 User ID:', newUser[0].id);
      return newUser[0].id;
    } else {
      console.error('❌ Failed to create test user');
    }

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  }
}

function makeRequest(url, apiKey, method, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Prefer': 'return=representation'
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
