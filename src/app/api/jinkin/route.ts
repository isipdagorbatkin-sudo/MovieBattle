import { NextResponse } from 'next/server'

const JIKAN_BASE = 'https://api.jikan.moe/v4'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const id = searchParams.get('id')

  if (!q && !id) {
    return NextResponse.json({ error: 'Missing q or id parameter' }, { status: 400 })
  }

  try {
    let url: string
    if (id) {
      url = `${JIKAN_BASE}/anime/${id}`
    } else {
      url = `${JIKAN_BASE}/anime?q=${encodeURIComponent(q)}&limit=1`
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'MovieBattle/1.0 (movie-battle-app)',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Jikan request failed' }, { status: res.status })
    }

    const data = await res.json()

    if (id) {
      return NextResponse.json(data)
    }

    const results = data.data
    if (!results || (Array.isArray(results) && results.length === 0)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const anime = Array.isArray(results) ? results[0] : results
    return NextResponse.json({ data: anime }, { status: 200 })
  } catch (err: any) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return NextResponse.json({ error: 'Timeout' }, { status: 504 })
    }
    return NextResponse.json({ error: 'Jikan proxy error' }, { status: 502 })
  }
}
