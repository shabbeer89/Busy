"use client"

import { useState, useCallback } from 'react'

interface AsyncOperationState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseAsyncOperationOptions {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export function useAsyncOperation<T = any>(
  operation: (...args: any[]) => Promise<T>,
  options: UseAsyncOperationOptions = {}
) {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async (...args: any[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await operation(...args)
      setState({ data: result, loading: false, error: null })
      options.onSuccess?.(result)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      options.onError?.(errorMessage)
      throw error
    }
  }, [operation, options])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}

// Hook for managing multiple async operations
export function useAsyncOperations() {
  const [operations, setOperations] = useState<Map<string, AsyncOperationState<any>>>(
    new Map()
  )

  const startOperation = useCallback((key: string) => {
    setOperations(prev => {
      const newMap = new Map(prev)
      newMap.set(key, { data: null, loading: true, error: null })
      return newMap
    })
  }, [])

  const completeOperation = useCallback((key: string, data: any) => {
    setOperations(prev => {
      const newMap = new Map(prev)
      newMap.set(key, { data, loading: false, error: null })
      return newMap
    })
  }, [])

  const failOperation = useCallback((key: string, error: string) => {
    setOperations(prev => {
      const newMap = new Map(prev)
      newMap.set(key, { data: null, loading: false, error })
      return newMap
    })
  }, [])

  const getOperation = useCallback((key: string) => {
    return operations.get(key) || { data: null, loading: false, error: null }
  }, [operations])

  const resetOperation = useCallback((key: string) => {
    setOperations(prev => {
      const newMap = new Map(prev)
      newMap.delete(key)
      return newMap
    })
  }, [])

  const resetAll = useCallback(() => {
    setOperations(new Map())
  }, [])

  return {
    operations,
    startOperation,
    completeOperation,
    failOperation,
    getOperation,
    resetOperation,
    resetAll,
  }
}

// Hook for retrying failed operations
export function useRetryableOperation<T = any>(
  operation: (...args: any[]) => Promise<T>,
  options: {
    maxRetries?: number
    retryDelay?: number
    onRetry?: (attempt: number) => void
    onMaxRetriesReached?: () => void
  } = {}
) {
  const { maxRetries = 3, retryDelay = 1000, onRetry, onMaxRetriesReached } = options

  const [attempts, setAttempts] = useState(0)
  const [lastError, setLastError] = useState<string | null>(null)

  const executeWithRetry = useCallback(async (...args: any[]) => {
    let currentAttempt = 0

    while (currentAttempt < maxRetries) {
      try {
        const result = await operation(...args)
        setAttempts(0)
        setLastError(null)
        return result
      } catch (error) {
        currentAttempt++
        const errorMessage = error instanceof Error ? error.message : 'An error occurred'
        setLastError(errorMessage)

        if (currentAttempt >= maxRetries) {
          onMaxRetriesReached?.()
          throw new Error(`Operation failed after ${maxRetries} attempts: ${errorMessage}`)
        }

        onRetry?.(currentAttempt)
        await new Promise(resolve => setTimeout(resolve, retryDelay * currentAttempt))
      }
    }
  }, [operation, maxRetries, retryDelay, onRetry, onMaxRetriesReached])

  const reset = useCallback(() => {
    setAttempts(0)
    setLastError(null)
  }, [])

  return {
    executeWithRetry,
    attempts,
    lastError,
    canRetry: attempts < maxRetries && lastError !== null,
    reset,
  }
}