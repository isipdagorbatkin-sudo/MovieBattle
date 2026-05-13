'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Clapperboard, Sparkles, Gamepad2, Swords, X } from 'lucide-react'
import type { Category, GameMode } from '@/types'

interface SoloGameModalProps {
  open: boolean
  onClose: () => void
  onStart: (category: Category, gameMode: GameMode) => void
  loading?: boolean
}

const categories: { value: Category; label: string; icon: typeof Clapperboard; color: string }[] = [
  { value: 'movies', label: 'Movies & Series', icon: Clapperboard, color: 'from-purple-500 to-indigo-500' },
  { value: 'anime', label: 'Anime', icon: Sparkles, color: 'from-pink-500 to-rose-500' },
]

const gameModes: { value: GameMode; label: string; desc: string }[] = [
  { value: 'classic', label: 'Classic Guess', desc: 'Guess by poster or frame' },
  { value: 'character', label: 'Character Guess', desc: 'Guess by character' },
  { value: 'quote', label: 'Quote Guess', desc: 'Guess by quote' },
  { value: 'blur', label: 'Blur Mode', desc: 'Blurred image, unblurs over time' },
  { value: 'timer', label: 'Timer Rush', desc: 'Rapid-fire questions' },
]

export function SoloGameModal({ open, onClose, onStart, loading }: SoloGameModalProps) {
  const [category, setCategory] = useState<Category>('movies')
  const [gameMode, setGameMode] = useState<GameMode>('classic')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a1a] p-6 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Solo Game</h2>
            <p className="text-sm text-white/40">Choose your settings</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-white/70 mb-3">Category</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`p-3 rounded-xl border transition-all text-center ${
                      category === cat.value
                        ? `bg-gradient-to-br ${cat.color} border-transparent shadow-lg`
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${category === cat.value ? 'text-white' : 'text-white/50'}`} />
                    <p className={`text-xs font-medium ${category === cat.value ? 'text-white' : 'text-white/70'}`}>
                      {cat.label}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Gamepad2 className="w-4 h-4 text-pink-400" />
              <p className="text-sm font-medium text-white/70">Game Mode</p>
            </div>
            <div className="grid gap-2">
              {gameModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setGameMode(mode.value)}
                  className={`p-3 rounded-xl border transition-all text-left ${
                    gameMode === mode.value
                      ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-purple-500/30 shadow-lg'
                      : 'border-white/10 hover:border-white/20 bg-white/5'
                  }`}
                >
                  <p className={`text-sm font-medium ${gameMode === mode.value ? 'text-white' : 'text-white/70'}`}>
                    {mode.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${gameMode === mode.value ? 'text-white/50' : 'text-white/30'}`}>
                    {mode.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
            onClick={() => onStart(category, gameMode)}
          >
            <Swords className="w-4 h-4 mr-2" />
            Start Solo Game
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
