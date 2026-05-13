'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useRoom } from '@/hooks/use-room'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import { Copy, Check, Play, Users, Gamepad2, ClipboardCopy } from 'lucide-react'
import { useState } from 'react'

export default function RoomLobbyPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const { room, players, fetchRoom, subscribeToRoom } = useRoom()
  const [copied, setCopied] = useState(false)
  const [isHost, setIsHost] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchRoom(code)
  }, [code])

  useEffect(() => {
    if (!room?.id) return
    fetchRoom(code)
    const unsub = subscribeToRoom(room.id)
    return unsub
  }, [room?.id])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        if (room) setIsHost(user.id === room.host_id)
      }
    }
    checkUser()
  }, [room])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (room && room.max_players === 1 && isHost) {
      handleStartGame()
    }
  }, [room?.max_players, isHost])

  const handleStartGame = async () => {
    if (!room || !isHost) return

    const res = await fetch('/api/rooms/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: room.id }),
    })

    if (res.ok) {
      router.push(`/game/${room.id}`)
    }
  }

  const handleReady = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !room) return
    const player = players.find(p => p.player_id === user.id)
    if (player) {
      await supabase.from('room_players').update({ is_ready: !player.is_ready }).eq('id', player.id)
    }
  }

  const allReady = players.length >= 2 && players.every(p => p.is_ready)
  const myPlayer = currentUserId ? players.find(p => p.player_id === currentUserId) : null

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Badge variant="primary" className="mb-2">
                    {room?.category?.toUpperCase()} — {room?.game_mode?.toUpperCase()}
                  </Badge>
                  <h1 className="text-2xl font-bold text-gradient">Лобби</h1>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  <span className="text-lg font-mono font-bold text-purple-400">{code}</span>
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <ClipboardCopy className="w-4 h-4 text-white/40" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-4 text-sm text-white/40">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {players.length}/{room?.max_players || 4} игроков
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-xl mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Игроки
              </CardTitle>
              <CardDescription className="text-white/40">
                {room?.max_players === 1 ? 'Одиночная игра — запуск...' : players.length < 2 ? 'Ожидание игроков...' : 'Все готовы?'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {players.length === 0 ? (
                <div className="text-center py-8">
                  <Gamepad2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">Нет игроков</p>
                </div>
              ) : (
                players.map((player, i) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar size="md">
                        <AvatarImage src={(player.player as any)?.avatar_url} alt={(player.player as any)?.display_name} />
                        <AvatarFallback>
                          {(player.player as any)?.display_name?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">
                            {(player.player as any)?.display_name || 'Unknown'}
                          </p>
                          {player.is_host && (
                            <Badge variant="primary" className="text-[10px] px-1.5 py-0">ХОСТ</Badge>
                          )}
                        </div>
                        <p className="text-xs text-white/30">
                          Очки: {player.score}
                        </p>
                      </div>
                    </div>
                    <Badge variant={player.is_ready ? 'success' : 'default'}>
                      {player.is_ready ? 'Готов' : 'Ожидание'}
                    </Badge>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant={myPlayer ? 'primary' : 'default'}
              size="lg"
              className="flex-1"
              onClick={handleReady}
            >
              {myPlayer?.is_ready ? 'Не готов' : 'Готов'}
            </Button>

            {isHost && room?.max_players !== 1 && (
              <Button
                variant="primary"
                size="lg"
                className="flex-1 glow-purple"
                disabled={!allReady || players.length < 2}
                onClick={handleStartGame}
              >
                <Play className="w-4 h-4 mr-2" />
                Начать игру
              </Button>
            )}
          </div>

          {room?.max_players !== 1 && !allReady && isHost && (
            <p className="text-center text-xs text-white/30 mt-3">
              Ожидание всех игроков...
            </p>
          )}
          {room?.max_players !== 1 && players.length < 2 && (
            <p className="text-center text-xs text-white/30 mt-3">
              Нужно минимум 2 игрока
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
