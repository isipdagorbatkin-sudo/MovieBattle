'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import type { Room, RoomPlayer } from '@/types'
import { Trophy, Home, RotateCcw, Crown, Medal, Sparkles } from 'lucide-react'

const rankColors = [
  { bg: 'from-yellow-500 to-amber-500', icon: Crown, label: 'Победитель' },
  { bg: 'from-gray-300 to-gray-400', icon: Medal, label: 'Второе место' },
  { bg: 'from-amber-600 to-amber-700', icon: Medal, label: 'Третье место' },
]

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const [players, setPlayers] = useState<RoomPlayer[]>([])
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: roomData } = await supabase.from('rooms').select('*').eq('id', roomId).maybeSingle()
      setRoom(roomData)

      const { data: playerData } = await supabase
        .from('room_players')
        .select('*, player:profiles(*)')
        .eq('room_id', roomId)
        .order('score', { ascending: false })

      setPlayers(playerData || [])
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

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-600/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full relative z-10"
      >
        <div className="text-center mb-8">
          <Badge variant="primary" className="mb-4">Игра окончена</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-2">Результаты</h1>
          <p className="text-white/40">
            {room?.category} — {room?.game_mode}
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {sortedPlayers.map((player, i) => {
            const rankInfo = rankColors[i]
            const Icon = rankInfo?.icon || Trophy
            const isWinner = i === 0

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className={`border-white/10 bg-white/5 backdrop-blur-xl ${
                  isWinner ? 'glow-purple' : ''
                }`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          rankInfo ? `bg-gradient-to-br ${rankInfo.bg}` : 'bg-white/10'
                        }`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-semibold text-white">
                              {(player.player as any)?.display_name || 'Unknown'}
                            </p>
                            {i === 0 && <Sparkles className="w-4 h-4 text-yellow-400" />}
                          </div>
                          <p className="text-xs text-white/40">
                            {rankInfo?.label || `#${i + 1}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{player.score}</p>
                        <p className="text-xs text-white/30">очков</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" size="lg" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              На главную
            </Button>
          </Link>
          <Link href="/room/create" className="flex-1">
            <Button variant="primary" size="lg" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Играть снова
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
