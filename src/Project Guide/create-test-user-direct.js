#!/usr/bin/env node

// ============================================================================
// Strategic Partnership Platform - Test User Creation Script
// ============================================================================
//
// DESCRIPTION:
//   Creates a comprehensive test user with both Supabase Auth integration
//   and a detailed profile in the custom users table.
//
// FEATURES:
//   - Creates Supabase Auth user with email confirmation
//   - Creates corresponding profile in custom users table
//   - Handles existing users gracefully (updates instead of errors)
//   - Comprehensive error handling and logging
//   - Validates environment configuration
//   - Uses proper UUID linking between auth and profile
//
// USAGE:
//   node create-test-user-direct.js
//
// OUTPUT:
//   - Test user credentials for login
//   - User ID for reference
//   - Detailed progress logging
//
// REQUIREMENTS:
//   - Node.js 16+
//   - Environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   - Proper Supabase project configuration
//
// SECURITY NOTE:
//   This script uses the service role key which bypasses RLS policies.
//   Only use in development environments.
//
// ============================================================================

const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

// Configuration constants
const CONFIG = {
  TEST_USER: {
    email: 'test@example.com',
    password: 'testpassword123',
    name: 'Admin User',
    user_type: 'creator', // Must match CHECK constraint in database
    is_verified: true,
    phone_verified: true,
    company_name: 'Admin Company',
    industry: 'Technology',
    experience: '10+ years',
    bio: 'Administrator for development and testing purposes',
    location: 'San Francisco, CA',
    website: 'https://example.com',
    social_links: {
      linkedin: 'https://linkedin.com/in/admin',
      twitter: 'https://twitter.com/admin'
    }
  },
  RETRY_ATTEMPTS: 3,
  REQUEST_TIMEOUT: 30000 // 30 seconds
};

/**
 * Load environment variables from .env.local file
 * @returns {void}
 */
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

      console.log(`✅ Loaded environment from: ${path.relative(process.cwd(), envPath)}`);
    } else {
      console.log('ℹ️  No .env.local file found, using existing environment variables');
    }
  } catch (error) {
    console.warn('⚠️ Could not load .env.local file:', error.message);
  }
}

/**
 * Validate required environment variables and configuration
 * @returns {{isValid: boolean, errors: string[], config?: Object}} Validation result
 */
function validateEnvironment() {
  const requiredVars = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', description: 'Supabase project URL' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Service role key for admin operations' }
  ];

  const missing = requiredVars.filter(({ key }) => !process.env[key]);
  const errors = [];

  if (missing.length > 0) {
    errors.push('Missing required environment variables:');
    missing.forEach(({ key, description }) => {
      errors.push(`   - ${key}: ${description}`);
    });
    errors.push('');
    errors.push('Setup required:');
    errors.push('1. Create a .env.local file in your project root');
    errors.push('2. Add your Supabase project URL and service role key');
    errors.push('3. Example format:');
    errors.push('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
    errors.push('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  }

  // Validate URL format if present
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
      if (!url.hostname.endsWith('.supabase.co')) {
        errors.push('NEXT_PUBLIC_SUPABASE_URL does not appear to be a valid Supabase URL');
      }
    } catch (error) {
      errors.push('NEXT_PUBLIC_SUPABASE_URL is not a valid URL format');
    }
  }

  const config = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  };

  return {
    isValid: errors.length === 0,
    errors,
    config
  };
}

/**
 * Main function to create a comprehensive test user with proper Supabase Auth integration
 * @returns {Promise<string|null>} User ID if successful, null if failed
 */
