'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GameScreen } from '@/components/game/game-screen'
import type { Room, RoomPlayer } from '@/types'

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<RoomPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: roomData } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .maybeSingle()

      if (!roomData) { router.push('/dashboard'); return }
      setRoom(roomData)

      const { data: playerData } = await supabase
        .from('room_players')
        .select('*, player:profiles(*)')
        .eq('room_id', roomId)

      setPlayers(playerData || [])

      const isPlayer = playerData?.some(p => p.player_id === user.id)
      if (!isPlayer) { router.push('/dashboard'); return }

      setLoading(false)
    }
    load()
  }, [roomId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/40">Комната не найдена</p>
      </div>
    )
  }

  return <GameScreen room={room} initialPlayers={players} />
}
