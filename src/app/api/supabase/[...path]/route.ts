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
    headers[key] = value
  })

  if (!headers['Authorization']) {
    headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`
  }

  const body = req.method !== 'GET' && req.method !== 'HEAD'
    ? await req.text()
    : undefined

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
  })

  const resBody = await response.text()

  if (!response.ok) {
    console.error(`[Supabase Proxy] ${req.method} ${path}${search} -> ${response.status}: ${resBody.slice(0, 500)}`)
  }

  return new NextResponse(resBody, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  })
}
