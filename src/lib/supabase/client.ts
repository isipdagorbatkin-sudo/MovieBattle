import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabaseOrigin = new URL(supabaseUrl).origin

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: (input, init) => {
        const requestUrl =
          typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.href
              : input.url

        const parsed = new URL(requestUrl, globalThis.location.origin)

        if (parsed.origin === supabaseOrigin) {
          const proxyUrl = `/api/supabase${parsed.pathname}${parsed.search}`
          return globalThis.fetch(proxyUrl, init || (input instanceof Request ? input : undefined))
        }

        return globalThis.fetch(input, init)
      },
    },
  })
}
