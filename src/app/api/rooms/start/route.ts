import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateQuestions } from '@/lib/game-engine'
import { shuffleArray } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const { roomId } = await request.json()
    if (!roomId) {
      return NextResponse.json({ error: 'Missing roomId' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    const { data: room } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .maybeSingle()

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== room.host_id) {
      return NextResponse.json({ error: 'Only host can start' }, { status: 403 })
    }

    const questions = await generateQuestions(room.category, room.game_mode, 10)

    const rounds = questions.map((q, i) => ({
      room_id: roomId,
      round_number: i + 1,
      question_type: q.type,
      correct_answer: q.correctAnswer,
      options: q.options,
      media_url: q.mediaUrl,
      clue: q.clue,
      time_limit: q.timeLimit,
    }))

    const { error: deleteError } = await supabase
      .from('rounds')
      .delete()
      .eq('room_id', roomId)

    const { data: insertedRounds, error: roundsError } = await supabase
      .from('rounds')
      .insert(rounds)
      .select()

    if (roundsError) {
      return NextResponse.json({ error: roundsError.message }, { status: 500 })
    }

    await supabase
      .from('rooms')
      .update({ status: 'playing' })
      .eq('id', roomId)

    return NextResponse.json({ success: true, rounds: insertedRounds })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
