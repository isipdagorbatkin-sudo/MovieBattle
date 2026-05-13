const TMDB_KEY = process.env.TMDB_API_KEY

async function fetchJson(url: string): Promise<any> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'MovieBattle/1.0 (game)',
        'Accept': 'application/json',
      },
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    return await res.json()
  } catch {
    clearTimeout(timeout)
    return null
  }
}

export async function lookupCharacterImage(
  characterName: string,
  category: 'anime' | 'movies' | 'series'
): Promise<string | null> {
  if (category === 'anime') {
    const searchResult = await fetchJson(
      `https://shikimori.one/api/characters?search=${encodeURIComponent(characterName)}&limit=1`
    )
    if (searchResult && Array.isArray(searchResult) && searchResult.length > 0) {
      const id = searchResult[0].id
      if (id) return `https://shikimori.one/system/characters/original/${id}.jpg`
    }
  }

  if ((category === 'movies' || category === 'series') && TMDB_KEY) {
    const searchResult = await fetchJson(
      `https://api.themoviedb.org/3/search/person?query=${encodeURIComponent(characterName)}&api_key=${TMDB_KEY}&language=ru-RU`
    )
    if (searchResult?.results?.[0]?.profile_path) {
      return `https://image.tmdb.org/t/p/w185${searchResult.results[0].profile_path}`
    }
  }

  return null
}

export async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}
