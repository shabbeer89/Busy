import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { requireAuth } from '@/lib/auth'
import { apiCORSMiddleware, addCORSHeaders } from '@/lib/cors'

// GET /api/matches - Get matches for the authenticated user
export async function GET(request: NextRequest) {
  // Apply CORS middleware
  const corsResponse = apiCORSMiddleware(request)
  if (corsResponse && corsResponse.status === 200) {
    return corsResponse // Preflight request
  }

  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') // 'suggested', 'viewed', 'contacted', 'negotiating', 'invested', 'rejected'

    const supabase = await createServerSupabaseClient()

    let query = (supabase as any)
      .from('matches')
      .select(`
        *,
        idea:business_ideas!matches_idea_id_fkey(
          id,
          title,
          description,
          category,
          funding_goal,
          stage,
          creator_id
        ),
        offer:investment_offers!matches_offer_id_fkey(
          id,
          title,
          amount_range,
          investor_id
        ),
        creator:users!matches_creator_id_fkey(
          id,
          name,
          avatar,
          company_name
        ),
        investor:users!matches_investor_id_fkey(
          id,
          name,
          avatar,
          company_name
        )
      `)
      .or(`creator_id.eq.${user.id},investor_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: matches, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch matches: ${error.message}`)
    }

    const response = NextResponse.json({
      success: true,
      data: matches || [],
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
    console.error('Error fetching matches:', error)
    const response = NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch matches',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    addCORSHeaders(response, request)
    return response
  }
}

// POST /api/matches - Create a new match (usually done by the matching algorithm)
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
      idea_id,
      investor_id,
      creator_id,
      offer_id,
      match_score,
      matching_factors
    } = body

    // Validate required fields
    if (!idea_id || !investor_id || !creator_id || !offer_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'idea_id, investor_id, creator_id, and offer_id are required'
        },
        { status: 400 }
      )
    }

    // Users can only create matches for themselves
    if (user.user_type === 'creator' && creator_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to create this match' },
        { status: 403 }
      )
    }

    if (user.user_type === 'investor' && investor_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to create this match' },
        { status: 403 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { data: match, error } = await (supabase as any)
      .from('matches')
      .insert({
        idea_id,
        investor_id,
        creator_id,
        offer_id,
        match_score: match_score || 0,
        matching_factors: matching_factors || {},
        status: 'suggested'
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create match: ${error.message}`)
    }

    const response = NextResponse.json({
      success: true,
      data: match,
      message: 'Match created successfully'
    })

    addCORSHeaders(response, request)
    return response

  } catch (error) {
    console.error('Error creating match:', error)
    const response = NextResponse.json(
      {
        success: false,
        error: 'Failed to create match',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    addCORSHeaders(response, request)
    return response
  }
}