#!/usr/bin/env node

// ============================================================================
// Strategic Partnership Platform - Comprehensive Test Data Generator
// ============================================================================
//
// DESCRIPTION:
//   Creates complete test ecosystem for multi-tenant platform
//
// FEATURES:
//   - 1 Super Admin with full platform access
//   - 4 Indian regional tenants (North, South, East, West India)
//   - 4 tenant admins (one per region)
//   - 5 creators and 5 investors per tenant (20 each total)
//   - 30 business ideas per tenant (120 total)
//   - 30 investment offers per tenant (120 total)
//   - 10 matches per tenant (40 total)
//   - 10 messages per tenant (40 total)
//   - Unique dashboard and analytics data per user
//
// ============================================================================

const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

// Configuration constants
const CONFIG = {
  // Super Admin configuration
  SUPER_ADMIN: {
    email: 'superadmin@platform.com',
    password: 'SuperAdmin123!',
    name: 'Platform Super Admin',
    user_type: 'super_admin',
    role_level: 'super_admin',
    is_verified: true,
    phone_verified: true,
    bio: 'Platform Super Administrator with full system access across all tenants.',
    location: 'Mumbai, India',
    permissions: [
      'manage_tenants',
      'manage_users',
      'view_analytics',
      'manage_security',
      'manage_configurations',
      'view_audit_logs'
    ]
  },

  // Indian regions configuration
  REGIONS: [
    {
      name: 'North India Operations',
      slug: 'north-india',
      primary_color: '#FF6B6B',
      secondary_color: '#4ECDC4',
      settings: {
        max_users: 1000,
        max_projects: 500,
        features: {
          ai_recommendations: true,
          advanced_analytics: true,
          custom_branding: true,
          api_access: true
        }
      },
      locations: ['Delhi', 'Noida', 'Gurgaon', 'Chandigarh', 'Jaipur']
    },
    {
      name: 'South India Operations',
      slug: 'south-india',
      primary_color: '#45B7D1',
      secondary_color: '#96CEB4',
      settings: {
        max_users: 1000,
        max_projects: 500,
        features: {
          ai_recommendations: true,
          advanced_analytics: true,
          custom_branding: true,
          api_access: true
        }
      },
      locations: ['Bangalore', 'Chennai', 'Hyderabad', 'Kochi', 'Coimbatore']
    },
    {
      name: 'East India Operations',
      slug: 'east-india',
      primary_color: '#FFA07A',
      secondary_color: '#98D8C8',
      settings: {
        max_users: 1000,
        max_projects: 500,
        features: {
          ai_recommendations: true,
          advanced_analytics: true,
          custom_branding: true,
          api_access: true
        }
      },
      locations: ['Kolkata', 'Bhubaneswar', 'Patna', 'Guwahati', 'Ranchi']
    },
    {
      name: 'West India Operations',
      slug: 'west-india',
      primary_color: '#F7DC6F',
      secondary_color: '#BB8FCE',
      settings: {
        max_users: 1000,
        max_projects: 500,
        features: {
          ai_recommendations: true,
          advanced_analytics: true,
          custom_branding: true,
          api_access: true
        }
      },
      locations: ['Mumbai', 'Pune', 'Ahmedabad', 'Surat', 'Vadodara']
    }
  ],

  // Business categories for diversity
  BUSINESS_CATEGORIES: [
    'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
    'Clean Energy', 'Agriculture', 'Real Estate', 'Transportation', 'Food & Beverage',
    'Manufacturing', 'Retail', 'Media & Entertainment', 'Telecommunications', 'Biotechnology'
  ],

  // Investment ranges for offers
  INVESTMENT_RANGES: [
    { min: 50000, max: 200000, equity: { min: 5, max: 15 } },
    { min: 200000, max: 500000, equity: { min: 10, max: 25 } },
    { min: 500000, max: 1000000, equity: { min: 15, max: 30 } },
    { min: 1000000, max: 5000000, equity: { min: 20, max: 40 } }
  ],

  // Project stages
  PROJECT_STAGES: ['concept', 'mvp', 'early', 'growth'],

  RETRY_ATTEMPTS: 3,
  REQUEST_TIMEOUT: 30000,
  BATCH_SIZE: 5
};

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
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          process.env[key] = value;
        }
      });

      console.log(`✅ Loaded environment from: ${envPath}`);
      return true;
    } else {
      console.log('ℹ️  No .env.local file found');
      return false;
    }
  } catch (error) {
    console.warn('⚠️ Could not load .env.local file:', error.message);
    return false;
  }
}

