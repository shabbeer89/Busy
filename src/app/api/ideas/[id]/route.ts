import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { requireAuth } from '@/lib/auth'
import { apiCORSMiddleware, addCORSHeaders } from '@/lib/cors'

// GET /api/ideas/[id] - Get a specific business idea
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  // Apply CORS middleware
  const corsResponse = apiCORSMiddleware(request)
  if (corsResponse && corsResponse.status === 200) {
    return corsResponse // Preflight request
  }

  try {
    const supabase = await createServerSupabaseClient()
    const { id } = params

    const { data: idea, error } = await (supabase as any)
      .from('business_ideas')
      .select(`
        *,
        creator:users!business_ideas_creator_id_fkey(
          id,
          name,
          avatar,
          company_name,
          bio,
          location,
          is_verified
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Idea not found' },
          { status: 404 }
        )
      }
      throw new Error(`Failed to fetch idea: ${error.message}`)
    }

    const response = NextResponse.json({
      success: true,
      data: idea
    })

    addCORSHeaders(response, request)
    return response

  } catch (error) {
    console.error('Error fetching idea:', error)
    const response = NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch business idea',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    addCORSHeaders(response, request)
    return response
  }
}

// PUT /api/ideas/[id] - Update a business idea
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  // Apply CORS middleware
  const corsResponse = apiCORSMiddleware(request)
  if (corsResponse && corsResponse.status === 200) {
    return corsResponse // Preflight request
  }

  try {
    const user = await requireAuth()
    const { id } = params
    const body = await request.json()

    const {
      title,
      description,
      category,
      tags,
      funding_goal,
      equity_offered,
      stage,
      timeline,
      team_size,
      images,
      documents,
      video_url,
      status
    } = body

    const supabase = await createServerSupabaseClient()

    // First check if the idea exists and user owns it
    const { data: existingIdea, error: fetchError } = await (supabase as any)
      .from('business_ideas')
      .select('creator_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Idea not found' },
          { status: 404 }
        )
      }
      throw new Error(`Failed to fetch idea: ${fetchError.message}`)
    }

    if (existingIdea.creator_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to update this idea' },
        { status: 403 }
      )
    }

    // Update the idea
    const { data: idea, error } = await (supabase as any)
      .from('business_ideas')
      .update({
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(tags && { tags }),
        ...(funding_goal && { funding_goal: parseFloat(funding_goal) }),
        ...(equity_offered && { equity_offered: parseFloat(equity_offered) }),
        ...(stage && { stage }),
        ...(timeline && { timeline }),
        ...(team_size && { team_size: parseInt(team_size) }),
        ...(images && { images }),
        ...(documents && { documents }),
        ...(video_url !== undefined && { video_url }),
        ...(status && { status }),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update idea: ${error.message}`)
    }

    const response = NextResponse.json({
      success: true,
      data: idea,
      message: 'Business idea updated successfully'
    })

    addCORSHeaders(response, request)
    return response

  } catch (error) {
    console.error('Error updating idea:', error)
    const response = NextResponse.json(
      {
        success: false,
        error: 'Failed to update business idea',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    addCORSHeaders(response, request)
    return response
  }
}

// DELETE /api/ideas/[id] - Delete a business idea
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  // Apply CORS middleware
  const corsResponse = apiCORSMiddleware(request)
  if (corsResponse && corsResponse.status === 200) {
    return corsResponse // Preflight request
  }

  try {
    const user = await requireAuth()
    const { id } = params

    const supabase = await createServerSupabaseClient()

    // First check if the idea exists and user owns it
    const { data: existingIdea, error: fetchError } = await (supabase as any)
      .from('business_ideas')
      .select('creator_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Idea not found' },
          { status: 404 }
        )
      }
      throw new Error(`Failed to fetch idea: ${fetchError.message}`)
    }

    if (existingIdea.creator_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to delete this idea' },
        { status: 403 }
      )
    }

    // Delete the idea
    const { error } = await (supabase as any)
      .from('business_ideas')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete idea: ${error.message}`)
    }

    const response = NextResponse.json({
      success: true,
      message: 'Business idea deleted successfully'
    })

    addCORSHeaders(response, request)
    return response

  } catch (error) {
    console.error('Error deleting idea:', error)
    const response = NextResponse.json(
      {
        success: false,
        error: 'Failed to delete business idea',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    addCORSHeaders(response, request)
    return response
  }
}