import { shuffleArray } from './utils'
import type { Category, GameMode, QuestionData } from '@/types'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_KEY = process.env.TMDB_API_KEY
const SHIKIMORI_BASE = 'https://shikimori.one/api'

const WORDS = ['the', 'a', 'an', 'and', 'or', 'of', 'in', 'to', 'for', 'with', 'on', 'at', 'by', 'is', 'it']

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
}

function wordDistance(a: string, b: string): number {
  const aWords = normalizeTitle(a).split(/\s+/).filter(w => !WORDS.includes(w))
  const bWords = normalizeTitle(b).split(/\s+/).filter(w => !WORDS.includes(w))
  let matches = 0
  for (const w of aWords) {
    if (bWords.includes(w)) matches++
  }
  return matches / Math.max(aWords.length, bWords.length)
}

function tmdbImageUrl(path: string | null): string | null {
  if (!path) return null
  return `/api/image-proxy?path=${encodeURIComponent('/w500' + path)}`
}

async function fetchTMDBPopular(type: 'movie' | 'tv'): Promise<any[]> {
  if (!TMDB_KEY) return []
  try {
    const endpoint = type === 'movie' ? 'movie' : 'tv'
    const res = await fetch(
      `${TMDB_BASE}/${endpoint}/popular?api_key=${TMDB_KEY}&language=en-US&page=1`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.results || []
  } catch { return [] }
}

async function fetchTMDBDetails(type: 'movie' | 'tv', id: number): Promise<any> {
  if (!TMDB_KEY) return null
  try {
    const endpoint = type === 'movie' ? 'movie' : 'tv'
    const res = await fetch(
      `${TMDB_BASE}/${endpoint}/${id}?api_key=${TMDB_KEY}&append_to_response=credits,images`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

async function fetchAnimeRomance(): Promise<any[]> {
  try {
    const res = await fetch(
      `${SHIKIMORI_BASE}/animes?page=1&limit=50&order=popularity&genre=8&censored=true`,
      {
        headers: { 'User-Agent': 'MovieBattle/1.0 (movie-battle-app)' },
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch { return [] }
}

export async function generateQuestions(
  category: Category,
  gameMode: GameMode,
  count: number = 10
): Promise<QuestionData[]> {
  const questions: QuestionData[] = []

  try {
    if (category === 'anime') {
      const animes = await fetchAnimeRomance()
      const popular = animes
        .filter((a: any) => a.score && parseFloat(a.score) > 7)
        .sort((a: any, b: any) => parseFloat(b.score) - parseFloat(a.score))

      if (popular.length > 0) {
        for (let i = 0; i < Math.min(count, popular.length); i++) {
          const anime = popular[i]
          const allNames = popular.map((a: any) => a.russian || a.name)
          const correctName = anime.russian || anime.name
          const options = generateOptions(correctName, allNames, gameMode)

          questions.push({
            id: `anime-${anime.id}`,
            type: gameMode === 'quote' ? 'quote' : 'poster',
            mediaUrl: anime.image?.original
              ? `https://shikimori.one${anime.image.original}`
              : null,
            clue: anime.description?.slice(0, 200) || null,
            options,
            correctAnswer: correctName,
            timeLimit: gameMode === 'timer' ? 8000 : 15000,
            category: 'anime',
            title: correctName,
          })
        }
      }
    } else {
      const type = category === 'movies' ? 'movie' : 'tv'
      const items = await fetchTMDBPopular(type)

      if (items.length > 0) {
        const filtered = items
          .filter((i: any) => (i.vote_average || 0) > 6)
          .sort((a: any, b: any) => (b.vote_average || 0) - (a.vote_average || 0))

        for (let i = 0; i < Math.min(count, filtered.length); i++) {
          const item = filtered[i]
          const title = type === 'movie' ? item.title : item.name
          if (!title) continue

          const allNames = filtered.map((f: any) => type === 'movie' ? f.title : f.name).filter(Boolean)
          const options = generateOptions(title, allNames, gameMode)

          questions.push({
            id: `${type}-${item.id}`,
            type: gameMode === 'classic' ? 'poster' : gameMode === 'quote' ? 'quote' : 'description',
            mediaUrl: tmdbImageUrl(item.poster_path),
            clue: item.overview?.slice(0, 200) || null,
            options,
            correctAnswer: title,
            timeLimit: gameMode === 'timer' ? 8000 : 15000,
            category,
            title,
          })
        }
      }
    }
  } catch {}

  if (questions.length < count) {
    for (let i = questions.length; i < count; i++) {
      questions.push(createFallbackQuestion(category, gameMode, i))
    }
  }

  return shuffleArray(questions).slice(0, count)
}

function generateOptions(correct: string, allNames: string[], gameMode: GameMode): string[] {
  const filtered = allNames.filter(
    (n) => n !== correct && wordDistance(n, correct) < 0.6
  )
  const shuffled = shuffleArray(filtered)
  const distractors = shuffled.slice(0, 3)
  const options = shuffleArray([correct, ...distractors])

  while (options.length < 4) {
    options.push(`Option ${options.length + 1}`)
  }

  return options.slice(0, 4)
}

function createFallbackQuestion(category: Category, gameMode: GameMode, index: number): QuestionData {
  const clues: Record<string, string[]> = {
    anime: [
      'Two teenagers swap bodies and fall in love across time',
      'A young girl works for a spirit bathhouse to save her parents',
      'A young wizard with a talking book must break a curse',
      'A boy falls in love with a girl who can make it rain',
      'A man dreams of building airplanes while fighting illness',
      'A princess from a peaceful valley must stop an invasion',
      'Two sisters befriend a forest spirit after moving to the countryside',
      'A girl inherits a moving castle from a witch',
      'A young witch starts her own delivery service',
      'A pig who used to be a man fights air pirates',
    ],
    movies: [
      'A thief who enters dreams to steal secrets',
      'A vigilante fights crime in a dark city',
      'Astronauts travel through a wormhole to save humanity',
      'Two hitmen go on a wild adventure in Los Angeles',
      'A man with split personality fights the system',
      'A hacker discovers reality is a simulation',
      'A simple man runs across America and changes history',
      'A banker survives prison and seeks redemption',
      'A mob hitman looks back on his life in the 1960s',
      'The mafia families of New York fight for power',
    ],
    series: [
      'A chemistry teacher cooks meth after cancer diagnosis',
      'Noble families fight for control of a fantasy kingdom',
      'Kids uncover supernatural mysteries in a small town',
      'A mockumentary about office workers at a paper company',
      'Six friends navigate life in New York City',
      'The drama of the British royal family across decades',
      'A family in Germany uncovers a time travel conspiracy',
      'Hundreds compete in deadly childrens games for money',
      'A monster hunter fights supernatural threats',
      'A heist crew uses a unique ability to rob banks',
    ],
  }

  const fallbackNames: Record<Category, string[]> = {
    anime: [
      'Your Name', 'Spirited Away', 'Howls Moving Castle', 'The Garden of Words',
      'The Wind Rises', 'Nausicaä of the Valley of the Wind', 'My Neighbor Totoro',
      'Castle in the Sky', 'Kikis Delivery Service', 'Porco Rosso',
    ],
    movies: [
      'Inception', 'The Dark Knight', 'Interstellar', 'Pulp Fiction',
      'Fight Club', 'The Matrix', 'Forrest Gump', 'The Shawshank Redemption',
      'Goodfellas', 'The Godfather',
    ],
    series: [
      'Breaking Bad', 'Game of Thrones', 'Stranger Things', 'The Office',
      'Friends', 'The Crown', 'Dark', 'Squid Game', 'The Witcher', 'Money Heist',
    ],
  }

  const names = fallbackNames[category]
  const correct = names[index % names.length]
  const otherNames = names.filter((n) => n !== correct)
  const shuffled = shuffleArray(otherNames)
  const distractors = shuffled.slice(0, 3)
  const categoryClues = clues[category]
  const clue = categoryClues[index % categoryClues.length]

  return {
    id: `fallback-${index}`,
    type: gameMode === 'blur' ? 'blur' : 'description',
    mediaUrl: null,
    clue,
    options: shuffleArray([correct, ...distractors]),
    correctAnswer: correct,
    timeLimit: gameMode === 'timer' ? 8000 : 15000,
    category,
    title: correct,
  }
}
