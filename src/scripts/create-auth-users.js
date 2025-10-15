// Simple script to create auth users in Supabase Auth
const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

// Load environment variables
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
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          process.env[key] = value;
        }
      });
    }
  } catch (error) {
    console.warn('Could not load .env.local file:', error.message);
  }
}

// Simple test users for auth
const authUsers = [
  { email: 'test@example.com', password: 'testpassword123' },
  { email: 'sarah.chen@example.com', password: 'password123' },
  { email: 'mike.rodriguez@example.com', password: 'password123' },
  { email: 'amina.benali@example.com', password: 'password123' },
  { email: 'david.kim@example.com', password: 'password123' },
  { email: 'alexandra.foster@example.com', password: 'password123' },
  { email: 'james.wilson@example.com', password: 'password123' },
  { email: 'priya.patel@example.com', password: 'password123' },
  { email: 'robert.taylor@example.com', password: 'password123' }
];

async function createAuthUsers() {
  loadEnvFile();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing env vars');
    return;
  }

  console.log('Creating auth users...');

  for (const user of authUsers) {
    try {
      console.log(`Creating: ${user.email}`);

      const authData = {
        email: user.email,
        password: user.password,
        email_confirm: true
      };

      const response = await makeRequest(
        `${supabaseUrl}/auth/v1/admin/users`,
        serviceKey,
        'POST',
        authData
      );

      if (response && response.id) {
        console.log(`✅ Created: ${user.email} - ID: ${response.id}`);
      } else {
        console.log(`❌ Failed: ${user.email}`);
      }
    } catch (error) {
      console.error(`Error creating ${user.email}:`, error.message);
    }
  }

  console.log('\n📧 Test Credentials:');
  authUsers.forEach(user => {
    console.log(`${user.email} / ${user.password}`);
  });
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
        'Authorization': `Bearer ${apiKey}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : null);
        } catch (error) {
          reject(new Error(`Parse error: ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (data && method === 'POST') {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

createAuthUsers();
