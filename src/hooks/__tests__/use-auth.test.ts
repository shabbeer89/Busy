import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../use-auth'

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return authentication state', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current).toHaveProperty('user')
    expect(result.current).toHaveProperty('isAuthenticated')
    expect(result.current).toHaveProperty('isLoading')
    expect(typeof result.current.signIn).toBe('function')
    expect(typeof result.current.signUp).toBe('function')
    expect(typeof result.current.signOut).toBe('function')
    expect(typeof result.current.verifyPhoneNumber).toBe('function')
    expect(typeof result.current.hasValidId).toBe('function')
  })

  it('should validate user ID correctly', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.hasValidId('demo_123456')).toBe(true)
    expect(result.current.hasValidId('oauth_1234567890')).toBe(true)
    expect(result.current.hasValidId('')).toBe(false)
    expect(result.current.hasValidId(undefined)).toBe(false)
    expect(result.current.hasValidId('invalid')).toBe(false)
  })
})