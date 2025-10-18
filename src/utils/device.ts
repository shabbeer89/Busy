// Mobile device detection and responsive utilities
import { useState, useEffect, useRef, useCallback } from 'react'

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isIOS: boolean
  isAndroid: boolean
  isTouchDevice: boolean
  screenSize: 'mobile' | 'tablet' | 'desktop'
  orientation: 'portrait' | 'landscape'
}

export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isIOS: false,
      isAndroid: false,
      isTouchDevice: false,
      screenSize: 'desktop',
      orientation: 'landscape',
    }
  }

  const userAgent = navigator.userAgent.toLowerCase()
  const width = window.innerWidth
  const height = window.innerHeight

  // Device type detection
  const isIOS = /ipad|iphone|ipod/.test(userAgent)
  const isAndroid = /android/.test(userAgent)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  // Screen size categories
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024
  const isDesktop = width >= 1024

  // Orientation
  const orientation = height > width ? 'portrait' : 'landscape'

  return {
    isMobile,
    isTablet,
    isDesktop,
    isIOS,
    isAndroid,
    isTouchDevice,
    screenSize: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    orientation,
  }
}

export function useDeviceInfo() {
  if (typeof window === 'undefined') {
    return getDeviceInfo()
  }

  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo())

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(getDeviceInfo())
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  return deviceInfo
}

// Viewport utilities
export function setViewportHeight() {
  if (typeof window === 'undefined') return

  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

export function useViewportHeight() {
  useEffect(() => {
    setViewportHeight()

    const handleResize = () => {
      setViewportHeight()
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])
}

// Touch gesture utilities
export interface TouchPosition {
  x: number
  y: number
}

export interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down'
  distance: number
  velocity: number
  startTime: number
  endTime: number
}

export function useSwipeGesture(
  onSwipe: (gesture: SwipeGesture) => void,
  minDistance: number = 50,
  maxTime: number = 1000
) {
  const touchStart = useRef<TouchPosition | null>(null)
  const touchEnd = useRef<TouchPosition | null>(null)
  const startTime = useRef<number>(0)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
    startTime.current = Date.now()
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return

    const touch = e.changedTouches[0]
    touchEnd.current = { x: touch.clientX, y: touch.clientY }

    const deltaX = touchEnd.current.x - touchStart.current.x
    const deltaY = touchEnd.current.y - touchStart.current.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const endTime = Date.now()
    const timeDiff = endTime - startTime.current

    if (distance >= minDistance && timeDiff <= maxTime) {
      const velocity = distance / timeDiff

      // Determine direction
      let direction: 'left' | 'right' | 'up' | 'down'
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left'
      } else {
        direction = deltaY > 0 ? 'down' : 'up'
      }

      onSwipe({
        direction,
        distance,
        velocity,
        startTime: startTime.current,
        endTime,
      })
    }

    // Reset
    touchStart.current = null
    touchEnd.current = null
  }, [minDistance, maxTime, onSwipe])

  useEffect(() => {
    if (typeof window === 'undefined') return

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchEnd])
}

// Safe area utilities for notched devices
export function getSafeAreaInsets(): {
  top: number
  right: number
  bottom: number
  left: number
} {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }

  // Use CSS environment variables if available (iOS Safari 11.2+)
  const computedStyle = getComputedStyle(document.documentElement)

  return {
    top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0'),
  }
}