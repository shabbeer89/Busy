import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    switch (action) {
      case 'create': {
        if (req.method !== 'POST') {
          return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            {
              status: 405,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        const body = await req.json()
        const {
          title,
          description,
          category,
          tags,
          funding_goal,
          current_funding,
          equity_offered,
          valuation,
          stage,
          timeline,
          team_size,
          images,
          documents,
          video_url,
        } = body

        if (!title || !description || !category || !funding_goal || !equity_offered || !stage || !timeline) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        const { data, error } = await supabaseClient
          .from('business_ideas')
          .insert({
            creator_id: user.id,
            title,
            description,
            category,
            tags: tags || [],
            funding_goal: Number(funding_goal),
            current_funding: Number(current_funding) || 0,
            equity_offered: Number(equity_offered),
            valuation: valuation ? Number(valuation) : null,
            stage,
            timeline,
            team_size: team_size ? Number(team_size) : null,
            images: images || null,
            documents: documents || null,
            video_url: video_url || null,
            status: 'draft',
          })
          .select()
          .single()

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      case 'get': {
        const ideaId = url.searchParams.get('id')

        if (!ideaId) {
          return new Response(
            JSON.stringify({ error: 'Idea ID required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        const { data, error } = await supabaseClient
          .from('business_ideas')
          .select('*')
          .eq('id', ideaId)
          .single()

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      case 'list': {
        const status = url.searchParams.get('status') || 'published'
        const creatorId = url.searchParams.get('creator_id')
        const category = url.searchParams.get('category')
        const limit = parseInt(url.searchParams.get('limit') || '50')
        const offset = parseInt(url.searchParams.get('offset') || '0')

        let query = supabaseClient.from('business_ideas').select('*')

        if (status) {
          query = query.eq('status', status)
        }

        if (creatorId) {
          query = query.eq('creator_id', creatorId)
        }

        if (category) {
          query = query.eq('category', category)
        }

        query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false })

        const { data, error } = await query

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      case 'update': {
        if (req.method !== 'PUT') {
          return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            {
              status: 405,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        const ideaId = url.searchParams.get('id')

        if (!ideaId) {
          return new Response(
            JSON.stringify({ error: 'Idea ID required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        const body = await req.json()
        const updates = { ...body, updated_at: new Date().toISOString() }

        const { data, error } = await supabaseClient
          .from('business_ideas')
          .update(updates)
          .eq('id', ideaId)
          .eq('creator_id', user.id) // Ensure user can only update their own ideas
          .select()
          .single()

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      case 'delete': {
        if (req.method !== 'DELETE') {
          return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            {
              status: 405,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        const ideaId = url.searchParams.get('id')

        if (!ideaId) {
          return new Response(
            JSON.stringify({ error: 'Idea ID required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        const { error } = await supabaseClient
          .from('business_ideas')
          .delete()
          .eq('id', ideaId)
          .eq('creator_id', user.id) // Ensure user can only delete their own ideas

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      case 'search': {
        const queryText = url.searchParams.get('q')
        const minAmount = url.searchParams.get('min_amount')
        const maxAmount = url.searchParams.get('max_amount')
        const stage = url.searchParams.get('stage')

        if (!queryText && !minAmount && !maxAmount && !stage) {
          return new Response(
            JSON.stringify({ error: 'Search parameters required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        let query = supabaseClient
          .from('business_ideas')
          .select('*')
          .eq('status', 'published')

        if (queryText) {
          query = query.or(`title.ilike.%${queryText}%,description.ilike.%${queryText}%,category.ilike.%${queryText}%`)
        }

        if (minAmount) {
          query = query.gte('funding_goal', Number(minAmount))
        }

        if (maxAmount) {
          query = query.lte('funding_goal', Number(maxAmount))
        }

        if (stage) {
          query = query.eq('stage', stage)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})