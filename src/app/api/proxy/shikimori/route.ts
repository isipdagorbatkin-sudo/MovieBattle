import { NextResponse } from 'next/server'

const SHIKIMORI_BASE = 'https://shikimori.one/api'
const USER_AGENT = 'MovieBattle/1.0 (movie-battle-app)'

async function fetchWithRetry(url: string, retries = 3, timeout = 8000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      })
      if (res.ok) return res
      if (attempt < retries - 1) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
    } catch {
      if (attempt < retries - 1) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
    }
  }
  clearTimeout(timeoutId)
  throw new Error('Max retries exceeded')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint')
  const query = searchParams.get('query')
  const page = searchParams.get('page') || '1'
  const limit = searchParams.get('limit') || '10'

  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 })
  }

  let url: string
  if (endpoint === 'animes') {
    url = `${SHIKIMORI_BASE}/animes?page=${page}&limit=${limit}&order=popularity&genre=8&censored=true`
    if (query) url += `&search=${encodeURIComponent(query)}`

    const response = await fetchWithRetry(url)
    const data = await response.json()
    return NextResponse.json(data)
  }

  if (endpoint === 'anime') {
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    url = `${SHIKIMORI_BASE}/animes/${id}`
    const response = await fetchWithRetry(url)
    const data = await response.json()
    return NextResponse.json(data)
  }

  if (endpoint === 'characters') {
    const animeId = searchParams.get('anime_id')
    if (!animeId) return NextResponse.json({ error: 'Missing anime_id' }, { status: 400 })
    url = `${SHIKIMORI_BASE}/animes/${animeId}/roles`
    const response = await fetchWithRetry(url)
    const data = await response.json()
    const characters = data
      .filter((r: any) => r.role === 'Main' || r.role === 'Supporting')
      .map((r: any) => r.character)
    return NextResponse.json(characters)
  }

  if (endpoint === 'genres') {
    url = `${SHIKIMORI_BASE}/genres`
    const response = await fetchWithRetry(url)
    const data = await response.json()
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: 'Unknown endpoint' }, { status: 400 })
}
