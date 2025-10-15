"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/responsive/layout";
import { RealtimeMessage, MessageList } from "@/components/messaging/realtime-message";
import { SidebarLayout } from "@/components/navigation/sidebar";
import { createClient } from "@/lib/supabase-client";

interface ConversationData {
  id: string
  otherUser: {
    name: string
    avatar?: string
  }
  lastMessage?: {
    id: string
    conversation_id: string
    sender_id: string
    content: string
    type: "text" | "system"
    read: boolean
    read_at: string | null
    created_at: string
    updated_at: string
  }
  unreadCount: number
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  // Load conversations for the current user
  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      setIsLoading(true);
      try {
        // Get user's conversations from the database
        const { data: userConversations, error } = await (supabase as any)
          .from('conversations')
          .select(`
            *,
            matches(*)
          `)
          .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error loading conversations:', error);
          return;
        }

        // Transform conversations data
        const transformedConversations: ConversationData[] = await Promise.all(
          (userConversations || []).map(async (conv: any) => {
            // Determine the other user
            const otherUserId = conv.participant1_id === user.id
              ? conv.participant2_id
              : conv.participant1_id;

            // Get other user profile
            const { data: otherUserProfile } = await (supabase as any)
              .from('users')
              .select('*')
              .eq('id', otherUserId)
              .single();

            // Get unread count
            const { count: unreadCount } = await (supabase as any)
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .eq('read', false)
              .neq('sender_id', user.id);

            // Get last message for this conversation
            const { data: lastMessageData } = await (supabase as any)
              .from('messages')
              .select('*')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            return {
              id: conv.id,
              otherUser: {
                name: otherUserProfile?.name || 'Unknown User',
                avatar: otherUserProfile?.avatar,
              },
              lastMessage: lastMessageData ? {
                id: lastMessageData.id,
                conversation_id: lastMessageData.conversation_id,
                sender_id: lastMessageData.sender_id,
                content: lastMessageData.content,
                type: lastMessageData.type,
                read: lastMessageData.read,
                read_at: lastMessageData.read_at,
                created_at: lastMessageData.created_at,
                updated_at: lastMessageData.updated_at,
              } : undefined,
              unreadCount: unreadCount || 0,
            };
          })
        );

        setConversations(transformedConversations);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [user, supabase]);

  if (!user) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-slate-300 mb-4">Please sign in to view your messages.</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="flex h-full">
        {/* Conversations List - Hidden on mobile when conversation is selected */}
        {(!selectedConversationId) && (
          <div className="w-full lg:w-1/3 border-r border-slate-700">
            <div className="p-4 border-b border-slate-700">
              <h1 className="text-xl font-bold text-white">Messages</h1>
              <p className="text-sm text-slate-400 mt-1">
                Communicate with matched {user.userType === "creator" ? "investors" : "creators"}
              </p>
            </div>

            <div className="overflow-y-auto h-full pb-20">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-slate-400">No conversations yet</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Start a conversation from your matches
                  </p>
                </div>
              ) : (
                <MessageList
                  conversations={conversations}
                  onConversationSelect={setSelectedConversationId}
                  currentUserId={user.id}
                />
              )}
            </div>
          </div>
        )}

        {/* Messages Area */}
        {selectedConversationId ? (
          <div className="flex-1">
            <div className="h-full">
              <RealtimeMessage
                conversationId={selectedConversationId}
                currentUserId={user.id}
                otherUserName={conversations.find(c => c.id === selectedConversationId)?.otherUser.name}
                otherUserAvatar={conversations.find(c => c.id === selectedConversationId)?.otherUser.avatar}
              />
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-slate-400">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
