'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { generateRoomCode } from '@/lib/utils'
import type { Room, RoomPlayer, Category, GameMode } from '@/types'

export function useRoom() {
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<RoomPlayer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const createRoom = useCallback(async (
    category: Category,
    gameMode: GameMode,
    maxPlayers: number = 4
  ) => {
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let code = generateRoomCode()
      let { data: existing } = await supabase.from('rooms').select('code').eq('code', code).maybeSingle()
      while (existing) {
        code = generateRoomCode()
        existing = (await supabase.from('rooms').select('code').eq('code', code).maybeSingle()).data
      }

      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert({
          code,
          host_id: user.id,
          category,
          game_mode: gameMode,
          max_players: maxPlayers,
          status: 'waiting',
        })
        .select()
        .single()

      if (roomError) throw roomError

      const { error: playerError } = await supabase
        .from('room_players')
        .insert({
          room_id: roomData.id,
          player_id: user.id,
          is_host: true,
          is_ready: false,
        })

      if (playerError) throw playerError

      setRoom(roomData)
      router.push(`/room/${roomData.code}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const createSoloGame = useCallback(async (
    category: Category = 'movies',
    gameMode: GameMode = 'classic'
  ) => {
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let code = generateRoomCode()
      let { data: existing } = await supabase.from('rooms').select('code').eq('code', code).maybeSingle()
      while (existing) {
        code = generateRoomCode()
        existing = (await supabase.from('rooms').select('code').eq('code', code).maybeSingle()).data
      }

      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert({
          code,
          host_id: user.id,
          category,
          game_mode: gameMode,
          max_players: 1,
          status: 'waiting',
        })
        .select()
        .single()

      if (roomError) throw roomError

      const { error: playerError } = await supabase
        .from('room_players')
        .insert({
          room_id: roomData.id,
          player_id: user.id,
          is_host: true,
          is_ready: true,
        })

      if (playerError) throw playerError

      const res = await fetch('/api/rooms/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomData.id }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to start game')

      router.push(`/game/${roomData.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const joinRoom = useCallback(async (code: string) => {
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: roomData } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code.toUpperCase())
        .maybeSingle()

      if (!roomData) throw new Error('Room not found')
      if (roomData.status !== 'waiting') throw new Error('Game already started')

      const { count } = await supabase
        .from('room_players')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', roomData.id)

      if (count && count >= roomData.max_players) throw new Error('Room is full')

      const { error: joinError } = await supabase
        .from('room_players')
        .insert({ room_id: roomData.id, player_id: user.id })

      if (joinError) {
        if (joinError.code === '23505') throw new Error('Already in this room')
        throw joinError
      }

      setRoom(roomData)
      router.push(`/room/${roomData.code}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchRoom = useCallback(async (code: string) => {
    const { data: roomData } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .maybeSingle()

    if (roomData) {
      setRoom(roomData)
      const { data: playerData } = await supabase
        .from('room_players')
        .select('*, player:profiles(*)')
        .eq('room_id', roomData.id)

      setPlayers(playerData || [])
    }
  }, [])

  const subscribeToRoom = useCallback((roomId: string) => {
    if (!roomId) return () => {}
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPlayers((prev) => [...prev, payload.new as RoomPlayer])
          } else if (payload.eventType === 'UPDATE') {
            setPlayers((prev) =>
              prev.map((p) => (p.id === payload.new.id ? { ...p, ...payload.new } : p))
            )
          } else if (payload.eventType === 'DELETE') {
            setPlayers((prev) => prev.filter((p) => p.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return {
    room,
    players,
    loading,
    error,
    createRoom,
    createSoloGame,
    joinRoom,
    fetchRoom,
    subscribeToRoom,
  }
}
