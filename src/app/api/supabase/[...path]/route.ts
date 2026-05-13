import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, '')
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const SKIP_EXACT = new Set(['host', 'connection', 'content-length', 'x-real-ip'])
const SKIP_PREFIX = ['x-forwarded-', 'x-vercel-', 'x-next-']

export async function GET(req: NextRequest) { return proxy(req) }
export async function POST(req: NextRequest) { return proxy(req) }
export async function PATCH(req: NextRequest) { return proxy(req) }
export async function DELETE(req: NextRequest) { return proxy(req) }

async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname.replace('/api/supabase', '')
  const search = req.nextUrl.search
  const targetUrl = `${SUPABASE_URL}${path}${search}`

  const headers: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
  }

  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    if (SKIP_EXACT.has(lower)) return
    if (SKIP_PREFIX.some(p => lower.startsWith(p))) return
    headers[lower] = value
  })

  if (!headers['authorization']) {
    headers['authorization'] = `Bearer ${SUPABASE_ANON_KEY}`
  }

  const body = req.method !== 'GET' && req.method !== 'HEAD'
    ? await req.text()
    : undefined

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)

  let response: Response
  try {
    response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }

  const resBody = await response.text()

  if (!response.ok) {
    console.error(`[Supabase Proxy] ${req.method} ${path}${search} -> ${response.status}: ${resBody.slice(0, 500)}`)
  }

  const resHeaders: Record<string, string> = {}
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'set-cookie') {
      resHeaders[key] = value
    }
  })
  if (!resHeaders['Content-Type']) resHeaders['Content-Type'] = 'application/json'

  const nextRes = new NextResponse(resBody, {
    status: response.status,
    statusText: response.statusText,
    headers: resHeaders,
  })

  try {
    const cookies = response.headers.getSetCookie()
    for (const cookie of cookies) {
      nextRes.headers.append('Set-Cookie', cookie)
    }
  } catch {
    const singleCookie = response.headers.get('Set-Cookie')
    if (singleCookie) nextRes.headers.append('Set-Cookie', singleCookie)
  }

  return nextRes
}
