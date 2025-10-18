import { createBrowserClient } from '@supabase/ssr'
import { Database } from '../types/supabase'

export function createClient(accessToken?: string) {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: accessToken ? {
          Authorization: `Bearer ${accessToken}`
        } : {}
      },
      realtime: {
        // Disable realtime temporarily to fix connection issues
        params: {
          eventsPerSecond: 10,
        },
        // Add timeout and retry configuration
        timeout: 10000,
        heartbeatIntervalMs: 30000,
      }
    }
  )
}
