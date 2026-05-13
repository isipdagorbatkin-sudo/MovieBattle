'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import { Trophy, Crown, Medal, Sparkles, Users, ArrowUp } from 'lucide-react'

const rankIcons = [Crown, Medal, Medal]
const rankColors = [
  'from-yellow-500 to-amber-500',
  'from-gray-300 to-gray-400',
  'from-amber-600 to-amber-700',
]

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('leaderboard_stats')
        .select('*, profile:profiles(*)')
        .order('total_score', { ascending: false })
        .limit(50)

      setEntries(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-yellow-600/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Badge variant="primary" className="mb-4">Rankings</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-2">Leaderboard</h1>
          <p className="text-white/50">Top players by total score</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40">No players on the leaderboard yet</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Top Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {entries.map((entry, i) => {
                  const Icon = rankIcons[i] || Trophy
                  const rankColor = rankColors[i] || 'bg-white/10'

                  return (
                    <motion.div
                      key={entry.player_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Link href={`/profile/${entry.player_id}`}>
                        <div className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                          i < 3 ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              i < 3 ? `bg-gradient-to-br ${rankColor}` : 'bg-white/10'
                            }`}>
                              {i < 3 ? (
                                <Icon className="w-5 h-5 text-white" />
                              ) : (
                                <span className="text-sm font-bold text-white/50">{i + 1}</span>
                              )}
                            </div>
                            <Avatar size="sm">
                              <AvatarImage src={entry.profile?.avatar_url} alt={entry.profile?.display_name} />
                              <AvatarFallback>
                                {entry.profile?.display_name?.charAt(0)?.toUpperCase() || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {entry.profile?.display_name || 'Unknown'}
                              </p>
                              <p className="text-xs text-white/30">
                                {entry.total_matches} matches • {entry.total_wins} wins
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-white">{entry.total_score.toLocaleString()}</p>
                            <p className="text-xs text-white/30">
                              <ArrowUp className="w-3 h-3 inline mr-0.5 text-green-400" />
                              {entry.win_rate}%
                            </p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
