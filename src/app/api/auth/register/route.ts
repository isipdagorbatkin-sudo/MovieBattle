import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: Request) {
  try {
    const { email, password, username, displayName } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const response = NextResponse.json({ success: true })

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          const cookies: { name: string; value: string }[] = []
          request.headers.get('Cookie')?.split(';').forEach(c => {
            const [name, ...rest] = c.trim().split('=')
            if (name) cookies.push({ name, value: rest.join('=') })
          })
          return cookies
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as any)
          })
        },
      },
    })

    console.log('[Auth/Register] Attempting signUp for:', email)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: (username || email.split('@')[0]).toLowerCase(),
          display_name: displayName || username || email.split('@')[0],
        },
      },
    })

    if (error) {
      console.error('[Auth/Register] signUp error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('[Auth/Register] signUp success:', data.user?.id)
    return response
  } catch (error: any) {
    console.error('[Auth/Register] exception:', error.message)
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
