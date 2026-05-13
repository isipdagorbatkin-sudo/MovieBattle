import { NextResponse } from 'next/server'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_KEY = process.env.TMDB_API_KEY

const POPULAR_SERIES = [
  1396, 1399, 1400, 1402, 1403, 1404, 1405, 1406, 1407, 1408,
  1409, 1411, 1412, 1413, 1415, 1416, 1417, 1418, 1419, 1420,
  1421, 1422, 1423, 1424, 1425, 1426, 1427, 1428, 1429, 1430,
  60625, 60572, 60735, 60708, 60059, 63174, 63130, 66732,
  71912, 71788, 76479, 82883, 80557, 85552, 85553, 85554,
  93484, 93540, 94997, 100088, 100148, 105509, 106541,
  108978, 111837, 112484, 114565, 115036, 115149, 119051,
  120014, 121361, 123535, 124099, 124218, 124905, 126595,
  127656, 128476, 129261, 130542, 130802, 131950, 132364,
  132381, 133960, 134158, 134292, 134374, 134382, 134434,
  135215, 136765, 137613, 137824, 138338, 138489, 138501,
  138821, 139579, 139708, 139932, 140238, 140245, 140622,
  140835, 140964, 141116, 141150, 141163, 141177,
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
      const response = await fetch(`${TMDB_BASE}/tv/${id}?api_key=${TMDB_KEY}&append_to_response=credits,images`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 86400 },
      })
      const data = await response.json()
      return NextResponse.json(data)
    }

    if (type === 'random') {
      const randomId = POPULAR_SERIES[Math.floor(Math.random() * POPULAR_SERIES.length)]
      const response = await fetch(`${TMDB_BASE}/tv/${randomId}?api_key=${TMDB_KEY}&append_to_response=credits,images`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 86400 },
      })
      const data = await response.json()
      return NextResponse.json(data)
    }

    if (type === 'popular') {
      const response = await fetch(`${TMDB_BASE}/tv/popular?api_key=${TMDB_KEY}&language=en-US&page=1`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 3600 },
      })
      const data = await response.json()
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch series' }, { status: 500 })
  }
}
