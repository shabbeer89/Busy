const { createClient } = require('@supabase/supabase-js');

async function createTestUser() {
  try {
    console.log('🚀 Creating test user in both Supabase Auth and users table...');

    // Use service role client to create auth user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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

    console.log('🔍 Checking if test user already exists in users table...');

    // Check if test user profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', testUser.email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing user profile:', checkError);
      return;
    }

    if (existingProfile) {
      console.log('✅ Test user profile already exists:', existingProfile.id);
      console.log('📧 Email: test@example.com');
      console.log('🔑 Password: testpassword123');
      return existingProfile.id;
    }

    console.log('👤 Creating test user in Supabase Auth...');

    // First create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: 'testpassword123',
      email_confirm: true,
      user_metadata: {
        name: testUser.name,
      }
    });

    // If auth user creation fails, provide fallback instructions
    if (authError || !authData.user) {
      console.error('❌ Error creating auth user:', authError?.message || 'No user data returned');

      console.log('\n🔧 Manual Setup Required:');
      console.log('1. Go to your Supabase Dashboard');
      console.log('2. Navigate to Authentication > Users');
      console.log('3. Click "Add User"');
      console.log('4. Enter:');
      console.log('   📧 Email: test@example.com');
      console.log('   🔑 Password: testpassword123');
      console.log('5. Click "Save"');
      console.log('\nThen run this script again or try logging in directly.');

      // Also check for corrupted data in users table
      console.log('\n🔍 Checking for corrupted data in users table...');

      const { data: corruptedUsers, error: checkError } = await supabase
        .from('users')
        .select('id, email')
        .or('id.like.%oauth_%,id.not.similar_to.%[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}%');

      if (!checkError && corruptedUsers && corruptedUsers.length > 0) {
        console.log('\n⚠️  Found corrupted user records:');
        corruptedUsers.forEach(user => {
          console.log(`   ID: ${user.id}, Email: ${user.email || 'No email'}`);
        });
        console.log('\n🧹 Consider cleaning these up in your Supabase dashboard');

        // Offer to clean up corrupted records
        console.log('\n🔧 Would you like to clean up corrupted records?');
        console.log('⚠️  WARNING: This will delete users with oauth_ prefixed IDs');
        console.log('Only do this if you are sure these are not legitimate user accounts');

        // Uncomment the following lines to actually delete corrupted records:
        /*
        console.log('\n🗑️  Deleting corrupted records...');
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .or('id.like.%oauth_%');

        if (deleteError) {
          console.error('❌ Error deleting corrupted records:', deleteError);
        } else {
          console.log('✅ Corrupted records deleted successfully!');
        }
        */

        // Also check for and update any user profiles that might have oauth_ IDs
        console.log('\n🔍 Checking for user profile with oauth_ ID...');
        const { data: oauthUser, error: findError } = await supabase
          .from('users')
          .select('*')
          .eq('id', 'oauth_1760257693420')
          .single();

        if (!findError && oauthUser) {
          console.log('⚠️  Found user profile with oauth_ ID:', oauthUser.email);
          console.log('🔧 Consider updating this record with a proper UUID or deleting it');
        }
      }

      return;
    }

    if (authError) {
      console.error('❌ Error creating auth user:', authError);

      // If service role key is not available, provide manual instructions
      if (authError.message?.includes('permission')) {
        console.log('\n❌ Service role key not available. Please create the user manually:');
        console.log('1. Go to your Supabase Dashboard');
        console.log('2. Navigate to Authentication > Users');
        console.log('3. Click "Add User"');
        console.log('4. Enter:');
        console.log('   Email: test@example.com');
        console.log('   Password: testpassword123');
        console.log('5. Click "Save"');
        console.log('\nThen run this script again or try logging in directly.');
        return;
      }
      return;
    }

    if (!authData.user) {
      console.error('❌ No user data returned from auth creation');
      return;
    }

    console.log('✅ Auth user created successfully!');
    console.log('🆔 Auth User ID:', authData.user.id);

    console.log('👤 Creating user profile in users table...');

    // Now create the profile in the custom users table
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id, // Use the auth user ID
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
      console.log('Note: Auth user was created, but profile creation failed.');
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

// Function to clear corrupted session data
async function clearCorruptedSession() {
  console.log('🧹 Clearing corrupted session data...');

  try {
    // Clear local storage that might contain oauth_ IDs
    if (typeof window !== 'undefined') {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('auth-storage')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.state?.user?.id && data.state.user.id.startsWith('oauth_')) {
              keysToRemove.push(key);
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️  Removed corrupted localStorage key: ${key}`);
      });
    }

    console.log('✅ Session cleanup completed!');
    console.log('🔄 Please refresh your browser and try again.');

  } catch (error) {
    console.error('❌ Error clearing session:', error);
  }
}

// Run the script
createTestUser();

// If you want to clear corrupted session data, uncomment the line below:
// clearCorruptedSession();
