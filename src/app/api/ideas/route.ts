import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { requireAuth } from '@/lib/auth'
import { apiCORSMiddleware, addCORSHeaders } from '@/lib/cors'

// GET /api/ideas - List business ideas with filtering and pagination
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
    const category = searchParams.get('category')
    const status = searchParams.get('status') || 'published'
    const search = searchParams.get('search')

    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from('business_ideas')
      .select(`
        *,
        creator:users!business_ideas_creator_id_fkey(
          id,
          name,
          avatar,
          company_name,
          is_verified
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: ideas, error, count } = await query

    if (error) {
      throw new Error(`Failed to fetch ideas: ${error.message}`)
    }

    const response = NextResponse.json({
      success: true,
      data: ideas || [],
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
    console.error('Error fetching ideas:', error)
    const response = NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch business ideas',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    addCORSHeaders(response, request)
    return response
  }
}

// POST /api/ideas - Create a new business idea
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
      category,
      tags = [],
      funding_goal,
      equity_offered,
      stage = 'concept',
      timeline,
      team_size,
      images = [],
      documents = [],
      video_url
    } = body

    // Validate required fields
    if (!title || !description || !category || !funding_goal) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Title, description, category, and funding goal are required'
        },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Validate funding goal
    const fundingGoalNum = parseFloat(funding_goal)
    if (isNaN(fundingGoalNum) || fundingGoalNum <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid funding goal',
          message: 'Funding goal must be a positive number'
        },
        { status: 400 }
      )
    }

    // Validate equity offered if provided
    if (equity_offered) {
      const equityNum = parseFloat(equity_offered)
      if (isNaN(equityNum) || equityNum < 0 || equityNum > 100) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid equity offered',
            message: 'Equity offered must be between 0 and 100'
          },
          { status: 400 }
        )
      }
    }

    const { data: idea, error } = await (supabase as any)
      .from('business_ideas')
      .insert({
        creator_id: user.id,
        title,
        description,
        category,
        tags,
        funding_goal: parseFloat(funding_goal),
        equity_offered: parseFloat(equity_offered || 0),
        stage,
        timeline,
        team_size: team_size ? parseInt(team_size) : null,
        images,
        documents,
        video_url,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create idea: ${error.message}`)
    }

    const response = NextResponse.json({
      success: true,
      data: idea,
      message: 'Business idea created successfully'
    })

    addCORSHeaders(response, request)
    return response

  } catch (error) {
    console.error('Error creating idea:', error)
    const response = NextResponse.json(
      {
        success: false,
        error: 'Failed to create business idea',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    addCORSHeaders(response, request)
    return response
  }
}