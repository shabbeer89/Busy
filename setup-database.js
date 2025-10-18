#!/usr/bin/env node

/**
 * Database Setup Script for Strategic Partnership Platform
 *
 * This script applies the complete-fixed-schema.sql to your Supabase database
 * and optionally loads the sample data.
 *
 * Usage:
 *   node setup-database.js
 *   node setup-database.js --with-sample-data
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase configuration');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local file');
  process.exit(1);
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

async function executeSQLFile(filePath) {
  console.log(`📄 Reading SQL file: ${filePath}`);

  const sqlContent = fs.readFileSync(filePath, 'utf8');

  // Split the SQL into individual statements
  // This is a simplified approach - for production, consider using a proper SQL parser
  const statements = sqlContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== '');

  console.log(`🔄 Executing ${statements.length} SQL statements...`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement) continue;

    try {
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);

      // Execute the SQL statement
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: statement + ';'
      });

      if (error) {
        // If the RPC function doesn't exist, try direct execution
        if (error.message?.includes('function exec_sql')) {
          console.log('⚠️  RPC function not available, this is expected for standard Supabase setups');
          console.log('💡 Please run the SQL file manually in your Supabase SQL Editor');
          return false;
        }
        throw error;
      }

      console.log(`✅ Statement ${i + 1} executed successfully`);
    } catch (error) {
      console.error(`❌ Error executing statement ${i + 1}:`, error.message);
      console.error('💡 You may need to run this SQL manually in your Supabase SQL Editor');
      return false;
    }
  }

  return true;
}

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  try {
    // Test database connection first
    console.log('🔍 Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('tenants')
      .select('count')
      .limit(1);

    if (connectionError && !connectionError.message?.includes('relation "tenants" does not exist')) {
      console.error('❌ Database connection failed:', connectionError.message);
      console.log('\n💡 Please check your Supabase configuration and ensure the database is accessible.');
      return;
    }

    console.log('✅ Database connection successful');

    // Apply the schema
    const schemaPath = path.join(__dirname, 'complete-fixed-schema.sql');

    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ Schema file not found: ${schemaPath}`);
      return;
    }

    const schemaApplied = await executeSQLFile(schemaPath);

    if (!schemaApplied) {
      console.log('\n📋 MANUAL SETUP REQUIRED');
      console.log('=' .repeat(50));
      console.log('Since automatic SQL execution is not available, please:');
      console.log('1. Open your Supabase Dashboard');
      console.log('2. Go to SQL Editor');
      console.log('3. Copy and paste the contents of complete-fixed-schema.sql');
      console.log('4. Run the SQL script');
      console.log('5. Come back and run this script again to verify');
      console.log('=' .repeat(50));
      return;
    }

    console.log('✅ Schema applied successfully!');

    // Verify setup
    console.log('\n🔍 Verifying setup...');
    const { data: tenants, error: verifyError } = await supabase
      .from('tenants')
      .select('*')
      .limit(5);

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
      return;
    }

    console.log(`✅ Found ${tenants?.length || 0} tenants in database`);
    console.log('🎉 Database setup completed successfully!');

    // Optionally load sample data
    const withSampleData = process.argv.includes('--with-sample-data');
    if (withSampleData) {
      console.log('\n📊 Loading sample data...');
      // Note: You'll need to provide the sample data SQL file path
      console.log('💡 Sample data loading not implemented yet - please run the INSERT statements manually');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n💡 Please check your Supabase configuration and try again.');
  }
}

// Run the setup
setupDatabase().then(() => {
  console.log('\n🏁 Setup process completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});