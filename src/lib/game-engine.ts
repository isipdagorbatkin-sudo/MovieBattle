import { shuffleArray } from './utils'
import type { Category, GameMode, QuestionData } from '@/types'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_KEY = process.env.TMDB_API_KEY

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

const CURATED_ANIME = [
  'Toradora!', 'Clannad', 'Clannad: After Story', 'Golden Time',
  'Your Lie in April', 'My Teen Romantic Comedy SNAFU', 'Kaguya-sama: Love is War',
  'Fruits Basket', 'Horimiya', 'Rascal Does Not Dream of Bunny Girl Senpai',
  'My Dress-Up Darling', 'The Dangers in My Heart', 'Insomniacs After School',
  'Kimi ni Todoke: From Me to You', 'Lovely Complex', 'Nana',
  'Paradise Kiss', 'Honey and Clover', 'Kids on the Slope', 'Chihayafuru',
  'Ao Haru Ride', 'Orange', 'ReLIFE', 'Tsuki ga Kirei', 'Just Because!',
  'The Pet Girl of Sakurasou', 'The Kawai Complex Guide to Manors and Hostel Behavior',
  'Monthly Girls Nozaki-kun', 'Romantic Killer', 'Tonikawa: Over the Moon for You',
  'The Quintessential Quintuplets', 'Nisekoi', 'We Never Learn: BOKUBEN',
  'Masamune-kun Revenge', 'Yamada-kun and the Seven Witches', 'Boarding School Juliet',
  'Love Chunibyo Other Delusions', 'When Will Ayumu Make His Move?',
  'Aharen-san wa Hakarenai', 'Komi Cant Communicate',
  'Science Fell in Love So I Tried to Prove It', 'Recovery of an MMO Junkie',
  'Wotakoi: Love is Hard for Otaku', 'Princess Jellyfish',
  'Kimi no Iru Machi', 'Fuuka', 'Suzuka', 'Domestic Girlfriend', 'Scums Wish',
  'White Album 2', 'True Tears', 'A Lull in the Sea', 'Waiting in the Summer',
  'Please Teacher!', 'One Week Friends', 'Kokoro Connect',
  'The Girl Who Leapt Through Time', 'Summer Wars', 'Wolf Children',
  'The Boy and the Beast', 'Maquia: When the Promised Flower Blooms', 'Hal',
  'The Anthem of the Heart', 'A Silent Voice', 'I Want to Eat Your Pancreas',
  'Weathering With You', '5 Centimeters Per Second', 'The Garden of Words',
  'Josee the Tiger and the Fish', 'Ride Your Wave', 'Her Blue Sky',
  'Flavors of Youth', 'Penguin Highway', 'Words Bubble Up Like Soda Pop',
  'Bloom Into You', 'Citrus', 'Adachi and Shimamura', 'Sakura Trick',
  'Given', 'Doukyuusei', 'Sasaki and Miyano', 'Yuri on Ice',
  'The Ancient Magus Bride', 'My Happy Marriage',
  'Sacrificial Princess and the King of Beasts', 'Snow White with the Red Hair',
  'Yona of the Dawn', 'Kamisama Kiss', 'InuYasha', 'Maid Sama!',
  'Special A', 'Itazura na Kiss', 'Nodame Cantabile', 'Say I Love You',
  'Wolf Girl and Black Prince', 'My Little Monster', 'Blue Box',
  'Suzume', 'Fireworks', 'Whisker Away',
  'Engage Kiss', 'Strawberry Panic', 'Love Stage!!',
  'Hitorijime My Hero', 'The Stranger by the Beach',
  'Bakuman', 'Baby Steps', 'Cross Game', 'Touch', 'H2', 'Grand Blue Dreaming',
  'Love Me Love Me Not', 'The Relative Worlds',
  'To Every You Ive Loved Before', 'To Me the One Who Loved You',
  'A Couple of Cuckoos', 'Shikimoris Not Just a Cutie',
  'Kubo Wont Let Me Be Invisible', 'More Than a Married Couple But Not Lovers',
  'Gamers!', 'Uzaki-chan Wants to Hang Out', 'Nagatoro',
  'My First Girlfriend is a Gal', 'Rent-a-Girlfriend',
  'Bottom-Tier Character Tomozaki', 'Gekkan Shoujo Nozaki-kun',
  'Date A Live', 'Darling in the Franxx',
]

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

