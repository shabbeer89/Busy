"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { SidebarLayout } from "@/components/navigation/sidebar";
import { animations } from "@/lib/animations";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { useToast } from "@/components/ui/toast";

interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: number;
  read: boolean;
  type: "text" | "system";
  updatedAt: number;
}

interface Conversation {
  _id: string;
  matchId: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
    userType: "creator" | "investor";
  };
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: number;
  createdAt: number;
}

export default function MessagesPage() {
  const { user, hasValidConvexId } = useAuth();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [convexUserId, setConvexUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // For OAuth users, we need to ensure they have a Convex user record first
  const findOrCreateUserMutation = useMutation(api.users.findOrCreateUserByOAuth);

  // Handle OAuth user creation and get Convex user ID
  useEffect(() => {
    const setupUser = async () => {
      if (!user) return;

      // If user has a valid Convex ID, use it directly
      if (hasValidConvexId(user.id)) {
        setConvexUserId(user.id);
        return;
      }

      // For OAuth users, create/find Convex user record
      if (user.email && (user as any).provider) {
        try {
          const convexId = await findOrCreateUserMutation({
            oauthId: user.id,
            email: user.email,
            name: user.name || user.email.split('@')[0],
            provider: (user as any).provider,
          });

          if (convexId) {
            setConvexUserId(convexId);
          }
        } catch (error) {
          console.error("Error setting up OAuth user:", error);
        }
      }
    };

    setupUser();
  }, [user, hasValidConvexId, findOrCreateUserMutation]);

  // Convex queries and mutations
  const conversations = useQuery(
    api.messages.getConversationsForUser,
    convexUserId ? { userId: convexUserId as any } : "skip"
  );

  const messages = useQuery(
    api.messages.getMessages,
    selectedConversation ? { conversationId: selectedConversation._id as any } : "skip"
  );

  const sendMessageMutation = useMutation(api.messages.sendMessage);
  const markAsReadMutation = useMutation(api.messages.markMessagesAsRead);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && convexUserId) {
      markAsReadMutation({
        conversationId: selectedConversation._id as any,
        userId: convexUserId as any,
      });
    }
  }, [selectedConversation, convexUserId, markAsReadMutation]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !convexUserId || isSending) return;

    setIsSending(true);
    try {
      await sendMessageMutation({
        conversationId: selectedConversation._id as any,
        senderId: convexUserId as any,
        content: newMessage.trim(),
      });

      setNewMessage("");
      toast({
        title: "Message sent",
        description: "Your message has been delivered successfully.",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Failed to send message",
        description: "Please try again. If the problem persists, check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  if (!user) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Please sign in to view your messages.</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!convexUserId) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Account Setup Required</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your account needs to be updated. Please sign out and sign in again to get a proper account ID.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/login">
                <Button>Sign Out & Fix Account</Button>
              </Link>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (conversations === undefined) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading conversations...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  // Show loading state for messages when conversation is selected
  const isLoadingMessages = selectedConversation && messages === undefined;

  return (
          <SidebarLayout>
    
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Communicate with matched {user.userType === "creator" ? "investors" : "creators"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 h-[600px]">
          {/* Conversations List */}
          <Card className={`lg:col-span-1 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animations.cardHover} dark:bg-slate-800 dark:border-slate-700`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-y-auto h-full">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-600 dark:text-gray-300">
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start a conversation from your matches</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    className={`p-4 border-b border-border cursor-pointer hover:bg-accent ${
                      selectedConversation?._id === conversation._id ? "bg-accent" : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-gray-300">
                          {conversation.otherUser.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {conversation.otherUser.name}
                          </p>
                          <div className="flex items-center gap-2">
                            {conversation.unreadCount > 0 && (
                              <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs bg-blue-900/20 text-blue-400">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              {conversation.lastMessage ? formatTime(conversation.lastMessage.createdAt) : formatTime(conversation.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {conversation.lastMessage ? conversation.lastMessage.content : "No messages yet"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {conversation.otherUser.userType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              </div>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className={`lg:col-span-2 flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animations.cardHover} dark:bg-slate-800 dark:border-slate-700`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-300">
                        {selectedConversation.otherUser.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base text-gray-900 dark:text-white">
                        {selectedConversation.otherUser.name}
                      </CardTitle>
                      <CardDescription className="capitalize text-gray-600 dark:text-gray-300">
                        {selectedConversation.otherUser.userType}
                      </CardDescription>
                    </div>
                    <Link href={`/matches`}>
                      <Button variant="outline" size="sm">
                        View Match
                      </Button>
                    </Link>
                  </div>
                </CardHeader>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Loading messages...</p>
                      </div>
                    </div>
                  ) : messages && messages.length > 0 ? (
                    messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.senderId === user!.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === user!.id
                              ? "bg-blue-600 text-white"
                              : "bg-slate-700 text-gray-100 border border-slate-600"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === user!.id ? "text-blue-100" : "text-gray-400"
                          }`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-gray-600 dark:text-gray-300">No messages yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start the conversation!</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <CardFooter className="pt-6">
                  <div className="flex gap-3 w-full">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isSending}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSending}
                    >
                      {isSending ? "Sending..." : "Send"}
                    </Button>
                  </div>
                </CardFooter>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-300">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
    </SidebarLayout>
  );
}
