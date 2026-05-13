'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import {
  Plus,
  LogIn,
  Gamepad2,
  Trophy,
  Clock,
  Users,
  Film,
  Tv,
  Sparkles,
  ArrowRight,
  Swords,
} from 'lucide-react'
import Link from 'next/link'
import { useRoom } from '@/hooks/use-room'
import { SoloGameModal } from '@/components/game/solo-game-modal'
import type { Category, GameMode } from '@/types'

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [recentMatches, setRecentMatches] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, wins: 0, score: 0 })
  const [loading, setLoading] = useState(true)
  const [soloModalOpen, setSoloModalOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { createSoloGame, loading: roomLoading } = useRoom()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      setProfile(profileData)

      const { data: history } = await supabase
        .from('match_history')
        .select('*')
        .eq('player_id', user.id)
        .order('played_at', { ascending: false })
        .limit(5)
      setRecentMatches(history || [])

      const { data: statsData } = await supabase
        .from('leaderboard_stats')
        .select('*')
        .eq('player_id', user.id)
        .maybeSingle()
      if (statsData) {
        setStats({
          total: statsData.total_matches,
          wins: statsData.total_wins,
          score: statsData.total_score,
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
        >
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage src={profile?.avatar_url} alt={profile?.display_name} />
              <AvatarFallback>{profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gradient">
                С возвращением, {profile?.display_name || 'Игрок'}
              </h1>
              <p className="text-white/40">Готов к битве?</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/room/create">
              <Button variant="primary" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Создать комнату
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={() => setSoloModalOpen(true)}>
              <Swords className="w-4 h-4 mr-2" />
              Одиночная
            </Button>
            <Link href="/room/join">
              <Button variant="outline" size="lg">
                <LogIn className="w-4 h-4 mr-2" />
                Войти в комнату
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10"
        >
          {[
            { label: 'Всего игр', value: stats.total, icon: Gamepad2, color: 'from-purple-500 to-pink-500' },
            { label: 'Побед', value: stats.wins, icon: Trophy, color: 'from-yellow-500 to-orange-500' },
            { label: 'Очков', value: stats.score.toLocaleString(), icon: Sparkles, color: 'from-green-500 to-emerald-500' },
            { label: 'Процент побед', value: stats.total > 0 ? `${Math.round((stats.wins / stats.total) * 100)}%` : '0%', icon: Clock, color: 'from-blue-500 to-cyan-500' },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="border-white/5 bg-white/5 backdrop-blur-xl">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-white/40">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-10"
        >
          <Link href="/room/create">
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-600/10 to-pink-600/10 backdrop-blur-xl hover:from-purple-600/20 hover:to-pink-600/20 transition-all group cursor-pointer">
              <CardContent className="p-6">
                <Plus className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-white mb-1">Создать комнату</h3>
                <p className="text-sm text-white/40">Создай игру и пригласи друзей</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/room/join">
            <Card className="border-pink-500/20 bg-gradient-to-br from-pink-600/10 to-orange-600/10 backdrop-blur-xl hover:from-pink-600/20 hover:to-orange-600/20 transition-all group cursor-pointer">
              <CardContent className="p-6">
                <LogIn className="w-8 h-8 text-pink-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-white mb-1">Войти в комнату</h3>
                <p className="text-sm text-white/40">Введи код приглашения</p>
              </CardContent>
            </Card>
          </Link>

          <button onClick={() => setSoloModalOpen(true)} className="text-left">
            <Card className="border-green-500/20 bg-gradient-to-br from-green-600/10 to-emerald-600/10 backdrop-blur-xl hover:from-green-600/20 hover:to-emerald-600/20 transition-all group cursor-pointer w-full">
              <CardContent className="p-6">
                <Swords className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-white mb-1">Одиночная игра</h3>
                <p className="text-sm text-white/40">Быстрая игра без друзей</p>
              </CardContent>
            </Card>
          </button>
        </motion.div>

        {/* Recent Matches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gradient">Последние игры</h2>
            <Link href={`/profile/${profile?.id}`}>
                  <Button variant="ghost" size="sm">
                    Все <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
            </Link>
          </div>

          {recentMatches.length === 0 ? (
            <Card className="border-white/5 bg-white/5 backdrop-blur-xl">
              <CardContent className="p-12 text-center">
                <Gamepad2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">Ещё нет игр. Начни свою первую!</p>
                <Link href="/room/create" className="inline-block mt-4">
                  <Button variant="primary" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Создать комнату
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentMatches.map((match, i) => (
                <Card key={match.id} className="border-white/5 bg-white/5 backdrop-blur-xl">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        match.rank === 1 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                        match.rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                        match.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                        'bg-white/10'
                      }`}>
                        <Trophy className={`w-5 h-5 ${match.rank <= 3 ? 'text-white' : 'text-white/40'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {match.category} — {match.game_mode}
                        </p>
                        <p className="text-xs text-white/40">
                          Очки: {match.final_score} • Место #{match.rank}
                        </p>
                      </div>
                    </div>
                    <Badge variant={match.rank === 1 ? 'success' : 'default'}>
                      {match.rank === 1 ? 'Победа' : `#${match.rank}`}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <SoloGameModal
        open={soloModalOpen}
        onClose={() => setSoloModalOpen(false)}
        onStart={(category: Category, gameMode: GameMode) => {
          setSoloModalOpen(false)
          createSoloGame(category, gameMode)
        }}
        loading={roomLoading}
      />
    </div>
  )
}
