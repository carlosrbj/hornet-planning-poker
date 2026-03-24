import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'
import type { Database } from '@/lib/types/database'
import type { RoomLastSession } from '@/components/dashboard/RoomCard'

type Profile = Database['public']['Tables']['profiles']['Row']
type Room = Database['public']['Tables']['rooms']['Row']

function computeAvgCv(voteAnalytics: unknown): number {
  if (!voteAnalytics || typeof voteAnalytics !== 'object') return 0
  const va = voteAnalytics as { issues?: Array<{ stats?: { coefficientOfVariation?: number } }> }
  const cvs = (va.issues ?? [])
    .map((i) => i.stats?.coefficientOfVariation ?? null)
    .filter((v): v is number => v !== null)
  if (cvs.length === 0) return 0
  return Math.round((cvs.reduce((a, b) => a + b, 0) / cvs.length) * 10) / 10
}

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

  // Latest closed session per own room
  const roomLastSession: Record<string, RoomLastSession> = {}
  if (ownRooms.length > 0) {
    const { data: sessions } = await supabase
      .from('session_history')
      .select('room_id, completed_at, total_issues, total_estimated, total_hours_estimated, vote_analytics')
      .in('room_id', ownRooms.map((r) => r.id))
      .order('completed_at', { ascending: false })

    // Keep only the most recent session per room
    for (const s of sessions ?? []) {
      if (roomLastSession[s.room_id]) continue
      roomLastSession[s.room_id] = {
        completedAt: s.completed_at,
        totalIssues: s.total_issues ?? 0,
        totalEstimated: s.total_estimated ?? 0,
        totalHours: s.total_hours_estimated ?? 0,
        avgCv: computeAvgCv(s.vote_analytics),
      }
    }
  }

  return (
    <DashboardClient
      userId={user.id}
      profile={(profileData as Profile | null)}
      ownRooms={ownRooms}
      joinedRooms={joinedRooms}
      roomLastSession={roomLastSession}
    />
  )
}
