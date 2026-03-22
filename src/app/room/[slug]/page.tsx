import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import RoomClient from './RoomClient'
import type { Database } from '@/lib/types/database'

type Room = Database['public']['Tables']['rooms']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type RoomParticipant = Database['public']['Tables']['room_participants']['Row']

interface RoomPageProps {
  params: Promise<{ slug: string }>
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: roomData } = await supabase
    .from('rooms')
    .select('*')
    .eq('slug', slug)
    .single()

  const room = roomData as Room | null
  if (!room) notFound()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileData as Profile | null

  const { data: participantData } = await supabase
    .from('room_participants')
    .select('*')
    .eq('room_id', room.id)
    .eq('user_id', user.id)
    .single()

  const participant = participantData as RoomParticipant | null

  if (!participant) {
    await supabase.from('room_participants').insert({
      room_id: room.id,
      user_id: user.id,
      role: 'voter',
    })
  }

  const { data: jiraConn } = await supabase
    .from('jira_connections')
    .select('site_name')
    .eq('user_id', user.id)
    .single()

  return (
    <RoomClient
      initialRoom={room}
      userId={user.id}
      userRole={(participant?.role as 'facilitator' | 'voter' | 'spectator') ?? 'voter'}
      userDisplayName={profile?.display_name ?? ''}
      userAvatarUrl={profile?.avatar_url ?? null}
      jiraSiteName={jiraConn?.site_name ?? null}
    />
  )
}
