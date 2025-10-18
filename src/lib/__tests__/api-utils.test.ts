import { APIError, API_ERRORS, validateRequest, createApiResponse, handleApiError } from '../api-utils'
import { NextRequest, NextResponse } from 'next/server'

describe('API Utils', () => {
  describe('APIError', () => {
    it('should create API error with correct properties', () => {
      const error = API_ERRORS.VALIDATION_ERROR({ field: 'test' })

      expect(error).toBeInstanceOf(Error)
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.message).toBe('Invalid request data')
      expect(error.statusCode).toBe(400)
      expect(error.details).toEqual({ field: 'test' })
    })

    it('should create different types of API errors', () => {
      const unauthorized = API_ERRORS.UNAUTHORIZED()
      const notFound = API_ERRORS.NOT_FOUND('User')
      const conflict = API_ERRORS.CONFLICT('Email already exists')

      expect(unauthorized.code).toBe('UNAUTHORIZED')
      expect(unauthorized.statusCode).toBe(401)

      expect(notFound.code).toBe('NOT_FOUND')
      expect(notFound.message).toBe('User not found')

      expect(conflict.code).toBe('CONFLICT')
      expect(conflict.message).toBe('Email already exists')
    })
  })

  describe('createApiResponse', () => {
    it('should create successful API response', () => {
      const data = { id: 1, name: 'Test' }
      const response = createApiResponse(data, 'Success message')

      expect(response).toBeInstanceOf(NextResponse)
    })

    it('should handle response without message', () => {
      const data = { id: 1 }
      const response = createApiResponse(data)

      expect(response).toBeInstanceOf(NextResponse)
    })
  })

  describe('handleApiError', () => {
    it('should handle APIError instances', () => {
      const error = API_ERRORS.VALIDATION_ERROR()
      const request = new NextRequest('http://localhost:3000')

      const response = handleApiError(error, request, 'TEST_CONTEXT')

      expect(response).toBeInstanceOf(NextResponse)
    })

    it('should handle generic Error instances', () => {
      const error = new Error('Generic error')
      const request = new NextRequest('http://localhost:3000')

      const response = handleApiError(error, request)

      expect(response).toBeInstanceOf(NextResponse)
    })

    it('should handle unknown error types', () => {
      const request = new NextRequest('http://localhost:3000')

      const response = handleApiError('string error', request)

      expect(response).toBeInstanceOf(NextResponse)
    })
  })
})