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
    title: 'Угадай по описанию',
    description: 'Читай описание и вводи название — никаких вариантов, только твои знания.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Users,
    title: 'Многопользовательский режим',
    description: 'До 4 игроков в комнате. Кто быстрее — тот молодец.',
    gradient: 'from-pink-500 to-orange-500',
  },
  {
    icon: Trophy,
    title: 'Таблица лидеров',
    description: 'Соревнуйся с другими игроками и поднимайся в рейтинге.',
    gradient: 'from-orange-500 to-yellow-500',
  },
  {
    icon: Zap,
    title: 'Скоростные раунды',
    description: '15 секунд на вопрос — успевай угадать, пока время не вышло.',
    gradient: 'from-green-500 to-emerald-500',
  },
]

const categories = [
  { name: 'Фильмы и сериалы', subtitle: 'Блокбастеры и сериалы', color: 'from-purple-500 to-indigo-500', count: '100+' },
  { name: 'Аниме', subtitle: 'Романтика', color: 'from-pink-500 to-rose-500', count: '100+' },
]

export default function LandingPage() {
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95])

  return (
    <div className="relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '3s' }} />
      </div>

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
            Викторина по фильмам и аниме
          </Badge>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            <span className="text-gradient">Угадай</span>
            <br />
            <span className="text-gradient-premium">Фильм. Сериал. Аниме.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Многопользовательские баталии. Два режима игры.
            <br />
            Читай описание и вводи название. Проверь, как хорошо ты знаешь свои любимые фильмы и аниме.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button variant="primary" size="xl" className="text-base w-full sm:w-auto">
                Начать игру
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="xl" className="text-base w-full sm:w-auto">
                Войти
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 text-white/40 text-sm">
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500/60" />
              Бесплатно
            </span>
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400/60" />
              Мультиплеер
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-400/60" />
              Быстрые игры
            </span>
          </div>
        </motion.div>
      </motion.section>

      <section className="relative px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeUp}>
            <Badge variant="primary" className="mb-4 px-3 py-1">Категории</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gradient mb-4">
              Выбери свою категорию
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Две категории с тщательно отобранными популярными названиями. Только то, что ты реально знаешь.
            </p>
          </motion.div>

          <motion.div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto" {...stagger}>
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
                <Badge variant="default">{cat.count} названий</Badge>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeUp}>
            <Badge variant="primary" className="mb-4 px-3 py-1">Возможности</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gradient mb-4">
              Создано для соревнований
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Каждая деталь сделана так, чтобы угадывать было быстро, честно и увлекательно.
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

      <section className="relative px-4 py-32">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <Badge variant="premium" className="mb-4 px-3 py-1">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
              Готов?
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gradient mb-6">
              Начни свою первую битву
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-lg mx-auto">
              Создай комнату, пригласи друзей и докажи, что ты знаешь больше.
            </p>
            <Link href="/register">
              <Button variant="primary" size="xl" className="text-base glow-purple">
                Создать аккаунт бесплатно
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="relative border-t border-white/5 px-4 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white/30 text-sm">
            <Gamepad2 className="w-4 h-4" />
            MovieBattle
          </div>
          <p className="text-white/20 text-xs">
            Создано для фанатов фильмов, сериалов и аниме.
          </p>
        </div>
      </footer>
    </div>
  )
}
