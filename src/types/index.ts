export type Category = 'anime' | 'movies' | 'series'

export type GameMode = 'classic' | 'character' | 'quote' | 'blur' | 'timer'

export type GameStatus = 'waiting' | 'playing' | 'round_end' | 'finished'

export interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Room {
  id: string
  code: string
  host_id: string
  category: Category
  game_mode: GameMode
  max_players: number
  status: GameStatus
  created_at: string
  updated_at: string
}

export interface RoomPlayer {
  id: string
  room_id: string
  player_id: string
  score: number
  is_ready: boolean
  is_host: boolean
  joined_at: string
  player?: Profile
}

export interface Round {
  id: string
  room_id: string
  round_number: number
  question_type: string
  correct_answer: string
  options: string[]
  media_url: string | null
  clue: string | null
  started_at: string
  ended_at: string | null
  time_limit: number
}

export interface Guess {
  id: string
  round_id: string
  player_id: string
  answer: string
  is_correct: boolean
  time_ms: number
  points: number
  created_at: string
}

export interface MatchHistory {
  id: string
  room_id: string
  player_id: string
  final_score: number
  rank: number
  category: Category
  game_mode: GameMode
  played_at: string
}

export interface LeaderboardEntry {
  player_id: string
  username: string
  display_name: string
  avatar_url: string | null
  total_matches: number
  total_wins: number
  total_score: number
  win_rate: number
  rank: number
}

export interface AnimeResult {
  id: number
  name: string
  russian: string
  image: {
    original: string
    preview: string
    x48: string
    x96: string
  }
  url: string
  kind: string
  score: string
  episodes: number
  episodes_aired: number
  aired_on: string
  released_on: string
  description: string
  description_html: string
  genres: { id: number; name: string; russian: string }[]
}

export interface AnimeCharacter {
  id: number
  name: string
  russian: string
  image: {
    original: string
    preview: string
    x48: string
    x96: string
  }
  url: string
  role: string
}

export interface TMDBResult {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  release_date?: string
  first_air_date?: string
  vote_average: number
  popularity: number
  media_type: string
}

export interface TMDBDetails {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  tagline: string | null
  release_date?: string
  first_air_date?: string
  vote_average: number
  popularity: number
  genres: { id: number; name: string }[]
  credits: {
    cast: {
      id: number
      name: string
      character: string
      profile_path: string | null
    }[]
  }
}

export interface QuestionData {
  id: string
  type: 'poster' | 'character' | 'quote' | 'blur' | 'description'
  mediaUrl: string | null
  clue: string | null
  characterImage: string | null
  options: string[]
  correctAnswer: string
  timeLimit: number
  category: Category
  title: string
  subtitle?: string
}
