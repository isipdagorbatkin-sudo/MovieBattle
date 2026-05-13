import { shuffleArray } from './utils'
import { MOVIES, SERIES, ANIME, getCategoryTitles } from './game-data'
import type { CuratedEntry } from './game-data'
import type { Category, GameMode, QuestionData } from '@/types'

const WORDS = ['the', 'a', 'an', 'and', 'or', 'of', 'in', 'to', 'for', 'with', 'on', 'at', 'by', 'is', 'it', 'и', 'в', 'на', 'с', 'по', 'для', 'от', 'до', 'не', 'за']

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\sёа-я]/g, '').trim()
}

function wordDistance(a: string, b: string): number {
  const aWords = normalizeTitle(a).split(/\s+/).filter((w: string) => !WORDS.includes(w))
  const bWords = normalizeTitle(b).split(/\s+/).filter((w: string) => !WORDS.includes(w))
  let matches = 0
  for (const w of aWords) {
    if (bWords.includes(w)) matches++
  }
  return matches / Math.max(aWords.length, bWords.length)
}

function generateOptions(correct: string, allNames: string[]): string[] {
  const filtered = allNames.filter(
    (n) => n !== correct && wordDistance(n, correct) < 0.6
  )
  const shuffled = shuffleArray(filtered)
  const distractors = shuffled.slice(0, 3)
  const options = shuffleArray([correct, ...distractors])

  while (options.length < 4) {
    const idx = Math.floor(Math.random() * allNames.length)
    const fallback = allNames[idx]
    if (!options.includes(fallback)) options.push(fallback)
  }

  return options.slice(0, 4)
}

export async function generateQuestions(
  category: Category,
  gameMode: GameMode,
  count: number = 10
): Promise<QuestionData[]> {
  const source = category === 'anime' ? ANIME : [...MOVIES, ...SERIES]
  const shuffled = shuffleArray(source)
  const selected = shuffled.slice(0, Math.min(count, shuffled.length))

  const allTitles = source.map(e => e.title)

  return shuffleArray(selected.map((entry: CuratedEntry, i: number) => {
    const isCharacter = gameMode === 'character'
    const clue = isCharacter && entry.character ? entry.character : entry.clue
    const type = isCharacter ? 'character' : 'description'
    const options = generateOptions(entry.title, allTitles)
    return {
      id: `${category}-curated-${i}`,
      type,
      mediaUrl: null,
      clue,
      options,
      correctAnswer: entry.title,
      timeLimit: gameMode === 'timer' ? 8000 : 15000,
      category,
      title: entry.title,
    }
  }))
}
