export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          code: string
          host_id: string
          category: string
          game_mode: string
          max_players: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          host_id: string
          category: string
          game_mode: string
          max_players?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          host_id?: string
          category?: string
          game_mode?: string
          max_players?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      room_players: {
        Row: {
          id: string
          room_id: string
          player_id: string
          score: number
          is_ready: boolean
          is_host: boolean
          joined_at: string
        }
        Insert: {
          id?: string
          room_id: string
          player_id: string
          score?: number
          is_ready?: boolean
          is_host?: boolean
          joined_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          player_id?: string
          score?: number
          is_ready?: boolean
          is_host?: boolean
          joined_at?: string
        }
      }
      rounds: {
        Row: {
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
        Insert: {
          id?: string
          room_id: string
          round_number: number
          question_type: string
          correct_answer: string
          options: string[]
          media_url?: string | null
          clue?: string | null
          started_at?: string
          ended_at?: string | null
          time_limit?: number
        }
        Update: {
          id?: string
          room_id?: string
          round_number?: number
          question_type?: string
          correct_answer?: string
          options?: string[]
          media_url?: string | null
          clue?: string | null
          started_at?: string
          ended_at?: string | null
          time_limit?: number
        }
      }
      guesses: {
        Row: {
          id: string
          round_id: string
          player_id: string
          answer: string
          is_correct: boolean
          time_ms: number
          points: number
          created_at: string
        }
        Insert: {
          id?: string
          round_id: string
          player_id: string
          answer: string
          is_correct: boolean
          time_ms: number
          points: number
          created_at?: string
        }
        Update: {
          id?: string
          round_id?: string
          player_id?: string
          answer?: string
          is_correct?: boolean
          time_ms?: number
          points?: number
          created_at?: string
        }
      }
      match_history: {
        Row: {
          id: string
          room_id: string
          player_id: string
          final_score: number
          rank: number
          category: string
          game_mode: string
          played_at: string
        }
        Insert: {
          id?: string
          room_id: string
          player_id: string
          final_score: number
          rank: number
          category: string
          game_mode: string
          played_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          player_id?: string
          final_score?: number
          rank?: number
          category?: string
          game_mode?: string
          played_at?: string
        }
      }
      leaderboard_stats: {
        Row: {
          player_id: string
          total_matches: number
          total_wins: number
          total_score: number
          win_rate: number
          updated_at: string
        }
        Insert: {
          player_id: string
          total_matches?: number
          total_wins?: number
          total_score?: number
          win_rate?: number
          updated_at?: string
        }
        Update: {
          player_id?: string
          total_matches?: number
          total_wins?: number
          total_score?: number
          win_rate?: number
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
