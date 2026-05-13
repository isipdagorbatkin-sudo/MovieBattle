import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabaseOrigin = new URL(supabaseUrl).origin

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (input, init) => {
        const requestUrl =
          typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.href
              : input.url

        const parsed = new URL(requestUrl, globalThis.location.origin)

        if (parsed.origin === supabaseOrigin) {
          const proxyUrl = `/api/supabase${parsed.pathname}${parsed.search}`

          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 15000)

          try {
            let proxyInit: RequestInit | undefined

            if (input instanceof Request) {
              proxyInit = {
                method: input.method,
                headers: input.headers,
                body: input.method !== 'GET' && input.method !== 'HEAD' ? input.body : undefined,
                signal: controller.signal,
              }
            } else if (init) {
              proxyInit = { ...init, signal: controller.signal }
            } else {
              proxyInit = { signal: controller.signal }
            }

            return await globalThis.fetch(proxyUrl, proxyInit)
          } finally {
            clearTimeout(timeout)
          }
        }

        return globalThis.fetch(input, init)
      },
    },
  })
}
