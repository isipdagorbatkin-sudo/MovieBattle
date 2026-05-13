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

function tmdbImage(path: string | null): string | null {
  if (!path) return null
  return `/api/image-proxy?path=${encodeURIComponent('/w500' + path)}`
}

function shikimoriImage(path: string | null): string | null {
  if (!path) return null
  return `/api/image-proxy?url=${encodeURIComponent('https://shikimori.one' + path)}`
}

async function fetchTMDBPopular(type: 'movie' | 'tv'): Promise<any[]> {
  if (!TMDB_KEY) return []
  const endpoint = type === 'movie' ? 'movie' : 'tv'
  const allItems: any[] = []
  const seen = new Set<number>()

  for (const page of [1, 2, 3, 4, 5]) {
    try {
      const res = await fetch(
        `${TMDB_BASE}/${endpoint}/popular?api_key=${TMDB_KEY}&language=en-US&page=${page}`,
        { next: { revalidate: 3600 } }
      )
      if (!res.ok) break
      const data = await res.json()
      for (const item of (data.results || [])) {
        if (!seen.has(item.id)) {
          seen.add(item.id)
          allItems.push(item)
        }
      }
    } catch { break }
  }

  return allItems
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
  const allItems: any[] = []
  const seen = new Set<number>()

  for (const page of [1, 2, 3]) {
    try {
      const res = await fetch(
        `${SHIKIMORI_BASE}/animes?page=${page}&limit=50&order=popularity&genre=8&censored=true`,
        {
          headers: { 'User-Agent': 'MovieBattle/1.0 (movie-battle-app)' },
          next: { revalidate: 3600 },
        }
      )
      if (!res.ok) break
      const data = await res.json()
      if (!Array.isArray(data)) break
      for (const item of data) {
        if (!seen.has(item.id)) {
          seen.add(item.id)
          allItems.push(item)
        }
      }
    } catch { break }
  }

  return allItems
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
      const popular = shuffleArray(animes.filter((a: any) => a.score && parseFloat(a.score) > 6))

      if (popular.length > 0) {
        for (let i = 0; i < Math.min(count, popular.length); i++) {
          const anime = popular[i]
          const allNames = popular.map((a: any) => a.russian || a.name)
          const correctName = anime.russian || anime.name
          const options = generateOptions(correctName, allNames, gameMode)

          questions.push({
            id: `anime-${anime.id}`,
            type: gameMode === 'quote' ? 'quote' : 'poster',
            mediaUrl: shikimoriImage(anime.image?.original || anime.image?.preview || null),
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
        const filtered = shuffleArray(items.filter((i: any) => (i.vote_average || 0) > 4))

        for (let i = 0; i < Math.min(count, filtered.length); i++) {
          const item = filtered[i]
          const title = type === 'movie' ? item.title : item.name
          if (!title) continue

          const allNames = filtered.map((f: any) => type === 'movie' ? f.title : f.name).filter(Boolean)
          const options = generateOptions(title, allNames, gameMode)

          questions.push({
            id: `${type}-${item.id}`,
            type: gameMode === 'classic' ? 'poster' : gameMode === 'quote' ? 'quote' : 'description',
            mediaUrl: tmdbImage(item.backdrop_path || item.poster_path),
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
      'A deaf girl and a bully find redemption through each other',
      'A boy saves a girl who can control the weather',
      'A prince fights to save the forest spirits and a princess',
      'A machine that lets people enter dreams blurs reality and fantasy',
      'A girl travels back in time and learns to cherish every moment',
      'A wolf mother raises her half-wolf children alone',
      'A math whiz uses a virtual world to save the real one',
      'A young girl journeys to a mystical land to find her voice',
      'Two siblings grow up on a hill overlooking a harbor',
      'A summer love story between two high school students',
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
      'A hobbit must destroy a powerful ring in a volcano',
      'A farm boy joins a rebellion to defeat an evil empire',
      'Scientists bring dinosaurs back to life on an island',
      'A teenager travels back in time to fix his familys future',
      'A Roman general seeks vengeance in the Colosseum',
      'An FBI trainee hunts a serial killer with a cannibals help',
      'A squad storms Normandy beach on D-Day',
      'A young lion prince must reclaim his kingdom',
      'A space ranger and a cowboy toy learn to share their owner',
      'A cyborg from the future tries to change history',
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
      'A crooked lawyer tries to clean up his act',
      'A lone bounty hunter protects a mysterious child',
      'A mad scientist and his grandson go on interdimensional adventures',
      'Each episode explores a dystopian near-future technology',
      'A smuggler leads a girl across a post-apocalyptic America',
      'A media empire family fights for control of the company',
      'A young chef turns a rundown sandwich shop into a destination',
      'The Targaryen dynasty fights for the Iron Throne centuries before',
      'Two sisters from rival cities discover the truth about their world',
      'Romance and scandal among Londons high society',
    ],
  }

  const fallbackNames: Record<Category, string[]> = {
    anime: [
      'Your Name', 'Spirited Away', 'Howls Moving Castle', 'The Garden of Words',
      'The Wind Rises', 'Nausicaä of the Valley of the Wind', 'My Neighbor Totoro',
      'Castle in the Sky', 'Kikis Delivery Service', 'Porco Rosso',
      'A Silent Voice', 'Weathering With You', 'Princess Mononoke', 'Paprika',
      'The Girl Who Leapt Through Time', 'Wolf Children', 'Summer Wars',
      'Children Who Chase Lost Voices', 'From Up on Poppy Hill', 'Ocean Waves',
    ],
    movies: [
      'Inception', 'The Dark Knight', 'Interstellar', 'Pulp Fiction',
      'Fight Club', 'The Matrix', 'Forrest Gump', 'The Shawshank Redemption',
      'Goodfellas', 'The Godfather',
      'The Lord of the Rings', 'Star Wars', 'Jurassic Park', 'Back to the Future',
      'Gladiator', 'The Silence of the Lambs', 'Saving Private Ryan',
      'The Lion King', 'Toy Story', 'Terminator 2',
    ],
    series: [
      'Breaking Bad', 'Game of Thrones', 'Stranger Things', 'The Office',
      'Friends', 'The Crown', 'Dark', 'Squid Game', 'The Witcher', 'Money Heist',
      'Better Call Saul', 'The Mandalorian', 'Rick and Morty', 'Black Mirror',
      'The Last of Us', 'Succession', 'The Bear', 'House of the Dragon',
      'Arcane', 'Bridgerton',
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
