#!/usr/bin/env node

// ============================================================================
// Strategic Partnership Platform - Database Connection Test Script
// ============================================================================
//
// DESCRIPTION:
//   Tests database connectivity and validates that the core schema is properly
//   set up in your Supabase project.
//
// FEATURES:
//   - Validates environment configuration
//   - Tests basic database connectivity
//   - Verifies core tables exist and are accessible
//   - Provides detailed error reporting and troubleshooting
//   - Checks sample data presence
//
// USAGE:
//   node test-database-connection.js
//
// OUTPUT:
//   - Connection test results
//   - Schema validation status
//   - Sample data verification
//   - Detailed error messages and troubleshooting steps
//
// REQUIREMENTS:
//   - Node.js 16+
//   - Environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   - Proper Supabase project configuration
//
// EXIT CODES:
//   - 0: All tests passed
//   - 1: Configuration or connection errors
//
// ============================================================================

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

/**
 * Main database connection test function with comprehensive validation
 * @returns {Promise<{success: boolean, error?: string, details?: Object}>}
 */
async function testConnection() {
  const startTime = Date.now();
  console.log('🚀 Strategic Partnership Platform - Database Connection Test');
  console.log('=' .repeat(65));

  try {
    // Phase 1: Environment validation
    console.log('\n🔧 Phase 1: Validating configuration...');
    const configValidation = validateEnvironment();

    if (!configValidation.isValid) {
      console.error('❌ Configuration validation failed');
      configValidation.errors.forEach(error => console.error(`   ${error}`));
      return {
        success: false,
        error: 'Configuration validation failed',
        details: { phase: 'configuration' }
      };
    }

    console.log('✅ Configuration validation passed');

    // Phase 2: Basic connectivity test
    console.log('\n🔍 Phase 2: Testing database connectivity...');

    const connectivityResult = await testBasicConnectivity();
    if (!connectivityResult.success) {
      return {
        success: false,
        error: connectivityResult.error,
        details: { phase: 'connectivity', ...connectivityResult }
      };
    }

    console.log('✅ Database connectivity verified');

    // Phase 3: Schema validation
    console.log('\n📋 Phase 3: Validating database schema...');

    const schemaResult = await validateDatabaseSchema();
    if (!schemaResult.success) {
      return {
        success: false,
        error: schemaResult.error,
        details: { phase: 'schema', ...schemaResult }
      };
    }

    console.log('✅ Database schema validation passed');

    // Phase 4: Data accessibility test
    console.log('\n📊 Phase 4: Testing data accessibility...');

    const dataResult = await testDataAccessibility();
    if (!dataResult.success) {
      console.log('⚠️  Data accessibility test failed, but this may be expected for new installations');
      console.log(`   Error: ${dataResult.error}`);
    } else {
      console.log('✅ Data accessibility verified');
    }

    // Success summary
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log('\n🎉 SUCCESS! Database connection test completed');
    console.log('=' .repeat(65));
    console.log(`⏱️  Completed in ${duration} seconds`);
    console.log('✅ Your Supabase database is properly configured and accessible');
    console.log('🚀 Ready for Strategic Partnership Platform operations');

    return {
      success: true,
      details: {
        phase: 'completed',
        duration,
        connectivity: connectivityResult,
        schema: schemaResult,
        data: dataResult
      }
    };

  } catch (error) {
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.error(`\n❌ CRITICAL ERROR after ${duration} seconds:`, error.message);
    console.error('Stack trace:', error.stack);

    return {
      success: false,
      error: error.message,
      details: { phase: 'unexpected', duration }
    };
  }
}

