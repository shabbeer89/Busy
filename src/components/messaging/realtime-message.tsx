"use client"

import { useState, useRef, useEffect } from 'react'
import { useRealtimeMessaging } from '@/hooks/use-realtime-messaging'
import { Card, CustomInput } from '@/components/responsive/layout'
import { createClient } from '@/lib/supabase-client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { VideoCallButton, MediaUpload } from '@/components/video/video-calling'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  Send,
  MoreVertical,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  Paperclip,
  Smile,
  Image as ImageIcon,
  File
} from 'lucide-react'
import type { Database } from '@/types/supabase'

type Message = Database['public']['Tables']['messages']['Row']

interface RealtimeMessageProps {
  conversationId: string
  currentUserId: string
  otherUserName?: string
  otherUserAvatar?: string
  className?: string
}

export function RealtimeMessage({
  conversationId,
  currentUserId,
  otherUserName,
  otherUserAvatar,
  className,
}: RealtimeMessageProps) {
  const [messageText, setMessageText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection from hidden input
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Determine file type based on MIME type
      let fileType: 'image' | 'video' | 'document' = 'document'
      if (file.type.startsWith('image/')) {
        fileType = 'image'
      } else if (file.type.startsWith('video/')) {
        fileType = 'video'
      }

      handleFileUpload(file, fileType)
    }
    // Reset the input value so the same file can be selected again
    event.target.value = ''
  }

  const {
    messages,
    isLoading,
    error,
    isConnected,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
  } = useRealtimeMessaging({
    conversationId,
    enabled: true,
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value)

    if (e.target.value && !messageText) {
      startTyping()
    } else if (!e.target.value) {
      stopTyping()
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim()) return

    try {
      await sendMessage(messageText)
      setMessageText('')
      stopTyping()
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handle file upload
  const handleFileUpload = async (file: File, type: 'image' | 'video' | 'document') => {
    setIsUploading(true)
    setShowAttachmentMenu(false)

    try {
      // Create local Supabase client instance
      const localSupabase = createClient()

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${conversationId}/${Date.now()}.${fileExt}`

      const { data, error } = await localSupabase.storage
        .from('message-attachments')
        .upload(fileName, file)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = localSupabase.storage
        .from('message-attachments')
        .getPublicUrl(fileName)

      // Send file message with type indicator
      const typeLabel = type === 'image' ? 'Image' : type === 'video' ? 'Video' : 'Document'
      await sendMessage(`${typeLabel}: ${file.name} - ${publicUrl}`, 'system')
    } catch (error) {
      console.error('Error uploading file:', error)
      // Use the error state from the hook if available
      if (window) {
        // Fallback error handling
        console.error('Upload failed')
      }
    } finally {
      setIsUploading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,video/*,application/*"
        onChange={handleFileSelect}
      />
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {otherUserName ? getInitials(otherUserName) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">
              {otherUserName || 'Unknown User'}
            </span>
            <div className="flex items-center space-x-2">
              {!isConnected && (
                <Badge variant="outline" className="text-xs">
                  Offline
                </Badge>
              )}
              {typingUsers.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {typingUsers[0].user_name} is typing...
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <VideoCallButton
            conversationId={conversationId}
            otherUserName={otherUserName}
            variant="ghost"
            size="sm"
          />
          <Button variant="ghost" size="sm">
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {isLoading && messages.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              {error}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === currentUserId
              const isSystemMessage = message.type === 'system'

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    isOwn ? "justify-end" : "justify-start",
                    isSystemMessage && "justify-center"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg px-3 py-2",
                      isSystemMessage
                        ? "bg-muted/50 text-muted-foreground text-center text-xs italic"
                        : isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isSystemMessage && message.content.startsWith('File:') ? (
                      <div className="flex items-center space-x-2">
                        <Paperclip className="h-3 w-3" />
                        <span className="text-xs">
                          {message.content.replace('File: ', '')}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}

                    {!isSystemMessage && (
                      <div className={cn(
                        "flex items-center justify-end space-x-1 mt-1",
                        isOwn ? "text-primary-foreground/70" : "text-muted-foreground/70"
                      )}>
                        <span className="text-xs">
                          {formatDistanceToNow(new Date(message.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                        {isOwn && (
                          <div className="flex items-center">
                            {message.read ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-background">
        {typingUsers.length > 0 && (
          <div className="text-xs text-muted-foreground mb-2 px-2">
            {typingUsers.map(user => user.user_name).join(', ')} typing...
          </div>
        )}

        <div className="space-y-3">
          {/* Attachment Preview Area */}
          {isUploading && (
            <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded-md">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">Uploading file...</span>
            </div>
          )}

          {/* Attachment Menu */}
          {showAttachmentMenu && (
            <div className="flex space-x-2 p-2 bg-muted/30 rounded-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAttachmentMenu(false)
                  fileInputRef.current?.click()
                }}
                className="flex items-center space-x-1"
              >
                <ImageIcon className="h-4 w-4" />
                <span className="text-xs">Photo</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAttachmentMenu(false)
                  fileInputRef.current?.click()
                }}
                className="flex items-center space-x-1"
              >
                <File className="h-4 w-4" />
                <span className="text-xs">Document</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAttachmentMenu(false)
                  fileInputRef.current?.click()
                }}
                className="flex items-center space-x-1"
              >
                <Paperclip className="h-4 w-4" />
                <span className="text-xs">File</span>
              </Button>
            </div>
          )}

          <div className="flex space-x-2">
            <div className="flex-1">
              <CustomInput
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="min-h-10"
              />
            </div>

            {/* Attachment Upload */}
            <MediaUpload
              onFileSelect={handleFileUpload}
              disabled={isUploading}
              className="px-2"
            />

            {/* Emoji Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmoji(!showEmoji)}
              className="px-2"
            >
              <Smile className="h-4 w-4" />
            </Button>

            <Button
              variant="default"
              size="default"
              onClick={handleSendMessage}
              disabled={!messageText.trim() || isUploading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}

// Message list component for conversations overview
interface MessageListProps {
  conversations: Array<{
    id: string
    otherUser: {
      name: string
      avatar?: string
    }
    lastMessage?: Message
    unreadCount: number
  }>
  onConversationSelect: (conversationId: string) => void
  currentUserId: string
}

export function MessageList({
  conversations,
  onConversationSelect,
  currentUserId,
}: MessageListProps) {
  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <Card
          key={conversation.id}
          className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => onConversationSelect(conversation.id)}
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {conversation.otherUser.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium truncate">
                  {conversation.otherUser.name}
                </h3>
                {conversation.lastMessage && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.lastMessage.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>

              {conversation.lastMessage ? (
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {conversation.lastMessage.content}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  No messages yet
                </p>
              )}
            </div>

            {conversation.unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
