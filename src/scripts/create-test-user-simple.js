const { createClient } = require('@supabase/supabase-js');

async function createTestUser() {
  try {
    console.log('🚀 Creating test user...');

    // Use regular client for standalone script
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const testUser = {
      email: 'test@example.com',
      password: 'testpassword123',
      name: 'Test User',
      user_type: 'creator',
      is_verified: true,
      phone_verified: true,
      company_name: 'Test Company',
      industry: 'Technology',
      experience: '5+ years',
      bio: 'Test user for development and testing purposes',
      location: 'San Francisco, CA',
      website: 'https://example.com',
      social_links: {
        linkedin: 'https://linkedin.com/in/testuser',
        twitter: 'https://twitter.com/testuser'
      }
    };

    console.log('🔍 Checking if test user already exists...');

    // Check if test user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', testUser.email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing user:', checkError);
      return;
    }

    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.id);
      console.log('📧 Email: test@example.com');
      console.log('🔑 Password: testpassword123');
      return existingUser.id;
    }

    console.log('👤 Creating new test user profile...');

    // Generate a simple UUID-like string for the test user
    const userId = '550e8400-e29b-41d4-a716-446655440001';

    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: testUser.email,
        name: testUser.name,
        user_type: testUser.user_type,
        is_verified: testUser.is_verified,
        phone_verified: testUser.phone_verified,
        company_name: testUser.company_name,
        industry: testUser.industry,
        experience: testUser.experience,
        bio: testUser.bio,
        location: testUser.location,
        website: testUser.website,
        social_links: testUser.social_links
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating user profile:', profileError);
      return;
    }

    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: testpassword123');
    console.log('🆔 User ID:', profileData.id);

    return profileData.id;

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the script
createTestUser();
