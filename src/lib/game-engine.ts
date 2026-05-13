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

async function fetchJikanImage(name: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(name)}&limit=1`,
      {
        headers: { 'User-Agent': 'MovieBattle/1.0 (movie-battle-app)' },
        signal: AbortSignal.timeout(4000),
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    const results = data.data
    if (!results || results.length === 0) return null
    const imageUrl = results[0]?.images?.jpg?.large_image_url
    if (!imageUrl) return null
    return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
  } catch {
    return null
  }
}

const CURATED_MOVIES = [
  19995, 76600, 634649, 299534, 299536, 597, 475557, 120, 27205, 157336,
  872585, 98, 77338, 168259, 22, 603, 550, 680, 120, 121, 122,
  671, 672, 673, 674, 675, 767, 12444, 12445, 438631, 522627,
  106646, 11324, 497, 278, 13, 101, 280, 18, 807, 281957,
  49051, 49047, 57165, 10528, 107, 100, 115, 245891, 615457, 155,
  244786, 238, 11, 27205, 157336, 155, 244786, 238, 11, 680,
  550, 155, 244786, 27205, 157336, 27205, 157336,
  424, 769, 12445, 16869, 10138, 1726, 10193, 10681, 114, 118,
  135, 137, 128, 134, 122, 121, 120,
  197, 813, 1124, 141, 9552, 77, 747, 954, 62, 78,
  508, 769, 424, 238, 807, 200, 157336, 168, 1452, 950,
  49026, 76341, 181812, 495764, 438148, 335984, 137113, 106646,
  152601, 10138, 1726, 157350, 246741, 49051, 49047, 57165,
  14161, 14164, 14175, 14180, 14199,
  105, 205, 807, 826, 274, 373571, 464052, 335983, 297762, 315635,
  376812, 420818, 438631, 475557, 495764, 496243, 497698,
  508442, 524434, 531876, 536554, 537915,
  27205, 157336, 49026, 168259, 245891, 118340, 76341,
  278, 238, 680, 550, 155, 807, 274, 497, 13, 101,
  680, 155, 550, 238, 278, 497, 13, 101,
  155, 550, 680, 238, 278, 13, 101, 497,
]

const CURATED_SERIES = [
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
  4629, 2316, 456, 1622, 19885, 421, 1425, 63247,
  84958, 110481, 46205, 1428, 1433,
  206559, 216111, 65493, 79421, 243681, 46425,
  37854, 113995, 127653, 129261, 142550,
  123535, 138501, 85940, 131950, 124099, 124218, 149191,
  46260, 46195, 95479, 136765, 79434, 133960,
  60708, 63130, 76479, 82883, 85552, 93484, 94997,
  100088, 105509, 106541, 108978, 111837,
  119051, 120014, 124905, 126595, 127656,
  130542, 130802, 131950, 132364, 132381,
  134158, 134292, 134374, 134382, 134434,
  135215, 136765, 137613, 137824, 138338,
  138489, 138501, 138821, 139579, 139708,
  140238, 140245, 140622, 140835, 140964,
  141116, 141150, 141163, 141177,
  1429, 1430, 1399, 1402, 1403, 1404, 1405, 1406, 1408,
  1412, 1396, 1400, 1407, 1409, 1411,
  60625, 60572, 60735, 60708, 60059,
  100, 1668, 4380, 4429, 4542, 4611, 4612, 4614, 4615,
  4620, 4621, 4622, 4623, 4624, 4625, 4626, 4627, 4628, 4629,
  4630, 4631, 4632, 4633, 4634, 4635, 4636, 4637, 4638,
  4887, 4888, 4889, 4890, 4895, 4896,
  69740, 18347, 1421, 1416, 456, 1420, 4629, 2316,
  19885, 1408, 1622, 1433, 421, 1418,
  1422, 85552, 76331, 63247, 1425, 60622,
  1407, 1428, 1430, 1412,
  84958, 110481, 60625, 82883, 105509,
  46205, 206559, 216111, 65463, 79421,
  243681, 46425, 63130,
  37854, 113995, 149191, 129261,
  46260, 46195, 95479, 136765, 133960,
]

async function fetchTMDBItems(type: 'movie' | 'tv'): Promise<any[]> {
  if (!TMDB_KEY) return []
  const ids = type === 'movie' ? CURATED_MOVIES : CURATED_SERIES
  const uniqueIds = [...new Set(ids)]
  const items: any[] = []

  const chunks: number[][] = []
  for (let i = 0; i < uniqueIds.length; i += 10) {
    chunks.push(uniqueIds.slice(i, i + 10))
  }

  for (const chunk of chunks) {
    try {
      const results = await Promise.allSettled(
        chunk.map(id =>
          fetch(
            `${TMDB_BASE}/${type === 'movie' ? 'movie' : 'tv'}/${id}?api_key=${TMDB_KEY}&language=en-US`,
            { next: { revalidate: 86400 }, signal: AbortSignal.timeout(5000) }
          ).then(r => r.ok ? r.json() : null)
        )
      )
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          items.push(result.value)
        }
      }
    } catch { continue }
  }

  return items
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

  for (const page of [1, 2, 3, 4, 5, 6]) {
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
      const popular = shuffleArray(animes.filter((a: any) => a.score && parseFloat(a.score) > 5.5))

      if (popular.length > 0) {
        for (let i = 0; i < Math.min(count, popular.length); i++) {
          const anime = popular[i]
          const allNames = popular.map((a: any) => a.russian || a.name)
          const correctName = anime.russian || anime.name
          const options = generateOptions(correctName, allNames, gameMode)

          const jikanImage = await fetchJikanImage(correctName)
          const mediaUrl = jikanImage || shikimoriImage(anime.image?.original || anime.image?.preview || null)

          questions.push({
            id: `anime-${anime.id}`,
            type: gameMode === 'quote' ? 'quote' : 'poster',
            mediaUrl,
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
      const items = await fetchTMDBItems(type)

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
