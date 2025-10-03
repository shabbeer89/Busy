"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { SidebarLayout } from "@/components/navigation/sidebar";

interface Message {
  id: string;
  matchId: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: number;
  read: boolean;
  type: "text" | "system";
}

interface Conversation {
  id: string;
  matchId: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
    userType: "creator" | "investor";
  };
  lastMessage: Message;
  unreadCount: number;
  updatedAt: number;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock conversations data
    const mockConversations: Conversation[] = [
      {
        id: "1",
        matchId: "match1",
        otherUser: {
          id: "investor1",
          name: "Jane Doe",
          userType: "investor",
        },
        lastMessage: {
          id: "msg1",
          matchId: "match1",
          senderId: "investor1",
          recipientId: "creator1",
          content: "Hi! I'm very interested in your AI assistant idea. Could we schedule a call?",
          timestamp: Date.now() - 3600000, // 1 hour ago
          read: false,
          type: "text",
        },
        unreadCount: 2,
        updatedAt: Date.now() - 3600000,
      },
      {
        id: "2",
        matchId: "match2",
        otherUser: {
          id: "creator2",
          name: "Mike Johnson",
          userType: "creator",
        },
        lastMessage: {
          id: "msg2",
          matchId: "match2",
          senderId: "creator2",
          recipientId: "investor1",
          content: "Thank you for your interest! The current valuation is $3M pre-money.",
          timestamp: Date.now() - 86400000, // 1 day ago
          read: true,
          type: "text",
        },
        unreadCount: 0,
        updatedAt: Date.now() - 86400000,
      },
      {
        id: "3",
        matchId: "match3",
        otherUser: {
          id: "investor2",
          name: "Sarah Wilson",
          userType: "investor",
        },
        lastMessage: {
          id: "msg3",
          matchId: "match3",
          senderId: "investor2",
          recipientId: "creator1",
          content: "Great pitch deck! I have a few questions about your go-to-market strategy.",
          timestamp: Date.now() - 172800000, // 2 days ago
          read: true,
          type: "text",
        },
        unreadCount: 0,
        updatedAt: Date.now() - 172800000,
      },
    ];

    setConversations(mockConversations);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      // Mock messages for selected conversation
      const mockMessages: Message[] = [
        {
          id: "msg1",
          matchId: selectedConversation.matchId,
          senderId: "investor1",
          recipientId: "creator1",
          content: "Hi! I'm very interested in your AI assistant idea. Could we schedule a call?",
          timestamp: Date.now() - 3600000,
          read: false,
          type: "text",
        },
        {
          id: "msg2",
          matchId: selectedConversation.matchId,
          senderId: "creator1",
          recipientId: "investor1",
          content: "Hi Jane! Thanks for your interest. I'd be happy to schedule a call. What's your availability this week?",
          timestamp: Date.now() - 3300000,
          read: true,
          type: "text",
        },
        {
          id: "msg3",
          matchId: selectedConversation.matchId,
          senderId: "investor1",
          recipientId: "creator1",
          content: "I'm available Thursday afternoon or Friday morning. Also, could you send me your financial projections?",
          timestamp: Date.now() - 3000000,
          read: false,
          type: "text",
        },
      ];

      setMessages(mockMessages);
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: `msg_${Date.now()}`,
      matchId: selectedConversation.matchId,
      senderId: user!.id,
      recipientId: selectedConversation.otherUser.id,
      content: newMessage,
      timestamp: Date.now(),
      read: false,
      type: "text",
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // Update conversation's last message
    setConversations(prev => prev.map(conv =>
      conv.id === selectedConversation.id
        ? { ...conv, lastMessage: message, updatedAt: Date.now() }
        : conv
    ));
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please sign in to view your messages.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
          <SidebarLayout>
    
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-2">
            Communicate with matched {user.userType === "creator" ? "investors" : "creators"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 h-[600px]">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Conversations</h2>
            </div>
            <div className="overflow-y-auto h-full">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start a conversation from your matches</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedConversation?.id === conversation.id ? "bg-blue-50 border-blue-200" : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-gray-600">
                          {conversation.otherUser.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 truncate">
                            {conversation.otherUser.name}
                          </p>
                          <div className="flex items-center gap-2">
                            {conversation.unreadCount > 0 && (
                              <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessage.timestamp)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage.content}
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
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {selectedConversation.otherUser.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {selectedConversation.otherUser.name}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {selectedConversation.otherUser.userType}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Link href={`/matches`}>
                      <Button variant="outline" size="sm">
                        View Match
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user!.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === user!.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === user!.id ? "text-blue-100" : "text-gray-500"
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-3">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </SidebarLayout>
  );
}