/**
 * Validate environment configuration
 * @returns {{isValid: boolean, errors: string[]}}
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

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Test basic database connectivity
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function testBasicConnectivity() {
  try {
    const { data: connectionTest, error: connectionError } = await supabase
      .from('tenants')
      .select('count')
      .limit(1);

    if (connectionError) {
      // Expected error for new installations
      if (connectionError.message?.includes('relation "tenants" does not exist')) {
        console.log('ℹ️  Tables do not exist yet - this is expected for new setups');
        return { success: true };
      }

      // RLS policy error
      if (connectionError.code === '42501') {
        return {
          success: false,
          error: 'Permission denied - RLS policy issue detected'
        };
      }

      // Other connection errors
      return {
        success: false,
        error: `Connection failed: ${connectionError.message} (Code: ${connectionError.code})`
      };
    }

    console.log('✅ Basic connectivity test passed');
    return { success: true };

  } catch (error) {
    return {
      success: false,
      error: `Unexpected connectivity error: ${error.message}`
    };
  }
}

/**
 * Validate that core database tables exist
 * @returns {Promise<{success: boolean, error?: string, tables?: string[]}>}
 */
async function validateDatabaseSchema() {
  const coreTables = ['tenants', 'users', 'ideas', 'matches', 'offers'];

  try {
    for (const table of coreTables) {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      if (error) {
        if (error.message?.includes('relation "') && error.message?.includes('" does not exist')) {
          return {
            success: false,
            error: `Core table '${table}' does not exist. Please run the database schema setup.`,
            tables: coreTables
          };
        }

        return {
          success: false,
          error: `Schema validation failed for '${table}': ${error.message}`,
          tables: coreTables
        };
      }

      console.log(`✅ Verified table: ${table}`);
    }

    return {
      success: true,
      tables: coreTables
    };

  } catch (error) {
    return {
      success: false,
      error: `Schema validation error: ${error.message}`,
      tables: coreTables
    };
  }
}

/**
 * Test data accessibility and show sample data if available
 * @returns {Promise<{success: boolean, error?: string, dataCount?: number}>}
 */
async function testDataAccessibility() {
  try {
    const { data: tenants, error: readError } = await supabase
      .from('tenants')
      .select('*')
      .limit(5);

    if (readError) {
      return {
        success: false,
        error: `Data read test failed: ${readError.message}`
      };
    }

    console.log('✅ Data accessibility test passed');
    console.log(`📊 Found ${tenants?.length || 0} tenants in database`);

    if (tenants && tenants.length > 0) {
      console.log('\n🏢 Sample tenant data:');
      tenants.forEach((tenant, index) => {
        console.log(`  ${index + 1}. ${tenant.name} (${tenant.slug}) - ${tenant.status}`);
      });
    } else {
      console.log('ℹ️  No tenant data found - this is normal for new installations');
    }

    return {
      success: true,
      dataCount: tenants?.length || 0
    };

  } catch (error) {
    return {
      success: false,
      error: `Data accessibility test error: ${error.message}`
    };
  }
}

// Run the enhanced test
console.log('\n🔧 Starting comprehensive database connection test...\n');

testConnection().then((result) => {
  if (result.success) {
    console.log('\n✅ Database connection test PASSED!');
    console.log('🎯 Your Supabase database is ready for the Strategic Partnership Platform');
    process.exit(0);
  } else {
    console.log('\n❌ Database connection test FAILED!');
    console.log(`🚨 Error: ${result.error}`);

    if (result.details?.phase) {
      console.log(`📍 Failed at phase: ${result.details.phase}`);
    }

    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. 📋 Verify your Supabase project is active and accessible');
    console.log('2. 🔑 Check that your service role key has the necessary permissions');
    console.log('3. 💾 Ensure you ran the complete-fixed-schema.sql in Supabase SQL Editor');
    console.log('4. 🌐 Verify your internet connection and Supabase service status');
    console.log('5. 📁 Double-check your .env.local file configuration');

    if (result.details?.phase === 'schema') {
      console.log('\n💡 Schema-specific troubleshooting:');
      console.log('   - Open your Supabase Dashboard');
      console.log('   - Go to SQL Editor');
      console.log('   - Run the complete-fixed-schema.sql file');
      console.log('   - Wait for all statements to complete');
      console.log('   - Re-run this test');
    }

    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Unexpected test script error:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
});