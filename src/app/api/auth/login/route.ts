import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000)

    let res: Response
    try {
      res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: data.error_description || data.error || data.msg || 'Login failed' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      session: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      },
    })
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Server timeout. Try again.' }, { status: 504 })
    }
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
