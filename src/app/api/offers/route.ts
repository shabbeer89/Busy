import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { requireAuth } from '@/lib/auth'
import { apiCORSMiddleware, addCORSHeaders } from '@/lib/cors'

// GET /api/offers - List investment offers with filtering and pagination
export async function GET(request: NextRequest) {
  // Apply CORS middleware
  const corsResponse = apiCORSMiddleware(request)
  if (corsResponse && corsResponse.status === 200) {
    return corsResponse // Preflight request
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const minAmount = searchParams.get('minAmount')
    const maxAmount = searchParams.get('maxAmount')
    const industry = searchParams.get('industry')
    const search = searchParams.get('search')

    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('investment_offers')
      .select(`
        *,
        investor:users!investment_offers_investor_id_fkey(
          id,
          name,
          avatar,
          company_name,
          bio,
          location,
          is_verified
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Apply filters
    if (minAmount) {
      query = query.gte('amount_range->min', parseFloat(minAmount))
    }

    if (maxAmount) {
      query = query.lte('amount_range->max', parseFloat(maxAmount))
    }

    if (industry) {
      query = query.contains('preferred_industries', [industry])
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: offers, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch offers: ${error.message}`)
    }

    const response = NextResponse.json({
      success: true,
      data: offers || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

    addCORSHeaders(response, request)
    return response

  } catch (error) {
    console.error('Error fetching offers:', error)
    const response = NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch investment offers',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    addCORSHeaders(response, request)
    return response
  }
}

// POST /api/offers - Create a new investment offer
export async function POST(request: NextRequest) {
  // Apply CORS middleware
  const corsResponse = apiCORSMiddleware(request)
  if (corsResponse && corsResponse.status === 200) {
    return corsResponse // Preflight request
  }

  try {
    const user = await requireAuth()
    const body = await request.json()

    const {
      title,
      description,
      amount_range,
      preferred_equity,
      preferred_stages = [],
      preferred_industries = [],
      geographic_preference,
      investment_type = 'equity',
      timeline
    } = body

    // Validate required fields
    if (!title || !description || !amount_range) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Title, description, and amount range are required'
        },
        { status: 400 }
      )
    }

    // Validate amount range
    if (amount_range.min >= amount_range.max) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid amount range',
          message: 'Minimum amount must be less than maximum amount'
        },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { data: offer, error } = await (supabase as any)
      .from('investment_offers')
      .insert({
        investor_id: user.id,
        title,
        description,
        amount_range,
        preferred_equity,
        preferred_stages,
        preferred_industries,
        geographic_preference,
        investment_type,
        timeline,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create offer: ${error.message}`)
    }

    const response = NextResponse.json({
      success: true,
      data: offer,
      message: 'Investment offer created successfully'
    })

    addCORSHeaders(response, request)
    return response

  } catch (error) {
    console.error('Error creating offer:', error)
    const response = NextResponse.json(
      {
        success: false,
        error: 'Failed to create investment offer',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    addCORSHeaders(response, request)
    return response
  }
}