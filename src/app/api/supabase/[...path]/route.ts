import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(req: NextRequest) {
  return proxy(req)
}

export async function POST(req: NextRequest) {
  return proxy(req)
}

export async function PATCH(req: NextRequest) {
  return proxy(req)
}

export async function DELETE(req: NextRequest) {
  return proxy(req)
}

async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname.replace('/api/supabase', '')
  const search = req.nextUrl.search
  const targetUrl = `${SUPABASE_URL}${path}${search}`

  const headers: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: req.headers.get('Authorization') || `Bearer ${SUPABASE_ANON_KEY}`,
  }

  const forwardHeaders = ['Content-Type', 'Accept', 'X-Client-Info', 'Prefer', 'Accept-Profile', 'Content-Profile']
  for (const name of forwardHeaders) {
    const value = req.headers.get(name)
    if (value) headers[name] = value
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

  return new NextResponse(resBody, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  })
}
