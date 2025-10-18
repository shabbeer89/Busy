const https = require('https');

// Supabase configuration from .env.local
const SUPABASE_URL = 'https://gvcpibvhxylmqkkmejro.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Y3BpYnZoeHlsbXFra21lanJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA0MjU2OSwiZXhwIjoyMDc1NjE4NTY5fQ.Mbv4Fnpe9tJnaY5EqsaJT60poktmQpj56zAqhoWIvzA';

const SUPER_ADMIN_EMAIL = 'test@example.com';

async function updateUserToSuperAdmin() {
  console.log('🚀 Updating existing user to Super Admin...');
  console.log(`📧 Email: ${SUPER_ADMIN_EMAIL}`);

  try {
    // Step 1: Find the existing auth user
    console.log('\n🔍 Step 1: Finding existing auth user...');
    const authUser = await findAuthUser();
    console.log(`✅ Found auth user with ID: ${authUser.id}`);

    // Step 2: Update user profile to super admin
    console.log('\n👤 Step 2: Updating user profile to super admin...');
    const profile = await updateUserProfile(authUser.id);
    console.log(`✅ User profile updated to super admin:`, profile);

    console.log('\n🎉 User updated to Super Admin successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log(`   Email: ${SUPER_ADMIN_EMAIL}`);
    console.log(`   Password: Try common passwords like 'password123', 'admin123', or 'test123'`);
    console.log('\n🌐 Access the admin panel at: /admin');

  } catch (error) {
    console.error('\n❌ Error updating user to super admin:', error.message);
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
            if (user) {
              resolve(user);
            } else {
              reject(new Error(`User with email ${SUPER_ADMIN_EMAIL} not found`));
            }
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

async function updateUserProfile(authUserId) {
  const url = `${SUPABASE_URL}/rest/v1/users?id=eq.${authUserId}`;

  const profileData = {
    user_type: 'super_admin',
    is_verified: true,
    phone_verified: true
  };

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(profileData);

    const options = {
      hostname: 'gvcpibvhxylmqkkmejro.supabase.co',
      path: `/rest/v1/users?id=eq.${authUserId}`,
      method: 'PATCH',
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
          try {
            const data = JSON.parse(body);
            resolve(data[0]); // Return first item from array
          } catch (error) {
            reject(new Error(`Failed to parse profile update response: ${body}`));
          }
        } else {
          reject(new Error(`Profile update failed: ${res.statusCode} ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Run the script
updateUserToSuperAdmin();