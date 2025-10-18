import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { requireAuth } from '@/lib/auth'
import { apiCORSMiddleware, addCORSHeaders } from '@/lib/cors'
import {
  validateRequest,
  createApiResponse,
  handleApiError,
  API_ERRORS,
  withErrorHandler
} from '@/lib/api-utils'

// GET /api/ideas - List business ideas with filtering and pagination
export async function GET(request: NextRequest) {
  // Apply CORS middleware
  const corsResponse = apiCORSMiddleware(request)
  if (corsResponse && corsResponse.status === 200) {
    return corsResponse // Preflight request
  }

  return withErrorHandler(async () => {
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
      throw API_ERRORS.DATABASE_ERROR(error)
    }

    return createApiResponse({
      ideas: ideas || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  })().catch(error => handleApiError(error, request, 'GET /api/ideas'))
}

// POST /api/ideas - Create a new business idea
export async function POST(request: NextRequest) {
  // Apply CORS middleware
  const corsResponse = apiCORSMiddleware(request)
  if (corsResponse && corsResponse.status === 200) {
    return corsResponse // Preflight request
  }

  return withErrorHandler(async () => {
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
      throw API_ERRORS.VALIDATION_ERROR({
        message: 'Title, description, category, and funding goal are required'
      })
    }

    const supabase = await createServerSupabaseClient()

    // Validate funding goal
    const fundingGoalNum = parseFloat(funding_goal)
    if (isNaN(fundingGoalNum) || fundingGoalNum <= 0) {
      throw API_ERRORS.VALIDATION_ERROR({
        message: 'Funding goal must be a positive number'
      })
    }

    // Validate equity offered if provided
    if (equity_offered) {
      const equityNum = parseFloat(equity_offered)
      if (isNaN(equityNum) || equityNum < 0 || equityNum > 100) {
        throw API_ERRORS.VALIDATION_ERROR({
          message: 'Equity offered must be between 0 and 100'
        })
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
      throw API_ERRORS.DATABASE_ERROR(error)
    }

    return createApiResponse(idea, 'Business idea created successfully')
  })().catch(error => handleApiError(error, request, 'POST /api/ideas'))
}