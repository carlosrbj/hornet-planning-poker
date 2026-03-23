import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getUserPlan, getPlanFeatures } from '@/lib/billing/plans'
import HistoryClient from './HistoryClient'
import type { SessionRecord } from '@/lib/types/session'

interface HistoryPageProps {
  params: Promise<{ slug: string }>
}

export default async function HistoryPage({ params }: HistoryPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar que a sala existe
  const { data: room } = await supabase
    .from('rooms')
    .select('id, name, slug, created_by')
    .eq('slug', slug)
    .single()

  if (!room) notFound()

  // Verificar que o usuário tem acesso à sala (é participante ou criador)
  const { data: participant } = await supabase
    .from('room_participants')
    .select('id')
    .eq('room_id', room.id)
    .eq('user_id', user.id)
    .single()

  if (!participant && room.created_by !== user.id) redirect(`/room/${slug}`)

  const planId = await getUserPlan(user.id)
  const features = getPlanFeatures(planId)
  const limit = features.maxHistorySessions // null = ilimitado, 1 = free

  // Buscar sessões com limite do plano
  let query = supabase
    .from('session_history')
    .select('*')
    .eq('room_id', room.id)
    .order('completed_at', { ascending: false })

  // Para free, busca apenas 2 para saber se há mais (para mostrar o teaser)
  if (limit !== null) {
    query = query.limit(limit + 1)
  }

  const { data: sessions } = await query

  const allSessions = (sessions ?? []) as SessionRecord[]

  // hasMore: existe mais sessão que o limite do plano
  const hasMore = limit !== null && allSessions.length > limit
  const visibleSessions = hasMore ? allSessions.slice(0, limit) : allSessions
  const hiddenCount = hasMore ? allSessions.length - limit : 0

  const isRoomOwner = room.created_by === user.id

  return (
    <HistoryClient
      roomName={room.name}
      roomSlug={slug}
      sessions={visibleSessions}
      hasMore={hasMore}
      hiddenCount={hiddenCount}
      planId={planId}
      canExportCsv={features.exportCsv}
      isRoomOwner={isRoomOwner}
    />
  )
}
