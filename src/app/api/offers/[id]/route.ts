import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { requireAuth } from '@/lib/auth'
import { apiCORSMiddleware, addCORSHeaders } from '@/lib/cors'

// GET /api/offers/[id] - Get a specific investment offer
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

    const { data: offer, error } = await (supabase as any)
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
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Offer not found' },
          { status: 404 }
        )
      }
      throw new Error(`Failed to fetch offer: ${error.message}`)
    }

    const response = NextResponse.json({
      success: true,
      data: offer
    })

    addCORSHeaders(response, request)
    return response

  } catch (error) {
    console.error('Error fetching offer:', error)
    const response = NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch investment offer',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    addCORSHeaders(response, request)
    return response
  }
}

// PUT /api/offers/[id] - Update an investment offer
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
      amount_range,
      preferred_equity,
      preferred_stages,
      preferred_industries,
      geographic_preference,
      investment_type,
      timeline,
      is_active
    } = body

    const supabase = await createServerSupabaseClient()

    // First check if the offer exists and user owns it
    const { data: existingOffer, error: fetchError } = await (supabase as any)
      .from('investment_offers')
      .select('investor_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Offer not found' },
          { status: 404 }
        )
      }
      throw new Error(`Failed to fetch offer: ${fetchError.message}`)
    }

    if (existingOffer.investor_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to update this offer' },
        { status: 403 }
      )
    }

    // Validate amount range if provided
    if (amount_range && amount_range.min >= amount_range.max) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid amount range',
          message: 'Minimum amount must be less than maximum amount'
        },
        { status: 400 }
      )
    }

    // Update the offer
    const { data: offer, error } = await (supabase as any)
      .from('investment_offers')
      .update({
        ...(title && { title }),
        ...(description && { description }),
        ...(amount_range && { amount_range }),
        ...(preferred_equity && { preferred_equity }),
        ...(preferred_stages && { preferred_stages }),
        ...(preferred_industries && { preferred_industries }),
        ...(geographic_preference !== undefined && { geographic_preference }),
        ...(investment_type && { investment_type }),
        ...(timeline !== undefined && { timeline }),
        ...(is_active !== undefined && { is_active }),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update offer: ${error.message}`)
    }

    const response = NextResponse.json({
      success: true,
      data: offer,
      message: 'Investment offer updated successfully'
    })

    addCORSHeaders(response, request)
    return response

  } catch (error) {
    console.error('Error updating offer:', error)
    const response = NextResponse.json(
      {
        success: false,
        error: 'Failed to update investment offer',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    addCORSHeaders(response, request)
    return response
  }
}

// DELETE /api/offers/[id] - Delete an investment offer
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

    // First check if the offer exists and user owns it
    const { data: existingOffer, error: fetchError } = await (supabase as any)
      .from('investment_offers')
      .select('investor_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Offer not found' },
          { status: 404 }
        )
      }
      throw new Error(`Failed to fetch offer: ${fetchError.message}`)
    }

    if (existingOffer.investor_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to delete this offer' },
        { status: 403 }
      )
    }

    // Soft delete by setting is_active to false
    const { error } = await (supabase as any)
      .from('investment_offers')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete offer: ${error.message}`)
    }

    const response = NextResponse.json({
      success: true,
      message: 'Investment offer deleted successfully'
    })

    addCORSHeaders(response, request)
    return response

  } catch (error) {
    console.error('Error deleting offer:', error)
    const response = NextResponse.json(
      {
        success: false,
        error: 'Failed to delete investment offer',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
    addCORSHeaders(response, request)
    return response
  }
}