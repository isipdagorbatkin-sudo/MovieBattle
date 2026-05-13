async function fetchJson(url: string): Promise<any> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'MovieBattle/1.0', 'Accept': 'application/json' },
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
    const data = await fetchJson(
      `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(characterName)}&limit=1`
    )
    if (data?.data?.[0]?.images?.jpg?.image_url) {
      return data.data[0].images.jpg.image_url
    }
  }

  return null
}

export async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}
