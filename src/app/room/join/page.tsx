'use client'

import { useState } from 'react'
import { useRoom } from '@/hooks/use-room'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { LogIn, ArrowRight } from 'lucide-react'

export default function JoinRoomPage() {
  const [code, setCode] = useState('')
  const { joinRoom, loading, error } = useRoom()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim()) joinRoom(code.trim())
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Badge variant="primary" className="mb-4">Присоединиться</Badge>
          <h1 className="text-3xl font-bold text-gradient mb-2">Введите код комнаты</h1>
          <p className="text-white/40">Попроси у друга код приглашения</p>
        </div>

        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center">
                <Input
                  id="code"
                  placeholder="например ABC123"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="text-center text-2xl font-bold tracking-[0.3em] h-14"
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20 text-center"
                >
                  {error}
                </motion.p>
              )}

              <Button variant="primary" size="lg" className="w-full" loading={loading}>
                Присоединиться
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
