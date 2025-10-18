const https = require('https');

// Supabase configuration from .env.local
const SUPABASE_URL = 'https://gvcpibvhxylmqkkmejro.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Y3BpYnZoeHlsbXFra21lanJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA0MjU2OSwiZXhwIjoyMDc1NjE4NTY5fQ.Mbv4Fnpe9tJnaY5EqsaJT60poktmQpj56zAqhoWIvzA';

const SUPER_ADMIN_EMAIL = 'test@example.com';
const SUPER_ADMIN_PASSWORD = 'admin123';

async function fixSuperAdminAuth() {
  console.log('🔧 Fixing Super Admin Authentication...');
  console.log(`📧 Email: ${SUPER_ADMIN_EMAIL}`);
  console.log(`🔑 New Password: ${SUPER_ADMIN_PASSWORD}`);

  try {
    // Step 1: Check if auth user exists
    console.log('\n🔍 Step 1: Checking if auth user exists...');
    const existingAuthUser = await findAuthUser();

    if (existingAuthUser) {
      console.log(`✅ Auth user exists with ID: ${existingAuthUser.id}`);

      // Step 2: Update existing auth user password
      console.log('\n🔑 Step 2: Updating auth user password...');
      await updateAuthUserPassword(existingAuthUser.id);
      console.log('✅ Auth user password updated successfully');

    } else {
      console.log('❌ Auth user does not exist');

      // Step 3: Create new auth user with password
      console.log('\n👤 Step 3: Creating new auth user...');
      const newAuthUser = await createAuthUser();
      console.log(`✅ Auth user created with ID: ${newAuthUser.id}`);
    }

    console.log('\n🎉 Super Admin authentication fixed!');
    console.log('\n🔑 Updated Login Credentials:');
    console.log(`   Email: ${SUPER_ADMIN_EMAIL}`);
    console.log(`   Password: ${SUPER_ADMIN_PASSWORD}`);
    console.log('\n🌐 Try logging in again at: /auth/login');

  } catch (error) {
    console.error('\n❌ Error fixing super admin auth:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response body:', error.responseBody);
    }
  }
}

async function findAuthUser() {
  const url = `${SUPABASE_URL}/auth/v1/admin/users`;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'gvcpibvhxylmqkkmejro.supabase.co',
      path: '/auth/v1/admin/users',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const data = JSON.parse(body);
            const user = data.users.find(u => u.email === SUPER_ADMIN_EMAIL);
            resolve(user || null);
          } catch (error) {
            reject(new Error(`Failed to parse auth users response: ${body}`));
          }
        } else {
          reject(new Error(`Failed to fetch auth users: ${res.statusCode} ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function updateAuthUserPassword(userId) {
  const url = `${SUPABASE_URL}/auth/v1/admin/users/${userId}`;

  const updateData = {
    password: SUPER_ADMIN_PASSWORD,
    email_confirm: true
  };

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(updateData);

    const options = {
      hostname: 'gvcpibvhxylmqkkmejro.supabase.co',
      path: `/auth/v1/admin/users/${userId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Password update failed: ${res.statusCode} ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function createAuthUser() {
  const url = `${SUPABASE_URL}/auth/v1/admin/users`;

  const authUserData = {
    email: SUPER_ADMIN_EMAIL,
    password: SUPER_ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      name: 'Super Admin'
    }
  };

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(authUserData);

    const options = {
      hostname: 'gvcpibvhxylmqkkmejro.supabase.co',
      path: '/auth/v1/admin/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Auth user creation failed: ${res.statusCode} ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Run the script
fixSuperAdminAuth();