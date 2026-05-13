'use client'

import { useState } from 'react'
import { useRoom } from '@/hooks/use-room'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Film, Sparkles, Users, ArrowRight, Gamepad2 } from 'lucide-react'
import type { Category, GameMode } from '@/types'

const categories: { value: Category; label: string; icon: typeof Film; desc: string; color: string }[] = [
  { value: 'movies', label: 'Фильмы и сериалы', icon: Film, desc: 'Популярные фильмы и сериалы', color: 'from-purple-500 to-indigo-500' },
  { value: 'anime', label: 'Аниме', icon: Sparkles, desc: 'Романтическое аниме', color: 'from-pink-500 to-rose-500' },
]

const gameModes: { value: GameMode; label: string; desc: string }[] = [
  { value: 'classic', label: 'Классический', desc: 'Угадай по описанию' },
  { value: 'character', label: 'Персонаж', desc: 'Угадай по персонажу' },
  { value: 'blur', label: 'Размытие', desc: 'Размытое изображение' },
  { value: 'timer', label: 'На время', desc: 'Быстрые вопросы' },
]

export default function CreateRoomPage() {
  const [category, setCategory] = useState<Category>('movies')
  const [gameMode, setGameMode] = useState<GameMode>('classic')
  const { createRoom, loading } = useRoom()

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Badge variant="primary" className="mb-4">Новая игра</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-2">Создать комнату</h1>
          <p className="text-white/50">Выбери категорию и режим игры</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-purple-400" />
                Категория
              </CardTitle>
              <CardDescription className="text-white/40">Что будем угадывать?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`relative p-4 rounded-xl border transition-all duration-200 text-center ${
                        category === cat.value
                          ? `bg-gradient-to-br ${cat.color} border-transparent shadow-lg`
                          : 'border-white/10 hover:border-white/20 bg-white/5'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${category === cat.value ? 'text-white' : 'text-white/50'}`} />
                      <p className={`text-sm font-medium ${category === cat.value ? 'text-white' : 'text-white/70'}`}>{cat.label}</p>
                      <p className={`text-xs mt-0.5 ${category === cat.value ? 'text-white/70' : 'text-white/30'}`}>{cat.desc}</p>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-pink-400" />
                Режим игры
              </CardTitle>
              <CardDescription className="text-white/40">Как будем играть?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {gameModes.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => setGameMode(mode.value)}
                    className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                      gameMode === mode.value
                        ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-purple-500/30 shadow-lg'
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <p className={`text-sm font-medium ${gameMode === mode.value ? 'text-white' : 'text-white/70'}`}>{mode.label}</p>
                    <p className={`text-xs mt-1 ${gameMode === mode.value ? 'text-white/50' : 'text-white/30'}`}>{mode.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            variant="primary"
            size="xl"
            className="w-full text-base"
            loading={loading}
            onClick={() => createRoom(category, gameMode)}
          >
            Создать комнату
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