async function createTestUser() {
  const startTime = Date.now();
  let userId = null;

  try {
    // Phase 1: Environment setup
    console.log('🚀 Strategic Partnership Platform - Test User Creation');
    console.log('=' .repeat(60));

    console.log('\n🔧 Phase 1: Loading configuration...');
    loadEnvFile();

    // Enhanced environment validation
    const validation = validateEnvironment();
    if (!validation.isValid) {
      console.error('❌ Environment validation failed');
      validation.errors.forEach(error => console.error(`   ${error}`));
      return null;
    }

    const config = validation.config;
    console.log('✅ Configuration loaded successfully');

    // Phase 2: User existence check
    console.log('\n🔍 Phase 2: Checking for existing users...');

    const existingAuthUser = await findExistingAuthUser(config.supabaseUrl, config.supabaseServiceKey);

    if (existingAuthUser) {
      console.log('✅ Found existing Supabase Auth user');
      console.log(`   🆔 User ID: ${existingAuthUser.id}`);
      console.log(`   📧 Email: ${existingAuthUser.email}`);
      console.log(`   🕒 Created: ${new Date(existingAuthUser.created_at).toLocaleString()}`);

      // Check and update existing profile
      userId = await handleExistingUser(existingAuthUser, config);
    } else {
      console.log('ℹ️  No existing auth user found, will create new user');
      // Phase 3: Create new user
      console.log('\n👤 Phase 3: Creating new Supabase Auth user...');
      userId = await createNewAuthUser(config);
    }

    if (!userId) {
      console.error('\n❌ Failed to create or update user');
      return null;
    }

    // Phase 4: Final verification
    console.log('\n🔍 Phase 4: Verifying user creation...');
    const verification = await verifyUserCreation(userId, config);

    if (verification.success) {
      const duration = Math.round((Date.now() - startTime) / 1000);
      console.log('\n🎉 SUCCESS! Test user is ready for use');
      console.log('=' .repeat(60));
      console.log(`⏱️  Completed in ${duration} seconds`);
      console.log(`📧 Email: ${CONFIG.TEST_USER.email}`);
      console.log(`🔑 Password: ${CONFIG.TEST_USER.password}`);
      console.log(`🆔 User ID: ${userId}`);
      console.log('👑 Role: Super Admin (Creator)');
      console.log('=' .repeat(60));
      console.log('\n🚀 You can now log in to the application!');
      console.log(`🌐 Access URL: ${config.supabaseUrl.replace('/rest/v1', '')}`);
    }

    return userId;

  } catch (error) {
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.error(`\n❌ CRITICAL ERROR after ${duration} seconds:`, error.message);
    console.error('Stack trace:', error.stack);

    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Verify your Supabase configuration');
    console.log('2. Check that your Supabase project is active');
    console.log('3. Ensure the service role key has admin permissions');
    console.log('4. Verify your internet connection');
    console.log('5. Check Supabase dashboard for any project issues');

    return null;
  }
}

/**
 * Find existing Supabase Auth user by email
 * @param {string} supabaseUrl - Supabase project URL
 * @param {string} serviceKey - Service role key
 * @returns {Promise<Object|null>} User object or null
 */
async function findExistingAuthUser(supabaseUrl, serviceKey) {
  console.log('🔍 Checking for existing Supabase Auth user...');

  const listUsersUrl = `${supabaseUrl}/auth/v1/admin/users`;

  try {
    const existingUsers = await makeRequest(listUsersUrl, serviceKey, 'GET');

    if (existingUsers && existingUsers.users && existingUsers.users.length > 0) {
      const existingAuthUser = existingUsers.users.find(user => user.email === CONFIG.TEST_USER.email);

      if (existingAuthUser) {
        console.log('✅ Found existing Supabase Auth user:');
        console.log(`   🆔 User ID: ${existingAuthUser.id}`);
        console.log(`   📧 Email: ${existingAuthUser.email}`);
        console.log(`   🕒 Created: ${new Date(existingAuthUser.created_at).toLocaleString()}`);
        return existingAuthUser;
      }
    }

    console.log('ℹ️  No existing auth user found');
    return null;

  } catch (error) {
    console.log('ℹ️  Could not check existing users, will attempt to create new user:', error.message);
    return null;
  }
}

/**
 * Handle existing auth user by ensuring profile exists
 * @param {Object} authUser - Existing Supabase Auth user
 * @param {Object} config - Configuration object
 * @returns {Promise<string|null>} User ID or null
 */
async function handleExistingUser(authUser, config) {
  console.log('\n📝 Checking existing user profile...');

  try {
    // Check if profile exists in custom users table
    const profileCheckUrl = `${config.supabaseUrl}/rest/v1/users?id=eq.${authUser.id}&select=id`;
    const existingProfile = await makeRequest(profileCheckUrl, config.supabaseServiceKey, 'GET');

    if (existingProfile && existingProfile.length > 0) {
      console.log('✅ Found existing user profile, updating to ensure admin role...');

      // Update existing user to ensure proper admin role
      const updateData = {
        user_type: CONFIG.TEST_USER.user_type,
        name: CONFIG.TEST_USER.name,
        bio: CONFIG.TEST_USER.bio,
        is_verified: CONFIG.TEST_USER.is_verified,
        phone_verified: CONFIG.TEST_USER.phone_verified,
        company_name: CONFIG.TEST_USER.company_name,
        industry: CONFIG.TEST_USER.industry,
        experience: CONFIG.TEST_USER.experience,
        location: CONFIG.TEST_USER.location,
        website: CONFIG.TEST_USER.website,
        social_links: CONFIG.TEST_USER.social_links
      };

      const updateProfileUrl = `${config.supabaseUrl}/rest/v1/users?id=eq.${authUser.id}`;
      const updatedProfile = await makeRequest(updateProfileUrl, config.supabaseServiceKey, 'PATCH', updateData);

      if (updatedProfile && updatedProfile.length > 0) {
        console.log('✅ Updated existing user profile successfully!');
        return existingProfile[0].id;
      } else {
        console.error('❌ Failed to update existing user profile');
        return null;
      }
    }

    // Create profile in custom users table using auth user ID
    console.log('📝 Creating user profile in custom users table...');
    const profileData = {
      id: authUser.id, // Use the Supabase Auth user ID
      email: CONFIG.TEST_USER.email,
      name: CONFIG.TEST_USER.name,
      user_type: CONFIG.TEST_USER.user_type,
      is_verified: CONFIG.TEST_USER.is_verified,
      phone_verified: CONFIG.TEST_USER.phone_verified,
      company_name: CONFIG.TEST_USER.company_name,
      industry: CONFIG.TEST_USER.industry,
      experience: CONFIG.TEST_USER.experience,
      bio: CONFIG.TEST_USER.bio,
      location: CONFIG.TEST_USER.location,
      website: CONFIG.TEST_USER.website,
      social_links: CONFIG.TEST_USER.social_links
    };

    const createProfileUrl = `${config.supabaseUrl}/rest/v1/users`;
    const newProfile = await makeRequest(createProfileUrl, config.supabaseServiceKey, 'POST', profileData);

    if (newProfile && newProfile.length > 0) {
      console.log('✅ User profile created successfully!');
      return newProfile[0].id;
    } else {
      console.error('❌ Failed to create user profile');
      return null;
    }

  } catch (error) {
    console.error('❌ Error handling existing user:', error.message);
    return null;
  }
}

