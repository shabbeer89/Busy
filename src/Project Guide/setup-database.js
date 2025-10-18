#!/usr/bin/env node

/**
 * Database Setup Script for Strategic Partnership Platform
 *
 * This script applies the complete-fixed-schema.sql to your Supabase database
 * and optionally loads the sample data.
 *
 * Features:
 * - Validates environment configuration
 * - Tests database connectivity before applying schema
 * - Applies complete database schema with error handling
 * - Provides detailed logging and progress indicators
 * - Includes manual fallback instructions if automation fails
 * - Verifies setup completion
 *
 * Usage:
 *   node setup-database.js                    # Setup database schema only
 *   node setup-database.js --with-sample-data # Setup with sample data (not implemented yet)
 *
 * Requirements:
 * - Node.js 16+
 * - Environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * - complete-fixed-schema.sql file in the same directory
 *
 * Exit codes:
 * - 0: Success
 * - 1: Configuration or execution error
 */

require('dotenv').config({path: '.env.local'});
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Enhanced environment validation with detailed error messages
function validateEnvironment() {
  const requiredVars = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', description: 'Supabase project URL' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Service role key for admin operations' }
  ];

  const missing = requiredVars.filter(({ key }) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(({ key, description }) => {
      console.error(`   - ${key}: ${description}`);
    });
    console.error('\n🔧 Setup required:');
    console.error('1. Create a .env.local file in your project root');
    console.error('2. Add your Supabase project URL and service role key');
    console.error('3. Example format:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
    console.error('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
    process.exit(1);
  }

  // Validate URL format
  try {
    new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
  } catch (error) {
    console.error('❌ Invalid NEXT_PUBLIC_SUPABASE_URL format');
    console.error('Expected: https://your-project.supabase.co');
    process.exit(1);
  }
}

// Initialize Supabase client with service role key (bypasses RLS)
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
 * Execute SQL file with enhanced error handling and progress tracking
 * @param {string} filePath - Path to the SQL file to execute
 * @returns {Promise<boolean>} - Success status
 */
async function executeSQLFile(filePath) {
  console.log(`\n📄 Reading SQL file: ${path.basename(filePath)}`);

  let sqlContent;
  try {
    sqlContent = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Failed to read SQL file: ${error.message}`);
    console.error('💡 Please ensure the file exists and is readable');
    return false;
  }

  if (!sqlContent.trim()) {
    console.error('❌ SQL file is empty');
    return false;
  }

  // Enhanced SQL statement splitting with better comment and whitespace handling
  const statements = sqlContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== '')
    .map(stmt => {
      // Clean up multi-line statements and remove extra whitespace
      return stmt.replace(/\s+/g, ' ').trim();
    });

  console.log(`🔄 Executing ${statements.length} SQL statements...`);
  console.log('📋 Statement types:', [...new Set(statements.map(s => s.split(' ')[0]?.toUpperCase()))]);

  const results = {
    successful: 0,
    failed: 0,
    skipped: 0
  };

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement) {
      results.skipped++;
      continue;
    }

    const statementType = statement.split(' ')[0]?.toUpperCase() || 'UNKNOWN';
    console.log(`⚡ [${i + 1}/${statements.length}] Executing ${statementType} statement...`);

    try {
      // Execute the SQL statement using RPC call
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: statement + ';'
      });

      if (error) {
        // Handle different types of errors
        if (error.message?.includes('function exec_sql')) {
          console.log('⚠️  RPC function not available - this is expected for standard Supabase setups');
          console.log('💡 Automated SQL execution is not available in your Supabase project');
          console.log('🔧 Please run the SQL file manually in your Supabase SQL Editor');
          console.log('\n📋 Manual Setup Instructions:');
          console.log('=' .repeat(60));
          console.log('1. Open your Supabase Dashboard');
          console.log('2. Go to SQL Editor');
          console.log('3. Copy and paste the contents of:');
          console.log(`   📁 ${path.relative(process.cwd(), filePath)}`);
          console.log('4. Click "Run" to execute the SQL');
          console.log('5. Wait for all statements to complete');
          console.log('6. Return here and run this script again for verification');
          console.log('=' .repeat(60));
          return false;
        }

        // Handle other specific errors
        if (error.code === '42501') {
          console.error(`❌ Permission denied on statement ${i + 1}`);
          console.error('💡 This usually indicates an RLS policy issue');
        } else if (error.code === '42P01') {
          console.error(`❌ Table does not exist in statement ${i + 1}`);
          console.error('💡 Make sure to run statements in the correct order');
        } else {
          console.error(`❌ Database error on statement ${i + 1}: ${error.message}`);
        }

        results.failed++;
        console.error('💡 You may need to run this SQL manually in your Supabase SQL Editor');
        return false;
      }

      results.successful++;
      console.log(`✅ Statement ${i + 1} executed successfully (${statementType})`);

      // Add small delay between statements to avoid overwhelming the database
      if (i < statements.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

    } catch (error) {
      console.error(`❌ Unexpected error executing statement ${i + 1}:`, error.message);
      console.error('Stack:', error.stack);
      results.failed++;
      console.error('💡 You may need to run this SQL manually in your Supabase SQL Editor');
      return false;
    }
  }

  console.log(`\n📊 Execution Summary:`);
  console.log(`✅ Successful: ${results.successful}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);

  return results.failed === 0;
}

/**
 * Main database setup function with comprehensive error handling and progress tracking
 * @returns {Promise<void>}
 */
async function setupDatabase() {
  const startTime = Date.now();
  console.log('🚀 Starting Strategic Partnership Platform database setup...\n');

  try {
    // Phase 1: Pre-setup validation
    console.log('🔧 Phase 1: Pre-setup validation');
    await validateEnvironment();

    // Test database connection first
    console.log('\n🔍 Phase 2: Testing database connectivity...');
    const connectionResult = await testDatabaseConnection();

    if (!connectionResult.success) {
      console.error('❌ Database connection test failed');
      if (connectionResult.error) {
        console.error('Error details:', connectionResult.error);
      }
      console.log('\n🔧 Troubleshooting steps:');
      console.log('1. Verify your Supabase project URL and service role key');
      console.log('2. Ensure your Supabase project is active and accessible');
      console.log('3. Check your internet connection');
      console.log('4. Verify the service role key has the necessary permissions');
      return;
    }

    console.log('✅ Database connectivity verified');

    // Phase 3: Schema application
    console.log('\n📄 Phase 3: Applying database schema...');
    const schemaPath = path.join(__dirname, 'complete-fixed-schema.sql');

    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ Schema file not found: ${schemaPath}`);
      console.error('\n🔧 Please ensure the complete-fixed-schema.sql file exists in the Project Guide directory');
      return;
    }

    console.log(`📁 Found schema file: ${path.relative(process.cwd(), schemaPath)}`);
    const schemaApplied = await executeSQLFile(schemaPath);

    if (!schemaApplied) {
      console.log('\n📋 MANUAL SETUP REQUIRED');
      console.log('=' .repeat(60));
      console.log('❌ Automated schema application failed or is not available');
      console.log('🔧 Please complete the setup manually:');
      console.log('');
      console.log('1. 📂 Open your Supabase Dashboard');
      console.log('2. 🗃️  Navigate to SQL Editor');
      console.log('3. 📋 Copy and paste the contents of:');
      console.log(`   ${path.relative(process.cwd(), schemaPath)}`);
      console.log('4. ▶️  Click "Run" to execute the SQL');
      console.log('5. ⏳ Wait for all statements to complete successfully');
      console.log('6. 🔄 Return here and run this script again for verification');
      console.log('');
      console.log('💡 Tip: Execute statements in smaller batches if you encounter timeouts');
      console.log('=' .repeat(60));
      return;
    }

    console.log('✅ Database schema applied successfully!');

    // Phase 4: Post-setup verification
    console.log('\n🔍 Phase 4: Verifying setup completion...');
    const verificationResult = await verifyDatabaseSetup();

    if (!verificationResult.success) {
      console.error('❌ Setup verification failed');
      if (verificationResult.error) {
        console.error('Error details:', verificationResult.error);
      }
      console.log('\n🔧 The schema may have been applied but verification failed');
      console.log('💡 Try running this script again or check your Supabase dashboard');
      return;
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n🎉 Database setup completed successfully in ${duration} seconds!`);
    console.log('✅ All core tables and functions are ready');

    // Phase 5: Optional sample data loading
    const withSampleData = process.argv.includes('--with-sample-data');
    if (withSampleData) {
      console.log('\n📊 Phase 5: Sample data loading...');
      await loadSampleData();
    } else {
      console.log('\n💡 Tip: Run with --with-sample-data flag to load sample data');
    }

    console.log('\n🏁 Setup process completed');
    console.log('🚀 Your Strategic Partnership Platform database is ready!');

  } catch (error) {
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.error(`\n❌ Setup failed after ${duration} seconds:`, error.message);
    console.error('Stack trace:', error.stack);
    console.log('\n🔧 Recovery steps:');
    console.log('1. Check the error messages above for specific issues');
    console.log('2. Verify your Supabase configuration');
    console.log('3. Ensure your internet connection is stable');
    console.log('4. Try running the script again');
    console.log('5. If issues persist, check the Supabase dashboard for errors');
  }
}

