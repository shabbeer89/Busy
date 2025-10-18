// Responsive design utilities for mobile web compatibility

import { useState, useEffect } from 'react'

// Breakpoint constants (matching Tailwind defaults)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

export interface ResponsiveState {
  currentBreakpoint: Breakpoint | null
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

// Get current responsive state
export function getResponsiveState(): ResponsiveState {
  if (typeof window === 'undefined') {
    return {
      currentBreakpoint: null,
      width: 1024,
      height: 768,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    }
  }

  const width = window.innerWidth
  const height = window.innerHeight

  let currentBreakpoint: Breakpoint | null = null
  if (width >= BREAKPOINTS['2xl']) currentBreakpoint = '2xl'
  else if (width >= BREAKPOINTS.xl) currentBreakpoint = 'xl'
  else if (width >= BREAKPOINTS.lg) currentBreakpoint = 'lg'
  else if (width >= BREAKPOINTS.md) currentBreakpoint = 'md'
  else if (width >= BREAKPOINTS.sm) currentBreakpoint = 'sm'

  return {
    currentBreakpoint,
    width,
    height,
    isMobile: width < BREAKPOINTS.md,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
  }
}

// Hook for responsive state
export function useResponsive() {
  const [state, setState] = useState(getResponsiveState())

  useEffect(() => {
    const handleResize = () => {
      setState(getResponsiveState())
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  return state
}

// Media query utilities
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [query])

  return matches
}

// Predefined media query hooks
export const useIsMobile = () => useMediaQuery(`(max-width: ${BREAKPOINTS.md - 1}px)`)
export const useIsTablet = () => useMediaQuery(`(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`)
export const useIsDesktop = () => useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`)
export const useIsTouchDevice = () => useMediaQuery('(hover: none) and (pointer: coarse)')

// Container query utilities for modern browsers
export function useContainerQuery(containerSelector: string, query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const container = document.querySelector(containerSelector) as Element
    if (!container || !(container as any).matches) return

    const containerQuery = `(container: ${query})`
    const mediaQuery = window.matchMedia(containerQuery)

    // Check if container queries are supported
    if (CSS.supports('container-type: inline-size')) {
      setMatches(mediaQuery.matches)

      const handleChange = (event: MediaQueryListEvent) => {
        setMatches(event.matches)
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      // Fallback to width-based detection
      const updateMatches = () => {
        const rect = container.getBoundingClientRect()
        const matchesQuery = query.includes('min-width')
          ? rect.width >= parseInt(query.match(/\d+/)?.[0] || '0')
          : rect.width <= parseInt(query.match(/\d+/)?.[0] || '0')
        setMatches(matchesQuery)
      }

      updateMatches()
      window.addEventListener('resize', updateMatches)

      return () => window.removeEventListener('resize', updateMatches)
    }
  }, [containerSelector, query])

  return matches
}

// Responsive value utilities
export function getResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>): T | undefined {
  const { currentBreakpoint } = getResponsiveState()

  if (!currentBreakpoint) return undefined

  // Find the most specific breakpoint that matches
  const breakpointOrder: Breakpoint[] = ['sm', 'md', 'lg', 'xl', '2xl']
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint)

  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i]
    if (values[bp] !== undefined) {
      return values[bp]
    }
  }

  return undefined
}

export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>): T | undefined {
  const { currentBreakpoint } = useResponsive()
  const [value, setValue] = useState<T | undefined>(() => getResponsiveValue(values))

  useEffect(() => {
    setValue(getResponsiveValue(values))
  }, [currentBreakpoint, values])

  return value
}

// Responsive spacing utilities
export const RESPONSIVE_SPACING = {
  xs: { mobile: '0.25rem', tablet: '0.5rem', desktop: '0.75rem' },
  sm: { mobile: '0.5rem', tablet: '0.75rem', desktop: '1rem' },
  md: { mobile: '1rem', tablet: '1.25rem', desktop: '1.5rem' },
  lg: { mobile: '1.5rem', tablet: '2rem', desktop: '2.5rem' },
  xl: { mobile: '2rem', tablet: '3rem', desktop: '4rem' },
  '2xl': { mobile: '3rem', tablet: '4rem', desktop: '5rem' },
} as const

export type SpacingSize = keyof typeof RESPONSIVE_SPACING

export function getResponsiveSpacing(size: SpacingSize): string {
  const { isMobile, isTablet } = getResponsiveState()

  if (isMobile) return RESPONSIVE_SPACING[size].mobile
  if (isTablet) return RESPONSIVE_SPACING[size].tablet
  return RESPONSIVE_SPACING[size].desktop
}

// Responsive typography utilities
export const RESPONSIVE_TYPOGRAPHY = {
  xs: { mobile: '0.75rem', tablet: '0.875rem', desktop: '1rem' },
  sm: { mobile: '0.875rem', tablet: '1rem', desktop: '1.125rem' },
  base: { mobile: '1rem', tablet: '1.125rem', desktop: '1.25rem' },
  lg: { mobile: '1.125rem', tablet: '1.25rem', desktop: '1.5rem' },
  xl: { mobile: '1.25rem', tablet: '1.5rem', desktop: '1.875rem' },
  '2xl': { mobile: '1.5rem', tablet: '2rem', desktop: '2.5rem' },
  '3xl': { mobile: '1.875rem', tablet: '2.5rem', desktop: '3rem' },
} as const

export type TypographySize = keyof typeof RESPONSIVE_TYPOGRAPHY

export function getResponsiveTypography(size: TypographySize): string {
  const { isMobile, isTablet } = getResponsiveState()

  if (isMobile) return RESPONSIVE_TYPOGRAPHY[size].mobile
  if (isTablet) return RESPONSIVE_TYPOGRAPHY[size].tablet
  return RESPONSIVE_TYPOGRAPHY[size].desktop
}