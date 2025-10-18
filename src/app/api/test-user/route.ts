import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Test user credentials
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';

    // Check if Supabase Auth user already exists
    const { data: existingAuthUser } = await supabase.auth.admin.listUsers();
    const authUserExists = existingAuthUser.users.some(user => user.email === testEmail);

    let authUser;

    if (!authUserExists) {
      // Create user in Supabase Auth first
      const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true, // Auto-confirm email for testing
        user_metadata: {
          name: 'Test User',
        }
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        return NextResponse.json({
          success: false,
          error: `Failed to create auth user: ${authError.message}`
        }, { status: 500 });
      }

      authUser = newAuthUser.user;
      console.log('✅ Created Supabase Auth user:', authUser.id);
    } else {
      // Get existing auth user by listing users and finding by email
      const { data: usersList } = await supabase.auth.admin.listUsers();
      authUser = usersList.users.find(user => user.email === testEmail) || null;

      if (!authUser) {
        console.error('❌ Could not find existing auth user by email');
        return NextResponse.json({
          success: false,
          error: 'Could not find existing auth user'
        }, { status: 500 });
      }

      console.log('✅ Found existing Supabase Auth user:', authUser.id);
    }

    // Now check if profile exists in custom users table
    const { data: existingProfile } = await (supabase as any)
      .from('users')
      .select('id')
      .eq('email', testEmail)
      .single();

    if (existingProfile) {
      return NextResponse.json({
        success: true,
        message: 'Test user already exists',
        user: existingProfile,
        credentials: {
          email: testEmail,
          password: testPassword
        }
      });
    }

    // Create profile in custom users table using the auth user ID
    const { data: newProfile, error: profileError } = await (supabase as any)
      .from('users')
      .insert({
        id: authUser!.id, // Use the Supabase Auth user ID
        email: testEmail,
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
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      return NextResponse.json({
        success: false,
        error: `Failed to create user profile: ${profileError.message}`
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      user: newProfile,
      credentials: {
        email: testEmail,
        password: testPassword
      }
    });

  } catch (error) {
    console.error('Error in test user API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