async function fetchAnimeByName(name: string): Promise<{ title: string; imageUrl: string | null; malId: number | null } | null> {
  try {
    const res = await fetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(name)}&limit=1`,
      {
        headers: { 'User-Agent': 'MovieBattle/1.0 (movie-battle-app)' },
        signal: AbortSignal.timeout(3000),
      }
    )
    if (!res.ok) return { title: name, imageUrl: null, malId: null }
    const data = await res.json()
    const anime = data?.data?.[0]
    if (!anime) return { title: name, imageUrl: null, malId: null }

    const title = anime.title_english || anime.title || name
    const imageUrl = anime.images?.jpg?.large_image_url
      ? `/api/image-proxy?url=${encodeURIComponent(anime.images.jpg.large_image_url)}`
      : null
    const malId = anime.mal_id || null

    return { title, imageUrl, malId }
  } catch {
    return { title: name, imageUrl: null, malId: null }
  }
}

export async function generateQuestions(
  category: Category,
  gameMode: GameMode,
  count: number = 10
): Promise<QuestionData[]> {
  const questions: QuestionData[] = []

  try {
    if (category === 'anime') {
      const names = shuffleArray(CURATED_ANIME)
      const usedNames = new Set<string>()

      for (let i = 0; i < names.length && questions.length < count; i++) {
        const name = names[i]
        if (usedNames.has(name.toLowerCase())) continue
        usedNames.add(name.toLowerCase())

        const result = await fetchAnimeByName(name)
        const correctName = result?.title || name
        const mediaUrl = result?.imageUrl || null

        if (usedNames.has(correctName.toLowerCase())) continue
        usedNames.add(correctName.toLowerCase())

        const otherNames = CURATED_ANIME.filter(
          n => !usedNames.has(n.toLowerCase()) && n.toLowerCase() !== correctName.toLowerCase()
        )
        const allNames = [correctName, ...otherNames]
        const options = generateOptions(correctName, allNames, gameMode)

        questions.push({
          id: `anime-${result?.malId || i}`,
          type: mediaUrl ? (gameMode === 'quote' ? 'quote' : 'poster') : 'description',
          mediaUrl,
          clue: mediaUrl ? null : `Popular romance anime`,
          options,
          correctAnswer: correctName,
          timeLimit: gameMode === 'timer' ? 8000 : 15000,
          category: 'anime',
          title: correctName,
        })
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
      'A high schooler helps a quiet girl make friends',
      'A boy and a girl pretend to date but catch real feelings',
      'A girl learns to love herself through cosplay',
      'Two childhood friends reunite in high school',
      'A musician and a deaf girl find harmony together',
      'A shut-in gamer finds love in an MMO',
      'An office romance between otaku coworkers',
      'A boy travels through time to fix his mistakes',
      'A girl from the countryside moves to the big city',
      'Rival families force a marriage between two teens',
      'A genius and a slacker form an unlikely romance',
      'A prince must marry to save his kingdom',
      'A girl discovers she has magical powers on her birthday',
      'A dragon girl and a human boy become unlikely friends',
      'A self-proclaimed villainess tries to avoid doom flags',
      'A cold duke of the north falls for a kind commoner',
      'A poor girl becomes a maidservant for a cold noble',
      'A girl writes letters to her future self for a friend',
      'A pool of water grants wishes but at a cost',
      'A boy investigates his sisters death in a small town',
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
    anime: CURATED_ANIME,
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
