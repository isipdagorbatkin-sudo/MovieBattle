'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { calculatePoints } from '@/lib/utils'
import { getCategoryTitles } from '@/lib/game-data'
import type { Room, RoomPlayer, Round } from '@/types'
import {
  Zap,
  Clock,
  Trophy,
  Sparkles,
  Timer,
  Image,
  MessageSquare,
  User,
  HelpCircle,
  Search,
} from 'lucide-react'

interface GameScreenProps {
  room: Room
  initialPlayers: RoomPlayer[]
}

type QuestionType = 'poster' | 'character' | 'blur' | 'description'

export function GameScreen({ room, initialPlayers }: GameScreenProps) {
  const [players, setPlayers] = useState<RoomPlayer[]>(initialPlayers)
  const [rounds, setRounds] = useState<Round[]>([])
  const [roundIndex, setRoundIndex] = useState(-1)
  const [timeLeft, setTimeLeft] = useState(15)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [lastResult, setLastResult] = useState<{ correct: boolean; points: number } | null>(null)
  const [blurAmount, setBlurAmount] = useState(20)
  const [gameOver, setGameOver] = useState(false)
  const [playerScores, setPlayerScores] = useState<Record<string, number>>({})
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()
  const isPollingRef = useRef(false)

  useEffect(() => {
    const scores: Record<string, number> = {}
    players.forEach(p => { scores[p.player_id] = p.score })
    setPlayerScores(scores)
  }, [players])

  useEffect(() => {
    if (isPollingRef.current) return
    isPollingRef.current = true
    const poll = setInterval(async () => {
      const { data } = await supabase
        .from('room_players')
        .select('*, player:profiles(*)')
        .eq('room_id', room.id)
      if (data) {
        setPlayers(data)
      }
    }, 2000)
    return () => { clearInterval(poll); isPollingRef.current = false }
  }, [room.id])

  useEffect(() => {
    const loadRounds = async () => {
      const { data } = await supabase
        .from('rounds')
        .select('*')
        .eq('room_id', room.id)
        .order('round_number', { ascending: true })

      if (data && data.length > 0) {
        setRounds(data)
        setRoundIndex(0)
      }
    }
    loadRounds()
  }, [room.id])

  const currentRound = roundIndex >= 0 && roundIndex < rounds.length ? rounds[roundIndex] : null

  useEffect(() => {
    if (!currentRound) return

    if (room.game_mode === 'blur') {
      setBlurAmount(20)
      const interval = setInterval(() => {
        setBlurAmount((prev) => Math.max(0, prev - 1))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [currentRound?.id])

  useEffect(() => {
    if (!currentRound) return
    setTimeLeft(Math.floor(currentRound.time_limit / 1000))
    setHasAnswered(false)
    setLastResult(null)
    setInputValue('')
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentRound?.id])

  useEffect(() => {
    if (!currentRound || roundIndex < 0) return
    const transition = () => {
      const next = roundIndex + 1
      if (next < rounds.length) {
        setRoundIndex(next)
      } else {
        setGameOver(true)
      }
    }
    if (hasAnswered) {
      const delay = setTimeout(transition, 2000)
      return () => clearTimeout(delay)
    }
  }, [hasAnswered])

  useEffect(() => {
    if (!currentRound || roundIndex < 0 || hasAnswered || timeLeft !== 0) return
    const delay = setTimeout(() => {
      const next = roundIndex + 1
      if (next < rounds.length) {
        setRoundIndex(next)
      } else {
        setGameOver(true)
      }
    }, 2000)
    return () => clearTimeout(delay)
  }, [timeLeft])

  useEffect(() => {
    if (gameOver) {
      const timeout = setTimeout(() => router.push(`/results/${room.id}`), 2000)
      return () => clearTimeout(timeout)
    }
  }, [gameOver])

  const handleAnswer = useCallback(async (answer: string) => {
    if (hasAnswered || !currentRound) return
    setHasAnswered(true)
    setShowSuggestions(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const normalizedAnswer = answer.trim().toLowerCase()
    const normalizedCorrect = currentRound.correct_answer.trim().toLowerCase()
    const isCorrect = normalizedAnswer === normalizedCorrect

    const points = isCorrect ? calculatePoints(0, currentRound.time_limit) : 0

    setLastResult({ correct: isCorrect, points })

    await supabase.from('guesses').insert({
      round_id: currentRound.id,
      player_id: user.id,
      answer,
      is_correct: isCorrect,
      time_ms: 0,
      points,
    })

    if (isCorrect) {
      const { data: updatedPlayer } = await supabase
        .from('room_players')
        .update({ score: (playerScores[user.id] || 0) + points })
        .eq('room_id', room.id)
        .eq('player_id', user.id)
        .select()
        .maybeSingle()

      if (updatedPlayer) {
        setPlayerScores((prev) => ({ ...prev, [user.id]: updatedPlayer.score }))
      }
    }
  }, [hasAnswered, currentRound, playerScores, room.id])

  const progress = currentRound ? (timeLeft / (currentRound.time_limit / 1000)) * 100 : 100

  const modeIcon = {
    classic: Image,
    character: User,
    quote: MessageSquare,
    blur: Image,
    timer: Zap,
  }[room.game_mode]

  const ModeIconComponent = modeIcon || HelpCircle

  const allTitles = currentRound ? getCategoryTitles(room.category) : []

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    if (value.trim().length > 0 && !hasAnswered) {
      const filtered = allTitles.filter(t =>
        t.toLowerCase().includes(value.trim().toLowerCase())
      ).slice(0, 8)
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (title: string) => {
    setInputValue(title)
    setShowSuggestions(false)
    handleAnswer(title)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !hasAnswered) {
      handleAnswer(inputValue.trim())
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <ModeIconComponent className="w-5 h-5 text-white" />
            </div>
            <div>
              <Badge variant="primary" className="text-[10px]">
                Вопрос {roundIndex + 1}/{rounds.length}
              </Badge>
              <p className="text-xs text-white/40 mt-0.5">
                Угадай по описанию
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-white/40" />
            <span className={`text-lg font-bold font-mono ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Timer Bar */}
        <div className="h-1.5 bg-white/5 rounded-full mb-8 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              timeLeft <= 5 ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRound?.id || 'waiting'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl mb-8">
              <CardContent className="p-8 text-center">
                {!currentRound ? (
                  <div className="py-12">
                    <Sparkles className="w-16 h-16 text-purple-400/50 mx-auto mb-4 animate-pulse" />
                    <h2 className="text-2xl font-bold text-gradient mb-2">Приготовься!</h2>
                    <p className="text-white/40">Загрузка вопросов...</p>
                  </div>
                ) : (
                  <>
                    {room.game_mode === 'blur' && currentRound.media_url ? (
                      <div className="relative max-w-md mx-auto mb-6">
                        <img
                          src={currentRound.media_url}
                          alt="Blurred"
                          className="w-full rounded-xl"
                          style={{ filter: `blur(${blurAmount}px)` }}
                        />
                      </div>
                    ) : room.game_mode === 'classic' && currentRound.media_url ? (
                      <div className="max-w-md mx-auto mb-6">
                        <img
                          src={currentRound.media_url}
                          alt="Guess"
                          className="w-full rounded-xl shadow-2xl"
                        />
                      </div>
                    ) : room.game_mode === 'character' ? (
                      <div className="mb-6 py-4">
                        <p className="text-lg text-white/50 mb-4">Угадай по фото персонажа</p>
                        {currentRound.media_url ? (
                          <div className="max-w-xs mx-auto mb-4">
                            <img
                              src={currentRound.media_url}
                              alt="Персонаж"
                              className="w-full rounded-xl shadow-2xl"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          </div>
                        ) : (
                          <div className="mb-6">
                            <User className="w-16 h-16 text-pink-400/50 mx-auto mb-4" />
                          </div>
                        )}
                        {!currentRound.media_url && currentRound.clue && (
                          <p className="text-2xl font-bold text-white/90 mt-2">&ldquo;{currentRound.clue}&rdquo;</p>
                        )}
                      </div>
                    ) : (
                      <div className="mb-6 py-8">
                        <HelpCircle className="w-10 h-10 text-purple-400 mx-auto mb-4" />
                        <p className="text-xl text-white/80 leading-relaxed">{currentRound.clue || 'Что это?'}</p>
                      </div>
                    )}

                    <p className="text-sm text-white/30 mt-4">
                        {room.game_mode === 'character'
                          ? 'Угадай аниме/фильм/сериал по фото персонажа'
                          : room.game_mode === 'blur'
                            ? 'Угадай по размытому изображению'
                            : 'Угадай по описанию'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Autocomplete Input */}
            <form onSubmit={handleSubmit} className="relative mb-8 max-w-lg mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={() => inputValue.trim() && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Введи название..."
                  disabled={hasAnswered || timeLeft === 0}
                  className={`w-full pl-12 pr-4 py-4 rounded-xl text-lg bg-white/10 border text-white placeholder-white/30 outline-none transition-colors ${
                    hasAnswered
                      ? 'border-white/10'
                      : 'border-white/20 focus:border-purple-500'
                  } disabled:opacity-50`}
                />
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-20 top-full mt-2 left-0 right-0 bg-zinc-800 border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                >
                  {suggestions.map((title, i) => (
                    <button
                      key={i}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleSuggestionClick(title)
                      }}
                      className={`w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/10 transition-colors ${
                        i < suggestions.length - 1 ? 'border-b border-white/5' : ''
                      }`}
                    >
                      {title}
                    </button>
                  ))}
                </motion.div>
              )}
            </form>

            {/* Result Feedback */}
            <AnimatePresence>
              {lastResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`text-center p-4 rounded-xl mb-6 ${
                    lastResult.correct
                      ? 'bg-green-500/10 border border-green-500/20'
                      : 'bg-red-500/10 border border-red-500/20'
                  }`}
                >
                  <p className={`text-lg font-bold ${lastResult.correct ? 'text-green-400' : 'text-red-400'}`}>
                    {lastResult.correct ? `+${lastResult.points} очков!` : 'Неверно!'}
                  </p>
                  <p className="text-sm text-white/40 mt-1">
                    Ответ: {currentRound?.correct_answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Player Scores */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-white/50 mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Счёт
                </h3>
                <div className="space-y-2">
                  {players
                    .sort((a, b) => (playerScores[b.player_id] || 0) - (playerScores[a.player_id] || 0))
                    .map((player, i) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/30 w-4">{i + 1}.</span>
                          <Avatar size="sm">
                            <AvatarImage src={(player.player as any)?.avatar_url} />
                            <AvatarFallback>
                              {(player.player as any)?.display_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-white">
                            {(player.player as any)?.display_name || 'Unknown'}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-white">
                          {playerScores[player.player_id] || 0}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gradient mb-2">Игра окончена!</h2>
              <p className="text-white/40">Переход к результатам...</p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
