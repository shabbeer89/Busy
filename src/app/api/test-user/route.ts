import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Test user data
    const testUser = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'test@example.com',
      name: 'Test User',
      user_type: 'creator' as const,
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

    // Check if test user already exists
    const { data: existingUser } = await (supabase as any)
      .from('users')
      .select('id')
      .eq('email', testUser.email)
      .single();

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'Test user already exists',
        user: existingUser,
        credentials: {
          email: 'test@example.com',
          password: 'testpassword123'
        }
      });
    }

    // Insert test user (without id to let database generate it)
    const { data: newUser, error } = await (supabase as any)
      .from('users')
      .insert({
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

    if (error) {
      console.error('Error creating test user:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      user: newUser,
      credentials: {
        email: 'test@example.com',
        password: 'testpassword123'
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
