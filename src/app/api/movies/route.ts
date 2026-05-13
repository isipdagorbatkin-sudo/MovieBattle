import { NextResponse } from 'next/server'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_KEY = process.env.TMDB_API_KEY

const POPULAR_MOVIES = [
  550, 680, 238, 11, 807, 244786, 155, 497, 299536, 27205,
  157336, 274870, 118340, 49026, 76341, 181812, 278, 238636,
  262500, 346364, 297762, 315635, 335983, 376812, 299534,
  299537, 420818, 438631, 475557, 495764, 496243, 497698,
  508442, 522402, 524434, 531876, 532639, 536554, 537915,
  438148, 335984, 157350, 246741, 246742, 137113, 106646,
  49051, 152601, 10138, 1726, 10193, 102382, 10681, 10764,
  109445, 114, 118, 120, 12155, 122, 12444, 12445, 128, 134,
  135, 137, 14160, 14161, 14164, 14165, 14175, 14177, 14180,
  14181, 14182, 14183, 14184, 14185, 14186, 14187, 14188,
  14189, 14190, 14191, 14192, 14193, 14194, 14195, 14196,
  14197, 14198, 14199, 14200, 14201, 14202, 14203, 14204,
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'random'
  const id = searchParams.get('id')

  if (!TMDB_KEY) {
    return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 })
  }

  try {
    if (id) {
      const response = await fetch(`${TMDB_BASE}/movie/${id}?api_key=${TMDB_KEY}&append_to_response=credits,images`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 86400 },
      })
      const data = await response.json()
      return NextResponse.json(data)
    }

    if (type === 'random') {
      const randomId = POPULAR_MOVIES[Math.floor(Math.random() * POPULAR_MOVIES.length)]
      const response = await fetch(`${TMDB_BASE}/movie/${randomId}?api_key=${TMDB_KEY}&append_to_response=credits,images`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 86400 },
      })
      const data = await response.json()
      return NextResponse.json(data)
    }

    if (type === 'popular') {
      const response = await fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=1`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 3600 },
      })
      const data = await response.json()
      return NextResponse.json(data)
    }

    if (type === 'top_rated') {
      const response = await fetch(`${TMDB_BASE}/movie/top_rated?api_key=${TMDB_KEY}&language=en-US&page=1`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 3600 },
      })
      const data = await response.json()
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 })
  }
}
