import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateRoomCode } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const { code: inviteCode } = await request.json()
    const supabase = await createServerSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (inviteCode) {
      const { data: room } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', inviteCode.toUpperCase())
        .maybeSingle()

      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 })
      }

      if (room.status !== 'waiting') {
        return NextResponse.json({ error: 'Game already started' }, { status: 400 })
      }

      const { count } = await supabase
        .from('room_players')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id)

      if (count && count >= room.max_players) {
        return NextResponse.json({ error: 'Room is full' }, { status: 400 })
      }

      const { data: existing } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', room.id)
        .eq('player_id', user.id)
        .maybeSingle()

      if (existing) {
        return NextResponse.json({ room })
      }

      const { error: joinError } = await supabase
        .from('room_players')
        .insert({ room_id: room.id, player_id: user.id })

      if (joinError) {
        return NextResponse.json({ error: joinError.message }, { status: 400 })
      }

      return NextResponse.json({ room })
    }

    return NextResponse.json({ error: 'No code provided' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
