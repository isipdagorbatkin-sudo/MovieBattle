import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'

export const metadata: Metadata = {
  title: 'MovieBattle - Guess the Movie, Anime & Series',
  description:
    'Multiplayer quiz game where you compete in guessing movies, anime, and series. Play with friends in real-time!',
  keywords: ['movie quiz', 'anime quiz', 'multiplayer game', 'trivia', 'movie battle'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-screen bg-background text-foreground noise-bg font-sans">
        <Navbar />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  )
}
