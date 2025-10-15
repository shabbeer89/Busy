import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Check if required environment variables are present
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Use service role key to bypass RLS policies
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

    // First, check if we can connect to the database
    const { data: connectionTest, error: connectionError } = await supabase
      .from('tenants')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('Database connection error:', connectionError);

      // If it's a permission error, the database might not be set up yet
      if (connectionError.code === '42501' || connectionError.message?.includes('permission denied')) {
        return NextResponse.json(
          {
            error: 'Database not configured',
            details: 'Please ensure your Supabase database is properly set up with the tenants table and appropriate permissions.'
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: 'Database connection failed', details: connectionError.message },
        { status: 500 }
      );
    }

    // Load tenants data
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (error) {
      console.error('Error loading tenants:', error);
      return NextResponse.json(
        { error: 'Failed to load tenants', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in tenants API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}