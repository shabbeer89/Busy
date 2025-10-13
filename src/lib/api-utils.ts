// API utility functions for consistent error handling and responses

import { NextRequest, NextResponse } from 'next/server'
import { ZodError, ZodSchema } from 'zod'

export interface ApiError {
  code: string
  message: string
  details?: any
  statusCode: number
}

export class APIError extends Error {
  public code: string
  public statusCode: number
  public details?: any

  constructor(code: string, message: string, statusCode: number = 500, details?: any) {
    super(message)
    this.name = 'APIError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

// Common API errors
export const API_ERRORS = {
  VALIDATION_ERROR: (details?: any) => new APIError('VALIDATION_ERROR', 'Invalid request data', 400, details),
  UNAUTHORIZED: () => new APIError('UNAUTHORIZED', 'Authentication required', 401),
  FORBIDDEN: () => new APIError('FORBIDDEN', 'Access denied', 403),
  NOT_FOUND: (resource?: string) => new APIError('NOT_FOUND', `${resource || 'Resource'} not found`, 404),
  CONFLICT: (message?: string) => new APIError('CONFLICT', message || 'Resource conflict', 409),
  RATE_LIMITED: () => new APIError('RATE_LIMITED', 'Too many requests', 429),
  INTERNAL_ERROR: (message?: string) => new APIError('INTERNAL_ERROR', message || 'Internal server error', 500),
  DATABASE_ERROR: (details?: any) => new APIError('DATABASE_ERROR', 'Database operation failed', 500, details),
  EXTERNAL_API_ERROR: (service?: string) => new APIError('EXTERNAL_API_ERROR', `${service || 'External service'} error`, 502),
} as const

// Request validation with Zod
export async function validateRequest<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof ZodError) {
      throw API_ERRORS.VALIDATION_ERROR({
        validationErrors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      })
    }
    throw API_ERRORS.VALIDATION_ERROR('Invalid JSON body')
  }
}

// Standardized API response
export function createApiResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  }, { status: statusCode })
}

// Standardized error response
export function createErrorResponse(
  error: APIError | Error | unknown,
  request: NextRequest
): NextResponse {
  let apiError: APIError

  if (error instanceof APIError) {
    apiError = error
  } else if (error instanceof Error) {
    apiError = API_ERRORS.INTERNAL_ERROR(error.message)
  } else {
    apiError = API_ERRORS.INTERNAL_ERROR('Unknown error occurred')
  }

  const response = NextResponse.json({
    success: false,
    error: {
      code: apiError.code,
      message: apiError.message,
      details: apiError.details,
      timestamp: new Date().toISOString()
    }
  }, { status: apiError.statusCode })

  // Add CORS headers for error responses
  const origin = request.headers.get('origin')
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  return response
}

// Handle API errors with logging
export function handleApiError(
  error: unknown,
  request: NextRequest,
  context?: string
): NextResponse {
  const errorContext = context ? `${context}: ` : ''

  if (error instanceof APIError) {
    console.error(`${errorContext}API Error [${error.code}]:`, error.message, error.details)
  } else if (error instanceof Error) {
    console.error(`${errorContext}Unexpected Error:`, error.message, error.stack)
  } else {
    console.error(`${errorContext}Unknown Error:`, error)
  }

  return createErrorResponse(error, request)
}

// Async error wrapper for API routes
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args)
    } catch (error) {
      // Re-throw APIError instances to be handled by route handlers
      if (error instanceof APIError) {
        throw error
      }

      // Wrap unexpected errors
      throw API_ERRORS.INTERNAL_ERROR(error instanceof Error ? error.message : 'Unexpected error')
    }
  }
}

// Rate limiting helper
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60 * 1000
): { allowed: boolean; resetTime: number } {
  // In-memory rate limiting (in production, use Redis or similar)
  const now = Date.now()
  const windowStart = now - windowMs

  // This is a simplified version - in production you'd use a proper store
  const resetTime = now + windowMs

  return {
    allowed: true, // Simplified for demo
    resetTime
  }
}

// Request logging
export function logApiRequest(
  request: NextRequest,
  statusCode?: number,
  duration?: number
): void {
  const method = request.method
  const url = new URL(request.url)
  const path = url.pathname
  const userAgent = request.headers.get('user-agent') || 'Unknown'

  const logData = {
    method,
    path,
    statusCode,
    duration: duration ? `${duration}ms` : 'unknown',
    userAgent,
    timestamp: new Date().toISOString()
  }

  console.log(`API Request: ${method} ${path}`, logData)
}

// Health check endpoint helper
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy'
  timestamp: string
  uptime: number
  version?: string
}> {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  }
}