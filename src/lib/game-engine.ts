import { shuffleArray } from './utils'
import type { Category, GameMode, QuestionData } from '@/types'

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

async function fetchTMDBPopular(type: 'movie' | 'tv'): Promise<any[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/${type === 'movie' ? 'movies' : 'series'}?type=popular`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.results || []
  } catch { return [] }
}

async function fetchTMDBDetails(type: 'movie' | 'tv', id: number): Promise<any> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/${type === 'movie' ? 'movies' : 'series'}?id=${id}`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

async function fetchAnimeRomance(): Promise<any[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/proxy/shikimori?endpoint=animes&limit=50&order=popularity`,
      { next: { revalidate: 3600 } }
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
            mediaUrl: item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : null,
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
  const fallbacks: Record<Category, string[]> = {
    anime: [
      'Твоё имя', 'Унесённые призраками', 'Ходячий замок', 'Сад изящных слов',
      'Ветер крепчает', 'Навсикая из долины ветров', 'Мой сосед Тоторо',
      'Небесный замок Лапута', 'Ведьмина служба доставки', 'Порко Россо',
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

  const names = fallbacks[category]
  const correct = names[index % names.length]
  const otherNames = names.filter((n) => n !== correct)
  const shuffled = shuffleArray(otherNames)
  const distractors = shuffled.slice(0, 3)

  return {
    id: `fallback-${index}`,
    type: 'description',
    mediaUrl: null,
    clue: `Popular ${category === 'anime' ? 'anime' : category === 'movies' ? 'movie' : 'series'}`,
    options: shuffleArray([correct, ...distractors]),
    correctAnswer: correct,
    timeLimit: gameMode === 'timer' ? 8000 : 15000,
    category,
    title: correct,
  }
}
