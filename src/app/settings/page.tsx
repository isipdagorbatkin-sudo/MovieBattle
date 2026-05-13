'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, User, AtSign, Save, LogOut } from 'lucide-react'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      if (data) {
        setProfile(data)
        setDisplayName(data.display_name)
        setUsername(data.username)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSaved(false)

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: displayName, username: username.toLowerCase() })
        .eq('id', profile.id)

      if (updateError) throw updateError
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <Badge variant="primary" className="mb-4">Настройки</Badge>
            <h1 className="text-3xl font-bold text-gradient">Настройки аккаунта</h1>
          </div>

          <Card className="border-white/10 bg-white/5 backdrop-blur-xl mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                Профиль
              </CardTitle>
              <CardDescription className="text-white/40">Обнови информацию о себе</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <AtSign className="w-4 h-4 text-white/30" />
                <Input
                  id="username"
                  label="Имя пользователя"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-white/30" />
                <Input
                  id="displayName"
                  label="Отображаемое имя"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
                  {error}
                </p>
              )}

              <Button
                variant="primary"
                onClick={handleSave}
                loading={loading}
                className={saved ? 'bg-green-600 hover:bg-green-600' : ''}
              >
                {saved ? (
                  <>Сохранено!</>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <LogOut className="w-5 h-5 text-red-400" />
                Опасная зона
              </CardTitle>
              <CardDescription className="text-white/40">Выйти из аккаунта</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="danger" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