/**
 * Validate required environment variables and configuration
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
    errors.push('Please ensure your .env.local file contains:');
    errors.push('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
    errors.push('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  }

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
    errors,
    config: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  };
}

/**
 * Generate random data helpers
 */
const DataGenerator = {
  randomChoice: (array) => array[Math.floor(Math.random() * array.length)],

  randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

  randomDecimal: (min, max, decimals = 2) => {
    const value = Math.random() * (max - min) + min;
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  randomLocation: (locations) => DataGenerator.randomChoice(locations),

  randomCategory: () => DataGenerator.randomChoice(CONFIG.BUSINESS_CATEGORIES),

  randomStage: () => DataGenerator.randomChoice(CONFIG.PROJECT_STAGES),

  randomInvestmentRange: () => DataGenerator.randomChoice(CONFIG.INVESTMENT_RANGES),

  generateBusinessIdea: (creatorId, tenantId) => ({
    creator_id: creatorId,
    title: `Innovative ${DataGenerator.randomCategory()} Solution`,
    description: `A cutting-edge ${DataGenerator.randomCategory().toLowerCase()} platform that revolutionizes how businesses operate in the digital age. This innovative solution addresses key market gaps and provides scalable technology for modern enterprises.`,
    category: DataGenerator.randomCategory(),
    tags: [DataGenerator.randomCategory(), 'Innovation', 'Scalable', 'Digital'],
    funding_goal: DataGenerator.randomInt(100000, 2000000),
    current_funding: DataGenerator.randomInt(10000, 500000),
    equity_offered: DataGenerator.randomDecimal(5, 30, 2),
    valuation: DataGenerator.randomInt(500000, 10000000),
    stage: DataGenerator.randomStage(),
    timeline: `${DataGenerator.randomInt(6, 24)} months`,
    team_size: DataGenerator.randomInt(2, 50),
    status: 'published'
  }),

  generateInvestmentOffer: (investorId, tenantId) => {
    const range = DataGenerator.randomInvestmentRange();
    return {
      investor_id: investorId,
      tenant_id: tenantId,
      title: `Strategic Investment Opportunity - ${DataGenerator.randomCategory()}`,
      description: `Looking to invest in promising ${DataGenerator.randomCategory().toLowerCase()} startups with strong growth potential and innovative solutions.`,
      amount_range: {
        min: range.min,
        max: range.max
      },
      preferred_equity: {
        min: range.equity.min,
        max: range.equity.max
      },
      preferred_stages: ['concept', 'mvp', 'early'],
      preferred_industries: [DataGenerator.randomCategory(), DataGenerator.randomCategory()],
      investment_type: 'equity',
      is_active: true
    };
  },

  generateUser: (type, region, index, tenantId) => {
    const baseNames = {
      creator: ['Arjun', 'Priya', 'Ravi', 'Sneha', 'Vikram', 'Ananya', 'Rohit', 'Kavita', 'Suresh', 'Meera'],
      investor: ['Rajesh', 'Sunita', 'Amit', 'Deepika', 'Manoj', 'Swati', 'Vijay', 'Rekha', 'Sanjay', 'Pooja']
    };

    const companies = {
      creator: ['Tech Solutions Pvt Ltd', 'Innovation Labs', 'Digital Dynamics', 'NextGen Systems', 'Smart Ventures'],
      investor: ['Capital Partners', 'Investment Group', 'Ventures Ltd', 'Equity Partners', 'Growth Fund']
    };

    const name = DataGenerator.randomChoice(baseNames[type]);
    const company = `${name} ${DataGenerator.randomChoice(companies[type])}`;
    const location = DataGenerator.randomLocation(region.locations);

    return {
      email: `${type}${index}.${region.slug}@example.com`,
      password: 'TestUser123!',
      name: name,
      user_type: type,
      company_name: company,
      industry: DataGenerator.randomCategory(),
      experience: `${DataGenerator.randomInt(3, 15)}+ years`,
      bio: `Experienced ${type} with a passion for innovative ${DataGenerator.randomCategory().toLowerCase()} solutions. Based in ${location}, driving growth in the ${region.name} region.`,
      location: location,
      website: `https://${company.toLowerCase().replace(/\s+/g, '')}.example.com`,
      is_verified: true,
      phone_verified: true,
      tenant_id: tenantId
    };
  }
};

/**
 * Main function to create comprehensive test data
 */
async function createComprehensiveTestData() {
  const startTime = Date.now();

  try {
    console.log('🚀 Strategic Partnership Platform - Comprehensive Test Data Generation');
    console.log('=' .repeat(80));

    console.log('\n🔧 Phase 1: Loading configuration...');

    // Load environment variables
    const envLoaded = loadEnvFile();
    if (!envLoaded) {
      console.log('⚠️  Continuing with system environment variables...');
    }

    // Enhanced environment validation
    const validation = validateEnvironment();
    if (!validation.isValid) {
      console.error('❌ Environment validation failed');
      validation.errors.forEach(error => console.error(`   ${error}`));
      return;
    }

    const config = validation.config;
    console.log('✅ Configuration loaded successfully');
    console.log(`📊 Planning to create:`);
    console.log(`   • 1 Super Admin`);
    console.log(`   • 4 Regional Tenants`);
    console.log(`   • 4 Tenant Admins`);
    console.log(`   • 20 Creators (5 per tenant)`);
    console.log(`   • 20 Investors (5 per tenant)`);
    console.log(`   • 120 Business Ideas (30 per tenant)`);
    console.log(`   • 120 Investment Offers (30 per tenant)`);
    console.log(`   • 40 Matches (10 per tenant)`);
    console.log(`   • 40 Message threads (10 per tenant)`);

    // Phase 2: Create Super Admin
    console.log('\n👑 Phase 2: Creating Super Admin...');
    const superAdminResult = await createSuperAdmin(config);

    if (!superAdminResult.success) {
      console.error('❌ Failed to create Super Admin:', superAdminResult.error);
      return;
    }

    console.log('✅ Super Admin created successfully');

    // Phase 3: Create Regional Tenants
    console.log('\n🏢 Phase 3: Creating Regional Tenants...');
    const tenantsResult = await createRegionalTenants(config);

    if (!tenantsResult.success) {
      console.error('❌ Failed to create tenants:', tenantsResult.error);
      return;
    }

    console.log(`✅ Created ${tenantsResult.tenants.length} regional tenants`);

    // Phase 4: Create Tenant Admins
    console.log('\n👨‍💼 Phase 4: Creating Tenant Admins...');
    const adminsResult = await createTenantAdmins(tenantsResult.tenants, config);

    if (!adminsResult.success) {
      console.error('❌ Failed to create tenant admins:', adminsResult.error);
      return;
    }

    console.log(`✅ Created ${adminsResult.admins.length} tenant admins`);

    // Phase 5: Create Creators and Investors
    console.log('\n👥 Phase 5: Creating Creators and Investors...');
    const usersResult = await createUsersForTenants(tenantsResult.tenants, config);

    if (!usersResult.success) {
      console.error('❌ Failed to create users:', usersResult.error);
      return;
    }

    console.log(`✅ Created ${usersResult.creators.length} creators and ${usersResult.investors.length} investors`);

    // Phase 6: Create Business Ideas and Investment Offers
    console.log('\n💡 Phase 6: Creating Business Ideas and Investment Offers...');
    const contentResult = await createBusinessContent(tenantsResult.tenants, usersResult.creators, usersResult.investors, config);

    if (!contentResult.success) {
      console.error('❌ Failed to create business content:', contentResult.error);
      return;
    }

    console.log(`✅ Created ${contentResult.ideas.length} business ideas and ${contentResult.offers.length} investment offers`);

    // Phase 7: Create Matches and Messages
    console.log('\n🤝 Phase 7: Creating Matches and Messages...');
    const interactionsResult = await createInteractions(tenantsResult.tenants, contentResult.ideas, contentResult.offers, usersResult.creators, usersResult.investors, config);

    if (!interactionsResult.success) {
      console.error('❌ Failed to create interactions:', interactionsResult.error);
      return;
    }

    console.log(`✅ Created ${interactionsResult.matches.length} matches and ${interactionsResult.messages.length} message threads`);

    // Final Summary
    console.log('\n📊 Generation Summary');
    console.log('=' .repeat(60));
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`⏱️  Completed in ${duration} seconds`);

    console.log('\n🔑 Super Admin Credentials:');
    console.log(`   Email: ${CONFIG.SUPER_ADMIN.email}`);
    console.log(`   Password: ${CONFIG.SUPER_ADMIN.password}`);

    console.log('\n👨‍💼 Tenant Admin Credentials:');
    adminsResult.admins.forEach(admin => {
      console.log(`   ${admin.name}: ${admin.email} / ${admin.password}`);
    });

    console.log('\n🏢 Regional Tenants Created:');
    tenantsResult.tenants.forEach(tenant => {
      console.log(`   ${tenant.name} (${tenant.slug}) - Admin: admin.${tenant.slug}@platform.com`);
    });

    console.log('\n📈 Data Generation Summary:');
    console.log(`   • ${usersResult.creators.length} Creators`);
    console.log(`   • ${usersResult.investors.length} Investors`);
    console.log(`   • ${contentResult.ideas.length} Business Ideas`);
    console.log(`   • ${contentResult.offers.length} Investment Offers`);
    console.log(`   • ${interactionsResult.matches.length} Matches`);
    console.log(`   • ${interactionsResult.messages.length} Message Threads`);

    console.log('\n🎯 Sample Creator Credentials (use password: TestUser123!):');
    usersResult.creators.slice(0, 3).forEach(creator => {
      console.log(`   ${creator.name}: ${creator.email}`);
    });

    console.log('\n💰 Sample Investor Credentials (use password: TestUser123!):');
    usersResult.investors.slice(0, 3).forEach(investor => {
      console.log(`   ${investor.name}: ${investor.email}`);
    });

    console.log('\n🎉 Comprehensive test data generation completed!');
    console.log('🚀 All users are ready for testing and development');

    return {
      success: true,
      summary: {
        superAdmin: superAdminResult,
        tenants: tenantsResult.tenants,
        admins: adminsResult.admins,
        creators: usersResult.creators,
        investors: usersResult.investors,
        ideas: contentResult.ideas,
        offers: contentResult.offers,
        matches: interactionsResult.matches,
        messages: interactionsResult.messages
      }
    };

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

/**
 * Create Super Admin user
 */
async function createSuperAdmin(config) {
  try {
    // Check if Super Admin already exists
    const existingUser = await findExistingAuthUser(CONFIG.SUPER_ADMIN.email, config);

    if (existingUser) {
      console.log('   ℹ️  Super Admin already exists, skipping creation');
      return { success: true, user: existingUser };
    }

    // Create auth user
    const authUserData = {
      email: CONFIG.SUPER_ADMIN.email,
      password: CONFIG.SUPER_ADMIN.password,
      email_confirm: true,
      user_metadata: {
        name: CONFIG.SUPER_ADMIN.name
      }
    };

    const newAuthUser = await makeRequest(
      `${config.supabaseUrl}/auth/v1/admin/users`,
      config.supabaseServiceKey,
      'POST',
      authUserData
    );

    if (!newAuthUser || !newAuthUser.id) {
      return { success: false, error: 'Failed to create Super Admin auth user' };
    }

    console.log(`   ✅ Auth user created: ${newAuthUser.id}`);

    // Create user profile
    const profileData = {
      id: newAuthUser.id,
      email: CONFIG.SUPER_ADMIN.email,
      name: CONFIG.SUPER_ADMIN.name,
      user_type: CONFIG.SUPER_ADMIN.user_type,
      role_level: CONFIG.SUPER_ADMIN.role_level,
      is_verified: CONFIG.SUPER_ADMIN.is_verified,
      phone_verified: CONFIG.SUPER_ADMIN.phone_verified,
      bio: CONFIG.SUPER_ADMIN.bio,
      location: CONFIG.SUPER_ADMIN.location,
      permissions: CONFIG.SUPER_ADMIN.permissions
    };

    const profile = await makeRequest(
      `${config.supabaseUrl}/rest/v1/users`,
      config.supabaseServiceKey,
      'POST',
      profileData
    );

    return { success: true, user: newAuthUser };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Create regional tenants
 */
async function createRegionalTenants(config) {
  const createdTenants = [];

  for (const region of CONFIG.REGIONS) {
    try {
      console.log(`   Creating tenant: ${region.name}`);

      const tenantData = {
        name: region.name,
        slug: region.slug,
        status: 'active',
        settings: {
          branding: {
            primary_color: region.primary_color,
            secondary_color: region.secondary_color,
            accent_color: '#28a745'
          },
          features: region.settings.features,
          limits: {
            max_users: region.settings.max_users,
            max_projects: region.settings.max_projects,
            storage_limit: 10737418240
          }
        }
      };

      const newTenant = await makeRequest(
        `${config.supabaseUrl}/rest/v1/tenants`,
        config.supabaseServiceKey,
        'POST',
        tenantData
      );

      if (newTenant && newTenant.length > 0) {
        createdTenants.push({ ...region, id: newTenant[0].id });
        console.log(`   ✅ Created: ${region.name}`);
      } else {
        console.log(`   ❌ Failed to create: ${region.name}`);
      }

      // Small delay between tenant creations
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`   ❌ Error creating ${region.name}:`, error.message);
    }
  }

  return { success: true, tenants: createdTenants };
}

/**
 * Create tenant admins
 */
async function createTenantAdmins(tenants, config) {
  const createdAdmins = [];

  for (const tenant of tenants) {
    try {
      console.log(`   Creating admin for: ${tenant.name}`);

      const adminEmail = `admin.${tenant.slug}@platform.com`;
      const adminData = {
        email: adminEmail,
        password: 'AdminUser123!',
        name: `${tenant.name} Admin`,
        user_type: 'tenant_admin',
        role_level: 'admin',
        is_verified: true,
        phone_verified: true,
        bio: `Tenant Administrator for ${tenant.name}, responsible for managing regional operations and user activities.`,
        location: DataGenerator.randomLocation(tenant.locations),
        managed_tenant_ids: [tenant.id],
        permissions: [
          'manage_users',
          'view_analytics',
          'manage_tenant_settings',
          'view_audit_logs'
        ]
      };

      // Check if admin already exists
      const existingAdmin = await findExistingAuthUser(adminEmail, config);

      let adminUser;
      if (existingAdmin) {
        adminUser = existingAdmin;
        console.log(`   ℹ️  Admin already exists: ${adminEmail}`);
      } else {
        // Create new admin auth user
        const authUserData = {
          email: adminEmail,
          password: adminData.password,
          email_confirm: true,
          user_metadata: {
            name: adminData.name
          }
        };

        const newAuthUser = await makeRequest(
          `${config.supabaseUrl}/auth/v1/admin/users`,
          config.supabaseServiceKey,
          'POST',
          authUserData
        );

        if (!newAuthUser || !newAuthUser.id) {
          console.log(`   ❌ Failed to create admin auth user for ${tenant.name}`);
          continue;
        }

        adminUser = newAuthUser;
      }

      // Create admin profile
      const profileData = {
        id: adminUser.id,
        email: adminEmail,
        name: adminData.name,
        user_type: adminData.user_type,
        role_level: adminData.role_level,
        is_verified: adminData.is_verified,
        phone_verified: adminData.phone_verified,
        bio: adminData.bio,
        location: adminData.location,
        managed_tenant_ids: adminData.managed_tenant_ids,
        permissions: adminData.permissions
      };

      const profile = await makeRequest(
        `${config.supabaseUrl}/rest/v1/users`,
        config.supabaseServiceKey,
        'POST',
        profileData
      );

      if (profile && profile.length > 0) {
        createdAdmins.push({ ...adminData, id: adminUser.id, tenant_id: tenant.id });
        console.log(`   ✅ Created admin: ${adminEmail}`);
      }

      // Small delay between admin creations
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`   ❌ Error creating admin for ${tenant.name}:`, error.message);
    }
  }

  return { success: true, admins: createdAdmins };
}

/**
 * Create creators and investors for each tenant
 */
async function createUsersForTenants(tenants, config) {
  const creators = [];
  const investors = [];

  for (const tenant of tenants) {
    console.log(`   Creating users for: ${tenant.name}`);

    // Create 5 creators per tenant
    for (let i = 1; i <= 5; i++) {
      try {
        const creatorData = DataGenerator.generateUser('creator', tenant, i, tenant.id);

        const existingUser = await findExistingAuthUser(creatorData.email, config);
        let creatorUser;

        if (existingUser) {
          creatorUser = existingUser;
          console.log(`   ℹ️  Creator already exists: ${creatorData.email}`);
        } else {
          // Create auth user
          const authUserData = {
            email: creatorData.email,
            password: creatorData.password,
            email_confirm: true,
            user_metadata: { name: creatorData.name }
          };

          const newAuthUser = await makeRequest(
            `${config.supabaseUrl}/auth/v1/admin/users`,
            config.supabaseServiceKey,
            'POST',
            authUserData
          );

          if (newAuthUser && newAuthUser.id) {
            creatorUser = newAuthUser;
          } else {
            console.log(`   ❌ Failed to create creator: ${creatorData.email}`);
            continue;
          }
        }

        // Create profile
        const profileData = {
          id: creatorUser.id,
          email: creatorData.email,
          name: creatorData.name,
          user_type: creatorData.user_type,
          company_name: creatorData.company_name,
          industry: creatorData.industry,
          experience: creatorData.experience,
          bio: creatorData.bio,
          location: creatorData.location,
          website: creatorData.website,
          is_verified: creatorData.is_verified,
          phone_verified: creatorData.phone_verified,
          tenant_id: creatorData.tenant_id
        };

        const profile = await makeRequest(
          `${config.supabaseUrl}/rest/v1/users`,
          config.supabaseServiceKey,
          'POST',
          profileData
        );

        if (profile && profile.length > 0) {
          creators.push({ ...creatorData, id: creatorUser.id });
        }

        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.log(`   ❌ Error creating creator ${i} for ${tenant.name}:`, error.message);
      }
    }

    // Create 5 investors per tenant
    for (let i = 1; i <= 5; i++) {
      try {
        const investorData = DataGenerator.generateUser('investor', tenant, i, tenant.id);

        const existingUser = await findExistingAuthUser(investorData.email, config);
        let investorUser;

        if (existingUser) {
          investorUser = existingUser;
          console.log(`   ℹ️  Investor already exists: ${investorData.email}`);
        } else {
          // Create auth user
          const authUserData = {
            email: investorData.email,
            password: investorData.password,
            email_confirm: true,
            user_metadata: { name: investorData.name }
          };

          const newAuthUser = await makeRequest(
            `${config.supabaseUrl}/auth/v1/admin/users`,
            config.supabaseServiceKey,
            'POST',
            authUserData
          );

          if (newAuthUser && newAuthUser.id) {
            investorUser = newAuthUser;
          } else {
            console.log(`   ❌ Failed to create investor: ${investorData.email}`);
            continue;
          }
        }

        // Create profile
        const profileData = {
          id: investorUser.id,
          email: investorData.email,
          name: investorData.name,
          user_type: investorData.user_type,
          company_name: investorData.company_name,
          industry: investorData.industry,
          experience: investorData.experience,
          bio: investorData.bio,
          location: investorData.location,
          website: investorData.website,
          is_verified: investorData.is_verified,
          phone_verified: investorData.phone_verified,
          tenant_id: investorData.tenant_id
        };

        const profile = await makeRequest(
          `${config.supabaseUrl}/rest/v1/users`,
          config.supabaseServiceKey,
          'POST',
          profileData
        );

        if (profile && profile.length > 0) {
          investors.push({ ...investorData, id: investorUser.id });
        }

        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.log(`   ❌ Error creating investor ${i} for ${tenant.name}:`, error.message);
      }
    }
  }

  return { success: true, creators, investors };
}

/**
 * Create business ideas and investment offers
 */
async function createBusinessContent(tenants, creators, investors, config) {
  const ideas = [];
  const offers = [];

  for (const tenant of tenants) {
    console.log(`   Creating business content for: ${tenant.name}`);

    // Get creators for this tenant
    const tenantCreators = creators.filter(c => c.tenant_id === tenant.id);

    // Get investors for this tenant
    const tenantInvestors = investors.filter(i => i.tenant_id === tenant.id);

    // Create 30 business ideas (distributed among creators)
    for (let i = 0; i < 30; i++) {
      try {
        const creator = tenantCreators[i % tenantCreators.length];
        if (!creator) continue;

        const ideaData = DataGenerator.generateBusinessIdea(creator.id, tenant.id);

        const newIdea = await makeRequest(
          `${config.supabaseUrl}/rest/v1/business_ideas`,
          config.supabaseServiceKey,
          'POST',
          ideaData
        );

        if (newIdea && newIdea.length > 0) {
          ideas.push({ ...ideaData, id: newIdea[0].id });
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.log(`   ❌ Error creating business idea ${i + 1} for ${tenant.name}:`, error.message);
      }
    }

    // Create 30 investment offers (distributed among investors)
    for (let i = 0; i < 30; i++) {
      try {
        const investor = tenantInvestors[i % tenantInvestors.length];
        if (!investor) continue;

        const offerData = DataGenerator.generateInvestmentOffer(investor.id, tenant.id);

        const newOffer = await makeRequest(
          `${config.supabaseUrl}/rest/v1/investment_offers`,
          config.supabaseServiceKey,
          'POST',
          offerData
        );

        if (newOffer && newOffer.length > 0) {
          offers.push({ ...offerData, id: newOffer[0].id });
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.log(`   ❌ Error creating investment offer ${i + 1} for ${tenant.name}:`, error.message);
      }
    }
  }

  return { success: true, ideas, offers };
}

/**
 * Create matches and messages
 */
async function createInteractions(tenants, ideas, offers, creators, investors, config) {
  const matches = [];
  const messages = [];

  for (const tenant of tenants) {
    console.log(`   Creating interactions for: ${tenant.name}`);

    // Get ideas and offers for this tenant
    const tenantIdeas = ideas.filter(idea => idea.creator_id && creators.find(c => c.id === idea.creator_id && c.tenant_id === tenant.id));
    const tenantOffers = offers.filter(offer => offer.tenant_id === tenant.id);

    // Get creators and investors for this tenant
    const tenantCreators = creators.filter(c => c.tenant_id === tenant.id);
    const tenantInvestors = investors.filter(i => i.tenant_id === tenant.id);

    // Create 10 matches
    for (let i = 0; i < 10 && i < tenantIdeas.length && i < tenantOffers.length; i++) {
      try {
        const idea = tenantIdeas[i];
        const offer = tenantOffers[i];

        if (!idea || !offer) continue;

        const creator = tenantCreators.find(c => c.id === idea.creator_id);
        const investor = tenantInvestors.find(inv => inv.id === offer.investor_id);

        if (!creator || !investor) continue;

        // Create match
        const matchData = {
          idea_id: idea.id,
          investor_id: investor.id,
          creator_id: creator.id,
          offer_id: offer.id,
          match_score: DataGenerator.randomDecimal(0.7, 0.95, 2),
          matching_factors: {
            industry_match: DataGenerator.randomDecimal(0.8, 1.0, 2),
            stage_match: DataGenerator.randomDecimal(0.7, 0.9, 2),
            location_match: DataGenerator.randomDecimal(0.6, 0.9, 2)
          },
          status: 'suggested'
        };

        const newMatch = await makeRequest(
          `${config.supabaseUrl}/rest/v1/matches`,
          config.supabaseServiceKey,
          'POST',
          matchData
        );

        if (newMatch && newMatch.length > 0) {
          matches.push({ ...matchData, id: newMatch[0].id });

          // Create conversation for the match
          const conversationData = {
            match_id: newMatch[0].id,
            participant1_id: creator.id,
            participant2_id: investor.id,
            last_message_at: new Date().toISOString()
          };

          const newConversation = await makeRequest(
            `${config.supabaseUrl}/rest/v1/conversations`,
            config.supabaseServiceKey,
            'POST',
            conversationData
          );

          if (newConversation && newConversation.length > 0) {
            // Create 10 messages for this conversation
            for (let msgIndex = 0; msgIndex < 10; msgIndex++) {
              const sender = msgIndex % 2 === 0 ? creator : investor;
              const messageData = {
                conversation_id: newConversation[0].id,
                sender_id: sender.id,
                content: `This is message ${msgIndex + 1} in our conversation about the ${idea.title} opportunity. ${msgIndex % 3 === 0 ? 'I\'m very interested in exploring this further.' : msgIndex % 3 === 1 ? 'Could you provide more details about the technical implementation?' : 'What are the next steps for moving forward?'}`,
                type: 'text',
                read: msgIndex < 8 // Mark first 8 messages as read
              };

              const newMessage = await makeRequest(
                `${config.supabaseUrl}/rest/v1/messages`,
                config.supabaseServiceKey,
                'POST',
                messageData
              );

              if (newMessage && newMessage.length > 0) {
                messages.push({ ...messageData, id: newMessage[0].id });
              }

              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
        }

        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.log(`   ❌ Error creating match ${i + 1} for ${tenant.name}:`, error.message);
      }
    }
  }

  return { success: true, matches, messages };
}

/**
 * Find existing Supabase Auth user by email
 */
async function findExistingAuthUser(email, config) {
  try {
    const listUsersUrl = `${config.supabaseUrl}/auth/v1/admin/users`;
    const existingUsers = await makeRequest(listUsersUrl, config.supabaseServiceKey, 'GET');

    if (existingUsers && existingUsers.users && existingUsers.users.length > 0) {
      return existingUsers.users.find(u => u.email === email) || null;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Make HTTP request to Supabase API
 */
function makeRequest(url, apiKey, method, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
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
          if (body && body.trim()) {
            const parsed = JSON.parse(body);
            resolve(parsed);
          } else {
            resolve(null);
          }
        } catch (error) {
          // If we can't parse the response, it might be empty or an error
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Run the script
createComprehensiveTestData()
  .then((result) => {
    if (result && result.success) {
      console.log('\n✅ Script completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Script completed with errors');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  });