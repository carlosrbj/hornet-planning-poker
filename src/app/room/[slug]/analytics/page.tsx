import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getUserPlan, getPlanFeatures } from '@/lib/billing/plans'
import { computeRoomAnalytics } from '@/lib/billing/analytics'
import type { SessionRecord } from '@/lib/types/session'
import AnalyticsClient from './AnalyticsClient'

interface AnalyticsPageProps {
  params: Promise<{ slug: string }>
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: roomData } = await supabase
    .from('rooms')
    .select('id, name, created_by')
    .eq('slug', slug)
    .single()

  if (!roomData) notFound()

  // Verificar se é membro da sala
  const { data: participant } = await supabase
    .from('room_participants')
    .select('id')
    .eq('room_id', roomData.id)
    .eq('user_id', user.id)
    .single()

  const isCreator = roomData.created_by === user.id
  if (!participant && !isCreator) redirect(`/room/${slug}`)

  const planId = await getUserPlan(user.id)
  const features = getPlanFeatures(planId)

  // Pro+ pode ver histórico ilimitado; Pro: 12 meses; outros: mais recentes
  const retentionDays = features.historyRetentionDays
  const cutoffDate = retentionDays
    ? new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString()
    : null

  let query = supabase
    .from('session_history')
    .select('*')
    .eq('room_id', roomData.id)
    .order('completed_at', { ascending: true })

  if (cutoffDate) {
    query = query.gte('completed_at', cutoffDate)
  }

  const { data: sessionsData } = await query

  const allSessions = (sessionsData ?? []) as SessionRecord[]

  // Free e Starter só veem a última sessão para o teaser
  const teaserSession = allSessions.length > 0 ? allSessions[allSessions.length - 1] : null
  const sessionsForAnalytics = features.analytics ? allSessions : (teaserSession ? [teaserSession] : [])

  const analytics = computeRoomAnalytics(sessionsForAnalytics)

  const { data: profileData } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <AnalyticsClient
      roomName={roomData.name}
      roomSlug={slug}
      planId={planId}
      hasAnalytics={features.analytics}
      hasCompareSprints={features.compareSprints}
      analytics={analytics}
      allSessions={features.compareSprints ? allSessions : []}
      userDisplayName={profileData?.display_name ?? undefined}
      userAvatarUrl={profileData?.avatar_url ?? undefined}
    />
  )
}
