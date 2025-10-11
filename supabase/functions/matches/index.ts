import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Intelligent matching algorithm
function calculateMatchScore(idea: any, offer: any, creator: any, investor: any): number {
  let score = 0
  let factors = {
    amountCompatibility: 0,
    industryAlignment: 0,
    stagePreference: 0,
    riskAlignment: 0,
  }

  // Amount compatibility (25% weight)
  const fundingGoal = idea.funding_goal
  const amountRange = offer.amount_range
  if (fundingGoal >= amountRange.min && fundingGoal <= amountRange.max) {
    factors.amountCompatibility = 100
    score += 25
  } else if (fundingGoal < amountRange.min) {
    factors.amountCompatibility = Math.min(100, (fundingGoal / amountRange.min) * 100)
    score += 25 * (factors.amountCompatibility / 100)
  } else {
    factors.amountCompatibility = Math.max(0, 100 - ((fundingGoal - amountRange.max) / amountRange.max) * 100)
    score += 25 * (factors.amountCompatibility / 100)
  }

  // Industry alignment (35% weight)
  const ideaCategory = idea.category.toLowerCase()
  const preferredIndustries = offer.preferred_industries || []

  if (preferredIndustries.length === 0) {
    factors.industryAlignment = 100
    score += 35
  } else {
    const industryMatch = preferredIndustries.some((industry: string) =>
      ideaCategory.includes(industry.toLowerCase()) ||
      industry.toLowerCase().includes(ideaCategory)
    )
    if (industryMatch) {
      factors.industryAlignment = 100
      score += 35
    } else {
      factors.industryAlignment = 50 // Partial score for related industries
      score += 17.5
    }
  }

  // Stage preference (15% weight)
  const ideaStage = idea.stage
  const preferredStages = offer.preferred_stages || []

  if (preferredStages.length === 0) {
    factors.stagePreference = 100
    score += 15
  } else {
    const stageMatch = preferredStages.includes(ideaStage)
    if (stageMatch) {
      factors.stagePreference = 100
      score += 15
    } else {
      factors.stagePreference = 0
    }
  }

  // Risk alignment (25% weight) - based on creator experience and investment type
  const creatorExperience = creator.experience || ''
  const riskTolerance = investor.risk_tolerance || 'medium'

  if (riskTolerance === 'high' && ideaStage === 'concept') {
    factors.riskAlignment = 100
    score += 25
  } else if (riskTolerance === 'medium' && ['concept', 'mvp'].includes(ideaStage)) {
    factors.riskAlignment = 75
    score += 18.75
  } else if (riskTolerance === 'low' && ['early', 'growth'].includes(ideaStage)) {
    factors.riskAlignment = 100
    score += 25
  } else {
    factors.riskAlignment = 50
    score += 12.5
  }

  return Math.round(score)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    switch (action) {
      case 'find-matches': {
        // Find potential matches for a user's ideas or offers
        const userType = url.searchParams.get('user_type') // 'creator' or 'investor'
        const itemId = url.searchParams.get('item_id') // idea_id or offer_id

        if (!userType || !itemId) {
          return new Response(
            JSON.stringify({ error: 'User type and item ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (userType === 'creator') {
          // Find matches for creator's idea
          const { data: idea, error: ideaError } = await supabaseClient
            .from('business_ideas')
            .select('*')
            .eq('id', itemId)
            .eq('creator_id', user.id)
            .single()

          if (ideaError || !idea) {
            return new Response(
              JSON.stringify({ error: 'Idea not found or access denied' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Get creator profile
          const { data: creator } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

          // Find compatible investment offers
          const { data: offers, error: offersError } = await supabaseClient
            .from('investment_offers')
            .select('*')
            .eq('is_active', true)

          if (offersError) {
            return new Response(
              JSON.stringify({ error: offersError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Calculate matches
          const matches = []
          for (const offer of offers) {
            const { data: investor } = await supabaseClient
              .from('users')
              .select('*')
              .eq('id', offer.investor_id)
              .single()

            const matchScore = calculateMatchScore(idea, offer, creator, investor)
            const matchingFactors = {
              amountCompatibility: Math.round((idea.funding_goal - offer.amount_range.min) / (offer.amount_range.max - offer.amount_range.min) * 100),
              industryAlignment: idea.category === offer.preferred_industries?.[0] ? 100 : 50,
              stagePreference: offer.preferred_stages?.includes(idea.stage) ? 100 : 0,
              riskAlignment: investor?.risk_tolerance === 'high' ? 100 : 50,
            }

            matches.push({
              idea_id: idea.id,
              investor_id: offer.investor_id,
              creator_id: user.id,
              offer_id: offer.id,
              match_score: matchScore,
              matching_factors: matchingFactors,
              status: 'suggested',
            })
          }

          // Sort by score and return top matches
          matches.sort((a, b) => b.match_score - a.match_score)
          const topMatches = matches.slice(0, 20)

          return new Response(
            JSON.stringify({ success: true, matches: topMatches }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )

        } else {
          // Find matches for investor's offer
          const { data: offer, error: offerError } = await supabaseClient
            .from('investment_offers')
            .select('*')
            .eq('id', itemId)
            .eq('investor_id', user.id)
            .single()

          if (offerError || !offer) {
            return new Response(
              JSON.stringify({ error: 'Offer not found or access denied' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Get investor profile
          const { data: investor } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

          // Find compatible business ideas
          const { data: ideas, error: ideasError } = await supabaseClient
            .from('business_ideas')
            .select('*')
            .eq('status', 'published')

          if (ideasError) {
            return new Response(
              JSON.stringify({ error: ideasError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          // Calculate matches
          const matches = []
          for (const idea of ideas) {
            const { data: creator } = await supabaseClient
              .from('users')
              .select('*')
              .eq('id', idea.creator_id)
              .single()

            const matchScore = calculateMatchScore(idea, offer, creator, investor)
            const matchingFactors = {
              amountCompatibility: Math.round((idea.funding_goal - offer.amount_range.min) / (offer.amount_range.max - offer.amount_range.min) * 100),
              industryAlignment: idea.category === offer.preferred_industries?.[0] ? 100 : 50,
              stagePreference: offer.preferred_stages?.includes(idea.stage) ? 100 : 0,
              riskAlignment: investor?.risk_tolerance === 'high' ? 100 : 50,
            }

            matches.push({
              idea_id: idea.id,
              investor_id: user.id,
              creator_id: idea.creator_id,
              offer_id: offer.id,
              match_score: matchScore,
              matching_factors: matchingFactors,
              status: 'suggested',
            })
          }

          // Sort by score and return top matches
          matches.sort((a, b) => b.match_score - a.match_score)
          const topMatches = matches.slice(0, 20)

          return new Response(
            JSON.stringify({ success: true, matches: topMatches }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      case 'create-match': {
        if (req.method !== 'POST') {
          return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const body = await req.json()
        const { idea_id, investor_id, creator_id, offer_id, match_score, matching_factors } = body

        // Insert match
        const { data, error } = await supabaseClient
          .from('matches')
          .insert({
            idea_id,
            investor_id,
            creator_id,
            offer_id,
            match_score,
            matching_factors,
            status: 'suggested',
          })
          .select()
          .single()

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get-matches': {
        const matchId = url.searchParams.get('id')
        const userId = url.searchParams.get('user_id')
        const status = url.searchParams.get('status')

        let query = supabaseClient.from('matches').select('*')

        if (matchId) {
          query = query.eq('id', matchId)
        }

        if (userId) {
          query = query.or(`investor_id.eq.${userId},creator_id.eq.${userId}`)
        }

        if (status) {
          query = query.eq('status', status)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update-match': {
        if (req.method !== 'PUT') {
          return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const matchId = url.searchParams.get('id')

        if (!matchId) {
          return new Response(
            JSON.stringify({ error: 'Match ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const body = await req.json()
        const { status } = body

        const { data, error } = await supabaseClient
          .from('matches')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', matchId)
          .or(`investor_id.eq.${user.id},creator_id.eq.${user.id}`)
          .select()
          .single()

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})