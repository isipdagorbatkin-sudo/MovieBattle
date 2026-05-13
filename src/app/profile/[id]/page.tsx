'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  Trophy,
  Gamepad2,
  Sparkles,
  Clock,
  Calendar,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const params = useParams()
  const id = params.id as string
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
      setProfile(profileData)

      const { data: statsData } = await supabase.from('leaderboard_stats').select('*').eq('player_id', id).maybeSingle()
      setStats(statsData)

      const { data: historyData } = await supabase
        .from('match_history')
        .select('*')
        .eq('player_id', id)
        .order('played_at', { ascending: false })
        .limit(10)

      setHistory(historyData || [])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/40">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Profile Header */}
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl mb-6">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <Avatar size="xl">
                  <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                  <AvatarFallback>{profile.display_name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gradient">{profile.display_name}</h1>
                  <p className="text-white/40">@{profile.username}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-white/30">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Joined {new Date(profile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Matches', value: stats.total_matches, icon: Gamepad2, color: 'from-purple-500 to-pink-500' },
                { label: 'Wins', value: stats.total_wins, icon: Trophy, color: 'from-yellow-500 to-orange-500' },
                { label: 'Score', value: stats.total_score.toLocaleString(), icon: Sparkles, color: 'from-green-500 to-emerald-500' },
                { label: 'Win Rate', value: `${stats.win_rate}%`, icon: Clock, color: 'from-blue-500 to-cyan-500' },
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.label} className="border-white/5 bg-white/5 backdrop-blur-xl">
                    <CardContent className="p-4 text-center">
                      <div className={`w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-white/40">{stat.label}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Match History */}
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-400" />
                Match History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <Gamepad2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">No matches played yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          match.rank === 1 ? 'bg-yellow-500/20' : 'bg-white/10'
                        }`}>
                          <Trophy className={`w-4 h-4 ${match.rank === 1 ? 'text-yellow-400' : 'text-white/30'}`} />
                        </div>
                        <div>
                          <p className="text-sm text-white">
                            {match.category} — {match.game_mode}
                          </p>
                          <p className="text-xs text-white/30">
                            Score: {match.final_score} • Rank #{match.rank}
                          </p>
                        </div>
                      </div>
                      <Badge variant={match.rank === 1 ? 'success' : 'default'}>
                        {match.rank === 1 ? 'Win' : `#${match.rank}`}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
