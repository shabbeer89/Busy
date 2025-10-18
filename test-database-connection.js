#!/usr/bin/env node

/**
 * Simple database connection test script
 * Tests if we can connect to Supabase and if the tenants table exists
 * 
 * npm install dotenv
 *  node test-database-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase configuration');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local file');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');

  try {
    // Test 1: Simple connection test
    const { data: connectionTest, error: connectionError } = await supabase
      .from('tenants')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ Connection test failed:', connectionError.message);
      console.error('Error code:', connectionError.code);
      console.error('Error details:', connectionError.details);

      if (connectionError.message?.includes('relation "tenants" does not exist')) {
        console.error('\n💡 The "tenants" table does not exist in your Supabase database');
        console.error('Please ensure you ran the complete-fixed-schema.sql in your Supabase SQL Editor');
      } else if (connectionError.code === '42501') {
        console.error('\n💡 Permission denied - this might be an RLS policy issue');
        console.error('The schema might have been applied but RLS policies are blocking access');
      }
      return false;
    }

    console.log('✅ Connection test successful');

    // Test 2: Check if we can actually read data
    const { data: tenants, error: readError } = await supabase
      .from('tenants')
      .select('*')
      .limit(5);

    if (readError) {
      console.error('❌ Read test failed:', readError.message);
      return false;
    }

    console.log('✅ Read test successful');
    console.log(`📊 Found ${tenants?.length || 0} tenants in database`);

    if (tenants && tenants.length > 0) {
      console.log('\n🏢 Sample tenants:');
      tenants.forEach((tenant, index) => {
        console.log(`  ${index + 1}. ${tenant.name} (${tenant.slug}) - ${tenant.status}`);
      });
    }

    return true;

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    return false;
  }
}

// Run the test
testConnection().then((success) => {
  if (success) {
    console.log('\n🎉 Database connection test PASSED!');
    console.log('Your Supabase database is properly configured.');
  } else {
    console.log('\n❌ Database connection test FAILED!');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Verify your Supabase project is active');
    console.log('2. Check if you ran the complete-fixed-schema.sql in Supabase SQL Editor');
    console.log('3. Ensure the schema was applied without errors');
    console.log('4. Verify your environment variables are correct');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Test script error:', error);
  process.exit(1);
});