/**
 * Create new Supabase Auth user
 * @param {Object} config - Configuration object
 * @returns {Promise<string|null>} User ID or null
 */
async function createNewAuthUser(config) {
  console.log('👤 Creating new Supabase Auth user...');

  const createAuthUserUrl = `${config.supabaseUrl}/auth/v1/admin/users`;

  const authUserData = {
    email: CONFIG.TEST_USER.email,
    password: CONFIG.TEST_USER.password,
    email_confirm: true,
    user_metadata: {
      name: CONFIG.TEST_USER.name
    }
  };

  try {
    const newAuthUser = await makeRequest(createAuthUserUrl, config.supabaseServiceKey, 'POST', authUserData);

    if (!newAuthUser || !newAuthUser.id) {
      console.error('❌ Failed to create Supabase Auth user');
      console.error('Response:', newAuthUser);
      return null;
    }

    console.log('✅ Created Supabase Auth user:');
    console.log(`   🆔 User ID: ${newAuthUser.id}`);
    console.log(`   📧 Email: ${newAuthUser.email}`);

    // Now create profile in custom users table
    console.log('\n📝 Creating user profile in custom users table...');
    const profileData = {
      id: newAuthUser.id, // Use the Supabase Auth user ID
      email: CONFIG.TEST_USER.email,
      name: CONFIG.TEST_USER.name,
      user_type: CONFIG.TEST_USER.user_type,
      is_verified: CONFIG.TEST_USER.is_verified,
      phone_verified: CONFIG.TEST_USER.phone_verified,
      company_name: CONFIG.TEST_USER.company_name,
      industry: CONFIG.TEST_USER.industry,
      experience: CONFIG.TEST_USER.experience,
      bio: CONFIG.TEST_USER.bio,
      location: CONFIG.TEST_USER.location,
      website: CONFIG.TEST_USER.website,
      social_links: CONFIG.TEST_USER.social_links
    };

    const createProfileUrl = `${config.supabaseUrl}/rest/v1/users`;
    const newProfile = await makeRequest(createProfileUrl, config.supabaseServiceKey, 'POST', profileData);

    if (newProfile && newProfile.length > 0) {
      console.log('✅ User profile created successfully!');
      return newProfile[0].id;
    } else {
      console.error('❌ Failed to create user profile');
      return null;
    }

  } catch (error) {
    console.error('❌ Error creating new auth user:', error.message);
    return null;
  }
}

/**
 * Verify user creation by checking both auth and profile
 * @param {string} userId - User ID to verify
 * @param {Object} config - Configuration object
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function verifyUserCreation(userId, config) {
  try {
    // Verify profile exists in custom users table
    const profileCheckUrl = `${config.supabaseUrl}/rest/v1/users?id=eq.${userId}&select=id,email,name,user_type`;
    const profile = await makeRequest(profileCheckUrl, config.supabaseServiceKey, 'GET');

    if (!profile || profile.length === 0) {
      return {
        success: false,
        error: 'User profile not found in custom users table'
      };
    }

    console.log('✅ User verification successful:');
    console.log(`   📧 Email: ${profile[0].email}`);
    console.log(`   👤 Name: ${profile[0].name}`);
    console.log(`   🏷️  Type: ${profile[0].user_type}`);

    return { success: true };

  } catch (error) {
    return {
      success: false,
      error: `Verification failed: ${error.message}`
    };
  }
}

/**
 * Make HTTP request to Supabase API
 * @param {string} url - Request URL
 * @param {string} apiKey - API key for authentication
 * @param {string} method - HTTP method (GET, POST, PUT, PATCH)
 * @param {Object|null} data - Request body data
 * @returns {Promise<Object>} Response data
 */
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
console.log('Starting test user creation...\n');
createTestUser().then((userId) => {
  if (userId) {
    console.log('✅ Script completed successfully');
    process.exit(0);
  } else {
    console.log('❌ Script completed with errors');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
