import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, name, phone_number, user_type, avatar } = body;

    if (!email || !name || !user_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const { data: existingProfile } = await (supabase as any)
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    let profile;

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await (supabase as any)
        .from('users')
        .update({
          name,
          phone_number,
          user_type,
          avatar,
          updated_at: new Date().toISOString(),
        })
        .eq('email', email)
        .select()
        .single();

      if (error) {
        throw error;
      }

      profile = data;
    } else {
      // Create new profile
      const { data, error } = await (supabase as any)
        .from('users')
        .insert({
          id: user.id,
          email,
          name,
          phone_number,
          user_type,
          avatar,
          is_verified: user.email_confirmed_at ? true : false,
          phone_verified: false,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      profile = data;
    }

    return NextResponse.json({
      success: true,
      profile,
    });

  } catch (error) {
    console.error('Error managing user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
