'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Gamepad2, Zap, Users, Trophy, Sparkles, ArrowRight, Star, Clock, Brain } from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
}

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { staggerChildren: 0.1, delayChildren: 0.2 },
}

const features = [
  {
    icon: Brain,
    title: '5 Game Modes',
    description: 'Classic, Character, Quote, Blur & Timer Rush — each mode tests different skills.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Users,
    title: 'Multiplayer Mayhem',
    description: 'Up to 4 players per room. Real-time answers, instant scoring, zero lag.',
    gradient: 'from-pink-500 to-orange-500',
  },
  {
    icon: Trophy,
    title: 'Leaderboard Glory',
    description: 'Climb the global ranks. Every win pushes you higher on the leaderboard.',
    gradient: 'from-orange-500 to-yellow-500',
  },
  {
    icon: Zap,
    title: 'Speed Matters',
    description: 'Fastest correct answer gets max points. Hesitate and lose the round.',
    gradient: 'from-green-500 to-emerald-500',
  },
]

const categories = [
  { name: 'Anime', subtitle: 'Romance only', color: 'from-pink-500 to-rose-500', count: '200+' },
  { name: 'Movies', subtitle: 'Blockbusters', color: 'from-purple-500 to-indigo-500', count: '500+' },
  { name: 'Series', subtitle: 'Popular shows', color: 'from-blue-500 to-cyan-500', count: '300+' },
]

export default function LandingPage() {
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95])

  return (
    <div className="relative overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '3s' }} />
      </div>

      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <Badge variant="premium" className="mb-6 px-4 py-1.5 text-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
            Multiplayer Quiz Game
          </Badge>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            <span className="text-gradient">Guess the</span>
            <br />
            <span className="text-gradient-premium">Movie. Anime. Series.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Real-time multiplayer battles. Five game modes. Up to 4 players.
            <br />
            Fastest finger wins. How well do you know your screens?
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button variant="primary" size="xl" className="text-base w-full sm:w-auto">
                Start Playing
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="xl" className="text-base w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 text-white/40 text-sm">
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500/60" />
              Free to play
            </span>
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400/60" />
              Real-time multiplayer
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-400/60" />
              Quick matches
            </span>
          </div>
        </motion.div>
      </motion.section>

      {/* Categories */}
      <section className="relative px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeUp}>
            <Badge variant="primary" className="mb-4 px-3 py-1">Categories</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gradient mb-4">
              Choose Your Battlefield
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Three categories with hand-picked popular titles. Nothing obscure — only what you actually know.
            </p>
          </motion.div>

          <motion.div className="grid md:grid-cols-3 gap-6" {...stagger}>
            {categories.map((cat) => (
              <motion.div
                key={cat.name}
                whileHover={{ scale: 1.02, y: -4 }}
                className="glass-strong rounded-2xl p-8 text-center group cursor-pointer transition-all"
              >
                <div className={`w-16 h-16 mx-auto mb-5 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg`}>
                  <Gamepad2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{cat.name}</h3>
                <p className="text-white/40 mb-3">{cat.subtitle}</p>
                <Badge variant="default">{cat.count} titles</Badge>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeUp}>
            <Badge variant="primary" className="mb-4 px-3 py-1">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gradient mb-4">
              Built for Competition
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Every detail designed to make guessing fast, fair, and addictive.
            </p>
          </motion.div>

          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" {...stagger}>
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="glass rounded-2xl p-6 group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-4 py-32">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <Badge variant="premium" className="mb-4 px-3 py-1">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
              Ready?
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gradient mb-6">
              Start Your First Battle
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-lg mx-auto">
              Create a room, invite friends, and prove you know more than they do.
            </p>
            <Link href="/register">
              <Button variant="primary" size="xl" className="text-base glow-purple">
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 px-4 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/30 text-sm">
            <Gamepad2 className="w-4 h-4" />
            MovieBattle
          </div>
          <p className="text-white/20 text-xs">
            Built for movie, anime & series fans. Not affiliated with any studio.
          </p>
        </div>
      </footer>
    </div>
  )
}
