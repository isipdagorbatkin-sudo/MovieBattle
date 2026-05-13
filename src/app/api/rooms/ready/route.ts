import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { roomId } = await request.json()
    if (!roomId) return NextResponse.json({ error: 'Missing roomId' }, { status: 400 })

    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: player } = await supabase
      .from('room_players')
      .select('id, is_ready')
      .eq('room_id', roomId)
      .eq('player_id', user.id)
      .maybeSingle()

    if (!player) return NextResponse.json({ error: 'Not in room' }, { status: 404 })

    const { error: updateError } = await supabase
      .from('room_players')
      .update({ is_ready: !player.is_ready })
      .eq('id', player.id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Ready]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
