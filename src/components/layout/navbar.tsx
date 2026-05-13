'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Trophy,
  Settings,
  LogOut,
  Menu,
  X,
  Gamepad2,
  Users,
} from 'lucide-react'

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
        setProfile(data)
      }
    }
    getUser()

    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isActive = (path: string) => pathname === path

  const links = user
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
        { href: '/settings', label: 'Settings', icon: Settings },
      ]
    : [
        { href: '/login', label: 'Login' },
        { href: '/register', label: 'Register' },
      ]

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-black/80 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/10'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 blur-lg group-hover:blur-xl transition-all" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              MovieBattle
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = (link as any).icon
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'relative',
                      isActive(link.href) && 'text-white bg-white/10'
                    )}
                  >
                    {Icon && <Icon className="w-4 h-4 mr-2" />}
                    {link.label}
                  </Button>
                </Link>
              )
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href={`/profile/${user.id}`}>
                  <Avatar size="sm" className="cursor-pointer hover:ring-purple-500/50 transition-all">
                    <AvatarImage src={profile?.avatar_url} alt={profile?.display_name} />
                    <AvatarFallback>
                      {profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-white/70 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-2xl"
          >
            <div className="px-4 py-4 space-y-2">
              {links.map((link) => {
                const Icon = (link as any).icon
                return (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start',
                        isActive(link.href) && 'text-white bg-white/10'
                      )}
                    >
                      {Icon && <Icon className="w-4 h-4 mr-2" />}
                      {link.label}
                    </Button>
                  </Link>
                )
              })}
              {user && (
                <>
                  <Link href={`/profile/${user.id}`} onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start text-red-400" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
