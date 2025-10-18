const https = require('https');

// Supabase configuration from .env.local
const SUPABASE_URL = 'https://gvcpibvhxylmqkkmejro.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Y3BpYnZoeHlsbXFra21lanJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA0MjU2OSwiZXhwIjoyMDc1NjE4NTY5fQ.Mbv4Fnpe9tJnaY5EqsaJT60poktmQpj56zAqhoWIvzA';

const SUPER_ADMIN_DATA = {
  email: 'test@example.com',
  password: 'admin123',
  name: 'Super Admin',
  user_type: 'super_admin',
  is_verified: true,
  phone_verified: true
};

async function createSuperAdmin() {
  console.log('🚀 Creating Super Admin User...');
  console.log(`📧 Email: ${SUPER_ADMIN_DATA.email}`);
  console.log(`🔑 Password: ${SUPER_ADMIN_DATA.password}`);
  console.log(`👤 Name: ${SUPER_ADMIN_DATA.name}`);
  console.log(`🏷️  User Type: ${SUPER_ADMIN_DATA.user_type}`);

  try {
    // Step 1: Create auth user
    console.log('\n📝 Step 1: Creating Supabase Auth user...');
    const authUser = await createAuthUser();
    console.log(`✅ Auth user created with ID: ${authUser.id}`);

    // Step 2: Create user profile
    console.log('\n👤 Step 2: Creating user profile...');
    const profile = await createUserProfile(authUser.id);
    console.log(`✅ User profile created:`, profile);

    console.log('\n🎉 Super Admin user created successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log(`   Email: ${SUPER_ADMIN_DATA.email}`);
    console.log(`   Password: ${SUPER_ADMIN_DATA.password}`);
    console.log('\n🌐 Access the admin panel at: /admin');
    console.log('\n⚠️  Note: This user has automatic super admin privileges in the admin layout');

  } catch (error) {
    console.error('\n❌ Error creating super admin user:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response body:', error.responseBody);
    }
  }
}

async function createAuthUser() {
  const url = `${SUPABASE_URL}/auth/v1/admin/users`;

  const postData = JSON.stringify({
    email: SUPER_ADMIN_DATA.email,
    password: SUPER_ADMIN_DATA.password,
    email_confirm: true,
    user_metadata: {
      name: SUPER_ADMIN_DATA.name
    }
  });

  return new Promise((resolve, reject) => {
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
          try {
            const data = JSON.parse(body);
            resolve(data);
          } catch (error) {
            reject(new Error(`Failed to parse auth user response: ${body}`));
          }
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

async function createUserProfile(authUserId) {
  const url = `${SUPABASE_URL}/rest/v1/users`;

  const profileData = {
    id: authUserId,
    email: SUPER_ADMIN_DATA.email,
    name: SUPER_ADMIN_DATA.name,
    user_type: SUPER_ADMIN_DATA.user_type,
    is_verified: SUPER_ADMIN_DATA.is_verified,
    phone_verified: SUPER_ADMIN_DATA.phone_verified
  };

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(profileData);

    const options = {
      hostname: 'gvcpibvhxylmqkkmejro.supabase.co',
      path: '/rest/v1/users',
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
          try {
            const data = JSON.parse(body);
            resolve(data[0]); // Return first item from array
          } catch (error) {
            reject(new Error(`Failed to parse profile response: ${body}`));
          }
        } else {
          reject(new Error(`Profile creation failed: ${res.statusCode} ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Run the script
createSuperAdmin();