/**
 * Test database connection with detailed error reporting
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function testDatabaseConnection() {
  try {
    const { data: connectionTest, error: connectionError } = await supabase
      .from('tenants')
      .select('count')
      .limit(1);

    if (connectionError) {
      // This is expected if tables don't exist yet, so we handle it gracefully
      if (connectionError.message?.includes('relation "tenants" does not exist')) {
        console.log('ℹ️  Tables do not exist yet - this is expected for new setups');
        return { success: true };
      }

      return {
        success: false,
        error: `Connection error: ${connectionError.message} (Code: ${connectionError.code})`
      };
    }

    console.log('✅ Database connection successful');
    return { success: true };

  } catch (error) {
    return {
      success: false,
      error: `Unexpected connection error: ${error.message}`
    };
  }
}

/**
 * Verify database setup by checking for essential tables
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function verifyDatabaseSetup() {
  try {
    const essentialTables = ['tenants', 'users', 'ideas', 'matches', 'offers'];

    for (const table of essentialTables) {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      if (error) {
        return {
          success: false,
          error: `Table verification failed for '${table}': ${error.message}`
        };
      }

      console.log(`✅ Verified table: ${table}`);
    }

    console.log('\n📊 Checking sample data...');
    const { data: tenants, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .limit(5);

    if (tenantError) {
      console.log('⚠️  Could not verify tenant data:', tenantError.message);
    } else {
      console.log(`📈 Found ${tenants?.length || 0} tenants in database`);
      if (tenants && tenants.length > 0) {
        console.log('\n🏢 Sample tenants:');
        tenants.forEach((tenant, index) => {
          console.log(`  ${index + 1}. ${tenant.name} (${tenant.slug}) - ${tenant.status}`);
        });
      }
    }

    return { success: true };

  } catch (error) {
    return {
      success: false,
      error: `Verification error: ${error.message}`
    };
  }
}

/**
 * Load sample data (placeholder for future implementation)
 * @returns {Promise<void>}
 */
async function loadSampleData() {
  console.log('📊 Loading sample data...');
  console.log('💡 Sample data loading not fully implemented yet');
  console.log('🔧 You can manually run INSERT statements from test-data-population.sql');
}

// Run the setup
setupDatabase().then(() => {
  console.log('\n🏁 Setup process completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});