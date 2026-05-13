import { NextResponse } from 'next/server'

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')

  if (!path) {
    return new NextResponse('Missing path', { status: 400 })
  }

  const imageUrl = `${TMDB_IMAGE_BASE}${path}`

  try {
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'MovieBattle/1.0',
        'Accept': 'image/webp,image/*,*/*;q=0.8',
      },
    })

    if (!res.ok) {
      return new NextResponse('Image not found', { status: 404 })
    }

    const blob = await res.blob()
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=2592000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch {
    return new NextResponse('Failed to fetch image', { status: 502 })
  }
}
