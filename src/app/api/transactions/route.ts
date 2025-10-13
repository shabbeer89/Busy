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

// GET /api/transactions - List transactions for the authenticated user
export async function GET(request: NextRequest) {
  // Apply CORS middleware
  const corsResponse = apiCORSMiddleware(request)
  if (corsResponse && corsResponse.status === 200) {
    return corsResponse // Preflight request
  }

  return withErrorHandler(async () => {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const type = searchParams.get('type') // 'sent' or 'received'

    const supabase = await createServerSupabaseClient()

    let query = (supabase as any)
      .from('transactions')
      .select(`
        *,
        match:matches!transactions_match_id_fkey(
          id,
          idea_id,
          offer_id,
          creator:users!matches_creator_id_fkey(name),
          investor:users!matches_investor_id_fkey(name)
        )
      `)
      .or(`investor_id.eq.${user.id},creator_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (type === 'sent') {
      query = query.eq('investor_id', user.id)
    } else if (type === 'received') {
      query = query.eq('creator_id', user.id)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: transactions, error, count } = await query

    if (error) {
      throw API_ERRORS.DATABASE_ERROR(error)
    }

    return createApiResponse({
      transactions: transactions || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  })().catch(error => handleApiError(error, request, 'GET /api/transactions'))
}

// POST /api/transactions - Create a new transaction
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
      match_id,
      amount,
      currency = 'USD',
      payment_method,
      wallet_address,
      notes
    } = body

    // Validate required fields
    if (!match_id || !amount || !payment_method) {
      throw API_ERRORS.VALIDATION_ERROR({
        message: 'match_id, amount, and payment_method are required'
      })
    }

    // Validate amount
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      throw API_ERRORS.VALIDATION_ERROR({
        message: 'Amount must be a positive number'
      })
    }

    const supabase = await createServerSupabaseClient()

    // Get match details to determine investor/creator roles
    const { data: match, error: matchError } = await (supabase as any)
      .from('matches')
      .select('investor_id, creator_id, idea_id, offer_id')
      .eq('id', match_id)
      .single()

    if (matchError) {
      throw API_ERRORS.NOT_FOUND('Match')
    }

    // Determine if user is investor or creator
    const isInvestor = match.investor_id === user.id
    const isCreator = match.creator_id === user.id

    if (!isInvestor && !isCreator) {
      throw API_ERRORS.FORBIDDEN()
    }

    // Create transaction record
    const { data: transaction, error } = await (supabase as any)
      .from('transactions')
      .insert({
        match_id,
        investor_id: match.investor_id,
        creator_id: match.creator_id,
        amount: amountNum,
        currency,
        payment_method,
        wallet_address,
        status: 'pending',
        notes
      })
      .select()
      .single()

    if (error) {
      throw API_ERRORS.DATABASE_ERROR(error)
    }

    return createApiResponse(transaction, 'Transaction created successfully')
  })().catch(error => handleApiError(error, request, 'POST /api/transactions'))
}