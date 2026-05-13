import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-screen bg-background text-foreground noise-bg">
        <Navbar />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  )
}
