import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      case 'create-conversation': {
        if (req.method !== 'POST') {
          return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const body = await req.json()
        const { match_id, other_user_id } = body

        if (!match_id || !other_user_id) {
          return new Response(
            JSON.stringify({ error: 'Match ID and other user ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Verify the match exists and user is part of it
        const { data: match, error: matchError } = await supabaseClient
          .from('matches')
          .select('*')
          .eq('id', match_id)
          .or(`investor_id.eq.${user.id},creator_id.eq.${user.id}`)
          .single()

        if (matchError || !match) {
          return new Response(
            JSON.stringify({ error: 'Match not found or access denied' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check if conversation already exists
        const { data: existingConversation } = await supabaseClient
          .from('conversations')
          .select('*')
          .eq('match_id', match_id)
          .single()

        if (existingConversation) {
          return new Response(
            JSON.stringify({ success: true, data: existingConversation }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Create new conversation
        const { data: conversation, error: conversationError } = await supabaseClient
          .from('conversations')
          .insert({
            match_id,
            participant1_id: user.id,
            participant2_id: other_user_id,
          })
          .select()
          .single()

        if (conversationError) {
          return new Response(
            JSON.stringify({ error: conversationError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data: conversation }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'send-message': {
        if (req.method !== 'POST') {
          return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const body = await req.json()
        const { conversation_id, content, type = 'text' } = body

        if (!conversation_id || !content) {
          return new Response(
            JSON.stringify({ error: 'Conversation ID and content required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Verify user has access to conversation
        const { data: conversation, error: conversationError } = await supabaseClient
          .from('conversations')
          .select('*')
          .eq('id', conversation_id)
          .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
          .single()

        if (conversationError || !conversation) {
          return new Response(
            JSON.stringify({ error: 'Conversation not found or access denied' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Send message
        const { data: message, error: messageError } = await supabaseClient
          .from('messages')
          .insert({
            conversation_id,
            sender_id: user.id,
            content,
            type,
            read: false,
          })
          .select()
          .single()

        if (messageError) {
          return new Response(
            JSON.stringify({ error: messageError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Update conversation last message info
        await supabaseClient
          .from('conversations')
          .update({
            last_message_id: message.id,
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', conversation_id)

        return new Response(
          JSON.stringify({ success: true, data: message }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get-messages': {
        const conversationId = url.searchParams.get('conversation_id')

        if (!conversationId) {
          return new Response(
            JSON.stringify({ error: 'Conversation ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Verify user has access to conversation
        const { data: conversation, error: conversationError } = await supabaseClient
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
          .single()

        if (conversationError || !conversation) {
          return new Response(
            JSON.stringify({ error: 'Conversation not found or access denied' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Get messages
        const { data: messages, error: messagesError } = await supabaseClient
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })

        if (messagesError) {
          return new Response(
            JSON.stringify({ error: messagesError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Mark messages as read
        await supabaseClient
          .from('messages')
          .update({ read: true, read_at: new Date().toISOString() })
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id)
          .eq('read', false)

        return new Response(
          JSON.stringify({ success: true, data: messages }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get-conversations': {
        const { data: conversations, error } = await supabaseClient
          .from('conversations')
          .select(`
            *,
            messages(*),
            matches(*)
          `)
          .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
          .order('updated_at', { ascending: false })

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data: conversations }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'mark-as-read': {
        if (req.method !== 'PUT') {
          return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const conversationId = url.searchParams.get('conversation_id')

        if (!conversationId) {
          return new Response(
            JSON.stringify({ error: 'Conversation ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error } = await supabaseClient
          .from('messages')
          .update({ read: true, read_at: new Date().toISOString() })
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id)
          .eq('read', false)

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true }),
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