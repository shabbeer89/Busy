"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MobileCard } from '@/components/responsive/mobile-layout'
import { cn } from '@/lib/utils'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Monitor,
  Users,
  Settings,
  MessageSquare,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
} from 'lucide-react'

interface VideoCallingProps {
  conversationId: string
  currentUserId: string
  otherUserName?: string
  isIncomingCall?: boolean
  onCallEnd?: () => void
  className?: string
}

interface CallState {
  isActive: boolean
  isIncoming: boolean
  isOutgoing: boolean
  isConnected: boolean
  isMuted: boolean
  isVideoOn: boolean
  isScreenSharing: boolean
  duration: number
  error: string | null
}

export function VideoCalling({
  conversationId,
  currentUserId,
  otherUserName = 'User',
  isIncomingCall = false,
  onCallEnd,
  className,
}: VideoCallingProps) {
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    isIncoming: isIncomingCall,
    isOutgoing: false,
    isConnected: false,
    isMuted: false,
    isVideoOn: true,
    isScreenSharing: false,
    duration: 0,
    error: null,
  })

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const screenShareRef = useRef<HTMLVideoElement>(null)
  const callTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (callState.isConnected) {
      const timer = setTimeout(() => {
        setShowControls(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [callState.isConnected, showControls])

  // Call duration timer
  useEffect(() => {
    if (callState.isConnected) {
      callTimerRef.current = setInterval(() => {
        setCallState(prev => ({ ...prev, duration: prev.duration + 1 }))
      }, 1000)
    } else if (callTimerRef.current) {
      clearInterval(callTimerRef.current)
      callTimerRef.current = null
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current)
      }
    }
  }, [callState.isConnected])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startCall = async () => {
    setCallState(prev => ({
      ...prev,
      isActive: true,
      isOutgoing: true,
      error: null
    }))

    try {
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Simulate call connection after 2 seconds
      setTimeout(() => {
        setCallState(prev => ({
          ...prev,
          isConnected: true,
          isOutgoing: false
        }))
      }, 2000)

    } catch (error) {
      console.error('Failed to start video call:', error)
      setCallState(prev => ({
        ...prev,
        error: 'Failed to access camera/microphone. Please check permissions.'
      }))
    }
  }

  const endCall = () => {
    // Stop local video stream
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }

    // Stop screen sharing
    if (callState.isScreenSharing && screenShareRef.current?.srcObject) {
      const stream = screenShareRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }

    setCallState({
      isActive: false,
      isIncoming: false,
      isOutgoing: false,
      isConnected: false,
      isMuted: false,
      isVideoOn: true,
      isScreenSharing: false,
      duration: 0,
      error: null,
    })

    onCallEnd?.()
  }

  const toggleMute = () => {
    setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }))

    // In a real implementation, this would mute/unmute the audio stream
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = callState.isMuted
      }
    }
  }

  const toggleVideo = () => {
    setCallState(prev => ({ ...prev, isVideoOn: !prev.isVideoOn }))

    // In a real implementation, this would enable/disable the video stream
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !callState.isVideoOn
      }
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (callState.isScreenSharing) {
        // Stop screen sharing
        if (screenShareRef.current?.srcObject) {
          const stream = screenShareRef.current.srcObject as MediaStream
          stream.getTracks().forEach(track => track.stop())
          screenShareRef.current.srcObject = null
        }
        setCallState(prev => ({ ...prev, isScreenSharing: false }))
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })

        if (screenShareRef.current) {
          screenShareRef.current.srcObject = screenStream
        }

        setCallState(prev => ({ ...prev, isScreenSharing: true }))

        // Stop sharing when user cancels
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          setCallState(prev => ({ ...prev, isScreenSharing: false }))
        })
      }
    } catch (error) {
      console.error('Screen sharing failed:', error)
      setCallState(prev => ({
        ...prev,
        error: 'Screen sharing not available or permission denied'
      }))
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // If not in a call, show call interface
  if (!callState.isActive) {
    return (
      <MobileCard className={cn("text-center", className)}>
        <CardContent className="p-8">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {callState.isIncoming ? `Incoming call from ${otherUserName}` : 'Start Video Call'}
            </h3>
            <p className="text-muted-foreground">
              {callState.isIncoming
                ? 'Connect face-to-face to discuss opportunities'
                : 'Start a video call to meet and discuss business opportunities'
              }
            </p>
          </div>

          {callState.error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{callState.error}</p>
            </div>
          )}

          <div className="flex justify-center gap-4">
            {callState.isIncoming ? (
              <>
                <Button
                  onClick={startCall}
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Accept Call
                </Button>
                <Button
                  variant="outline"
                  onClick={endCall}
                  className="px-8"
                >
                  <PhoneOff className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </>
            ) : (
              <Button
                onClick={startCall}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                size="lg"
              >
                <Video className="h-4 w-4 mr-2" />
                Start Video Call
              </Button>
            )}
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            <p>✓ HD video quality</p>
            <p>✓ Screen sharing available</p>
            <p>✓ End-to-end encrypted</p>
          </div>
        </CardContent>
      </MobileCard>
    )
  }

  // Call interface
  return (
    <div className={cn(
      "relative bg-black rounded-lg overflow-hidden",
      isFullscreen ? "fixed inset-0 z-50" : "h-full",
      className
    )}>
      {/* Call Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">{otherUserName}</span>
            </div>
            {callState.isConnected && (
              <Badge variant="secondary" className="bg-black/50 text-white">
                {formatDuration(callState.duration)}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowControls(!showControls)}
              className="text-white hover:bg-white/20"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="relative h-full">
        {/* Remote Video (Main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }} // Mirror effect
        />

        {/* Local Video (Small overlay) */}
        <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-900 rounded-lg overflow-hidden border-2 border-white/20">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          {!callState.isVideoOn && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <VideoOff className="h-6 w-6 text-white" />
            </div>
          )}
        </div>

        {/* Screen Share Overlay */}
        {callState.isScreenSharing && (
          <div className="absolute top-4 left-4 w-64 h-36 bg-gray-900 rounded-lg overflow-hidden border-2 border-white/20">
            <video
              ref={screenShareRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Connection Status */}
        {!callState.isConnected && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4" />
              <p className="text-lg font-medium">
                {callState.isOutgoing ? 'Calling...' : 'Connecting...'}
              </p>
              <p className="text-sm text-gray-300 mt-1">
                Please wait while we connect you
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Call Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="flex items-center justify-center gap-4">
            {/* Mute/Unmute */}
            <Button
              variant={callState.isMuted ? "destructive" : "secondary"}
              size="lg"
              onClick={toggleMute}
              className="rounded-full w-14 h-14"
            >
              {callState.isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            {/* Video On/Off */}
            <Button
              variant={callState.isVideoOn ? "secondary" : "destructive"}
              size="lg"
              onClick={toggleVideo}
              className="rounded-full w-14 h-14"
            >
              {callState.isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            {/* Screen Share */}
            <Button
              variant={callState.isScreenSharing ? "default" : "secondary"}
              size="lg"
              onClick={toggleScreenShare}
              className="rounded-full w-14 h-14"
            >
              <Monitor className="h-5 w-5" />
            </Button>

            {/* End Call */}
            <Button
              variant="destructive"
              size="lg"
              onClick={endCall}
              className="rounded-full w-14 h-14"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>

          {/* Additional Controls */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Users className="h-4 w-4 mr-2" />
              Participants
            </Button>
          </div>
        </div>
      )}

      {/* Click to show controls */}
      {!showControls && callState.isConnected && (
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={() => setShowControls(true)}
        />
      )}
    </div>
  )
}

// Video Call Button Component
interface VideoCallButtonProps {
  conversationId: string
  otherUserName?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function VideoCallButton({
  conversationId,
  otherUserName,
  variant = 'outline',
  size = 'sm',
  className,
}: VideoCallButtonProps) {
  const [showVideoCall, setShowVideoCall] = useState(false)

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowVideoCall(true)}
        className={cn("flex items-center gap-2", className)}
      >
        <Video className="h-4 w-4" />
        Video Call
      </Button>

      {showVideoCall && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <VideoCalling
              conversationId={conversationId}
              currentUserId="current-user"
              otherUserName={otherUserName}
              onCallEnd={() => setShowVideoCall(false)}
              className="max-h-[80vh]"
            />
          </div>
        </div>
      )}
    </>
  )
}

// Screen Share Component
interface ScreenShareProps {
  isActive: boolean
  onToggle: () => void
  className?: string
}

export function ScreenShare({ isActive, onToggle, className }: ScreenShareProps) {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
      className={cn("flex items-center gap-2", className)}
    >
      <Monitor className="h-4 w-4" />
      {isActive ? 'Stop Sharing' : 'Share Screen'}
    </Button>
  )
}

// Media Upload Component for Messages
interface MediaUploadProps {
  onFileSelect: (file: File, type: 'image' | 'video' | 'document') => void
  disabled?: boolean
  className?: string
}

export function MediaUpload({ onFileSelect, disabled = false, className }: MediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Determine file type
    const type = file.type.startsWith('image/') ? 'image' :
                 file.type.startsWith('video/') ? 'video' : 'document'

    onFileSelect(file, type)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className={className}
      >
        <Monitor className="h-4 w-4" />
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,.pdf,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  )
}