import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Room = Database['public']['Tables']['rooms']['Row']

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Rooms created by the user
  const { data: ownRoomsData } = await supabase
    .from('rooms')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  const ownRooms = (ownRoomsData as Room[] | null) ?? []
  const ownRoomIds = new Set(ownRooms.map((r) => r.id))

  // All rooms where user is a participant
  const { data: participantRows } = await supabase
    .from('room_participants')
    .select('room_id')
    .eq('user_id', user.id)

  const participatedIds = (participantRows ?? [])
    .map((p) => p.room_id)
    .filter((id) => !ownRoomIds.has(id))

  let joinedRooms: Room[] = []
  if (participatedIds.length > 0) {
    const { data: joinedData } = await supabase
      .from('rooms')
      .select('*')
      .in('id', participatedIds)
      .order('created_at', { ascending: false })
    joinedRooms = (joinedData as Room[] | null) ?? []
  }

  return (
    <DashboardClient
      userId={user.id}
      profile={(profileData as Profile | null)}
      ownRooms={ownRooms}
      joinedRooms={joinedRooms}
    />
  )
}
