'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculatePoints } from '@/lib/utils'
import type { Room, Round, QuestionData, RoomPlayer } from '@/types'

interface GameState {
  room: Room | null
  players: RoomPlayer[]
  currentRound: Round | null
  roundNumber: number
  totalRounds: number
  status: 'waiting' | 'playing' | 'round_end' | 'finished'
  timeLeft: number
}

export function useGame(roomId: string) {
  const [state, setState] = useState<GameState>({
    room: null,
    players: [],
    currentRound: null,
    roundNumber: 0,
    totalRounds: 10,
    status: 'waiting',
    timeLeft: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  const fetchGame = useCallback(async () => {
    const { data: roomData } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .maybeSingle()

    if (!roomData) { setError('Room not found'); setLoading(false); return }

    const { data: playerData } = await supabase
      .from('room_players')
      .select('*, player:profiles(*)')
      .eq('room_id', roomId)

    setState((prev) => ({
      ...prev,
      room: roomData,
      players: playerData || [],
      status: roomData.status as GameState['status'],
    }))
    setLoading(false)
  }, [roomId])

  const subscribeToGame = useCallback(() => {
    const channel = supabase
      .channel(`game:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          const newRoom = payload.new as Room
          setState((prev) => ({
            ...prev,
            room: newRoom,
            status: newRoom.status as GameState['status'],
          }))
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'rounds', filter: `room_id=eq.${roomId}` },
        (payload) => {
          const round = payload.new as Round
          setState((prev) => ({
            ...prev,
            currentRound: round,
            roundNumber: round.round_number,
            timeLeft: Math.floor(round.time_limit / 1000),
          }))
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [roomId])

  useEffect(() => {
    if (state.currentRound && state.status === 'playing') {
      const startTime = Date.now()
      const limit = state.currentRound.time_limit

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, Math.ceil((limit - elapsed) / 1000))
        setState((prev) => ({ ...prev, timeLeft: remaining }))

        if (remaining <= 0) {
          clearInterval(timerRef.current!)
        }
      }, 100)

      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
  }, [state.currentRound?.id, state.status])

  const submitAnswer = useCallback(async (answer: string) => {
    if (!state.currentRound) return
    const startTime = Date.now()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const elapsed = Date.now() - startTime
    const isCorrect = answer.toLowerCase() === state.currentRound.correct_answer.toLowerCase()
    const points = isCorrect ? calculatePoints(elapsed, state.currentRound.time_limit) : 0

    const { error: guessError } = await supabase.from('guesses').insert({
      round_id: state.currentRound.id,
      player_id: user.id,
      answer,
      is_correct: isCorrect,
      time_ms: elapsed,
      points,
    })

    if (!guessError && isCorrect) {
      await supabase
        .from('room_players')
        .update({ score: state.players.find(p => p.player_id === user.id)?.score! + points })
        .eq('room_id', roomId)
        .eq('player_id', user.id)
    }

    return { isCorrect, points }
  }, [state.currentRound, state.players, roomId])

  const startGame = useCallback(async () => {
    await supabase
      .from('rooms')
      .update({ status: 'playing' })
      .eq('id', roomId)
  }, [roomId])

  return {
    ...state,
    loading,
    error,
    fetchGame,
    subscribeToGame,
    submitAnswer,
    startGame,
  }
}
