"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from '@/hooks/use-auth'
import type { Database } from '@/types/supabase'

type Message = Database['public']['Tables']['messages']['Row']
type Conversation = Database['public']['Tables']['conversations']['Row']
type MessageInsert = Database['public']['Tables']['messages']['Insert']

interface UseRealtimeMessagingProps {
  conversationId?: string
  enabled?: boolean
}

interface TypingUser {
  user_id: string
  user_name: string
  timestamp: number
}

export function useRealtimeMessaging({
  conversationId,
  enabled = true
}: UseRealtimeMessagingProps = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const supabase = createClient()
  const { user } = useAuth()
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const channelRef = useRef<any>(null)

  // Load messages for a conversation
  const loadMessages = useCallback(async (convId: string) => {
    if (!convId) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })

      if (error) {
        setError(error.message)
        return
      }

      setMessages(data || [])
    } catch (err) {
      setError('Failed to load messages')
      console.error('Error loading messages:', err)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Load conversation details
  const loadConversation = useCallback(async (convId: string) => {
    if (!convId) return

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', convId)
        .single()

      if (error) {
        setError(error.message)
        return
      }

      setConversation(data)
    } catch (err) {
      console.error('Error loading conversation:', err)
    }
  }, [supabase])

  // Send a message
  const sendMessage = useCallback(async (content: string, type: 'text' | 'system' = 'text') => {
    if (!conversationId || !user || !content.trim()) return

    try {
      const messageData: MessageInsert = {
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
        type,
        read: false,
      }

      const { data, error } = await (supabase as any)
        .from('messages')
        .insert(messageData)
        .select()
        .single()

      if (error) {
        setError(error.message)
        return
      }

      // Update conversation last message info
      await (supabase as any)
        .from('conversations')
        .update({
          last_message_id: data.id,
          last_message_at: data.created_at,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)

      // Optimistically add message to local state
      setMessages(prev => [...prev, data])

      return data
    } catch (err) {
      setError('Failed to send message')
      console.error('Error sending message:', err)
      throw err
    }
  }, [conversationId, user, supabase])

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!conversationId || !user) return

    try {
      await (supabase as any)
        .from('messages')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('read', false)

      // Update local state
      setMessages(prev =>
        prev.map(msg =>
          msg.sender_id !== user.id && !msg.read
            ? { ...msg, read: true, read_at: new Date().toISOString() }
            : msg
        )
      )
    } catch (err) {
      console.error('Error marking messages as read:', err)
    }
  }, [conversationId, user, supabase])

  // Handle typing indicators
  const startTyping = useCallback(() => {
    if (!conversationId || !user) return

    // Send typing indicator to channel
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: user.id,
          user_name: user.name || 'Anonymous',
          conversation_id: conversationId,
        }
      })
    }

    // Set timeout to stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 3000)
  }, [conversationId, user])

  const stopTyping = useCallback(() => {
    if (!conversationId || !user) return

    // Send stop typing indicator
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'stop_typing',
        payload: {
          user_id: user.id,
          conversation_id: conversationId,
        }
      })
    }

    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }, [conversationId, user])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!enabled || !conversationId || !user) return

    // Create channel for this conversation
    const channel = supabase.channel(`conversation:${conversationId}`, {
      config: {
        broadcast: { self: true },
        presence: { key: user.id },
      },
    })

    channelRef.current = channel

    // Subscribe to new messages
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message

          // Only add if it's not already in the state (avoid duplicates)
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id)
            return exists ? prev : [...prev, newMessage]
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message

          setMessages(prev =>
            prev.map(msg =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          )
        }
      )
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.conversation_id === conversationId && payload.user_id !== user.id) {
          setTypingUsers(prev => {
            const existing = prev.find(u => u.user_id === payload.user_id)
            if (existing) {
              return prev.map(u =>
                u.user_id === payload.user_id
                  ? { ...u, timestamp: Date.now() }
                  : u
              )
            }
            return [...prev, {
              user_id: payload.user_id,
              user_name: payload.user_name,
              timestamp: Date.now(),
            }]
          })
        }
      })
      .on('broadcast', { event: 'stop_typing' }, ({ payload }) => {
        if (payload.conversation_id === conversationId) {
          setTypingUsers(prev => prev.filter(u => u.user_id !== payload.user_id))
        }
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    // Load initial data
    loadMessages(conversationId)
    loadConversation(conversationId)

    // Mark messages as read when entering conversation
    markAsRead()

    // Cleanup function
    return () => {
      stopTyping()
      channel.unsubscribe()
    }
  }, [conversationId, user, enabled, supabase, loadMessages, loadConversation, markAsRead, stopTyping])

  // Clean up typing indicators when unmounting
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  return {
    messages,
    conversation,
    isLoading,
    error,
    isConnected,
    typingUsers,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    loadMessages,
  }
}
