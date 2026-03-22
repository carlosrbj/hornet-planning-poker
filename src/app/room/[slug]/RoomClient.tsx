'use client'

import { useEffect, useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRoomStore } from '@/stores/roomStore'
import { useRoom } from '@/hooks/useRoom'
import { useVoting } from '@/hooks/useVoting'
import { usePresence } from '@/hooks/usePresence'
import { useBroadcast } from '@/hooks/useBroadcast'
import { useTimer } from '@/hooks/useTimer'
import { analyzeVotes } from '@/lib/utils/consensus'
import Navbar from '@/components/layout/Navbar'
import IssueList from '@/components/room/IssueList'
import IssueCard from '@/components/room/IssueCard'
import CardDeck from '@/components/room/CardDeck'
import ParticipantList from '@/components/room/ParticipantList'
import VoteReveal from '@/components/room/VoteReveal'
import FacilitatorControls from '@/components/room/FacilitatorControls'
import Timer from '@/components/room/Timer'
import CoffeeBreak from '@/components/room/CoffeeBreak'
import Confetti from '@/components/room/Confetti'
import EmojiReactions from '@/components/room/EmojiReactions'
import InviteModal from '@/components/room/InviteModal'
import SprintTable from '@/components/room/SprintTable'
import SprintCharts from '@/components/room/SprintCharts'
import type { Database } from '@/lib/types/database'
import type { DeckType } from '@/lib/utils/deck'

type Room = Database['public']['Tables']['rooms']['Row']
type Vote = Database['public']['Tables']['votes']['Row']

type MobileTab = 'issues' | 'voting' | 'sprint' | 'team'
type DesktopView = 'poker' | 'sprint' | 'charts'

interface RoomClientProps {
  initialRoom: Room
  userId: string
  userRole: 'facilitator' | 'voter' | 'spectator'
  userDisplayName: string
  userAvatarUrl: string | null
  jiraSiteName?: string | null
}

export default function RoomClient({
  initialRoom,
  userId,
  userRole,
  userDisplayName,
  userAvatarUrl,
  jiraSiteName,
}: RoomClientProps) {
  const { room, issues, currentIssueId, votes, onlineUsers, setRoom, setCurrentIssueId, setVotes } = useRoomStore()
  const isFacilitator = userRole === 'facilitator'
  const [coffeeBreakActive, setCoffeeBreakActive] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [desktopView, setDesktopView] = useState<DesktopView>('poker')
  const [mobileTab, setMobileTab] = useState<MobileTab>('voting')
  const [mobileSprintView, setMobileSprintView] = useState<'table' | 'charts'>('table')
  // Issue visualizada localmente (convidados podem navegar sem afetar a sala)
  const [localViewingId, setLocalViewingId] = useState<string | null>(null)

  const timerSeconds = (room?.settings as Record<string, number> | null)?.timer_seconds ?? 120

  useEffect(() => {
    setRoom(initialRoom)
  }, [initialRoom.id, setRoom])

  useRoom(initialRoom.slug)

  const { send, onEvent } = useBroadcast(initialRoom.slug)
  const { castVote, removeVote, revealVotes, nextIssue, reVote, skipIssue, selectedCard } = useVoting(userId)
  const setSelectedCard = useRoomStore((s) => s.setSelectedCard)
  const { updateVoteStatus } = usePresence(initialRoom.slug, {
    user_id: userId,
    display_name: userDisplayName,
    avatar_url: userAvatarUrl,
    role: userRole,
    hasVoted: false,
  })

  const handleTimerExpire = useCallback(() => {
    if (isFacilitator) handleReveal()
  }, [isFacilitator])

  const { secondsLeft, isRunning, start, stop } = useTimer(handleTimerExpire)

  useEffect(() => {
    onEvent('REVEAL_CARDS', () => revealVotes())
    onEvent('NEXT_ISSUE', async () => { await nextIssue(); await updateVoteStatus(false) })
    onEvent('RE_VOTE', async () => { await reVote(); await updateVoteStatus(false) })
    onEvent('COFFEE_BREAK', () => setCoffeeBreakActive(true))
    onEvent('TIMER_START', (payload) => {
      const secs = (payload as { seconds?: number }).seconds ?? timerSeconds
      start(secs)
    })
    onEvent('TIMER_STOP', () => stop())
    onEvent('EMOJI_REACTION', (payload) => {
      const emoji = (payload as { emoji?: string }).emoji
      if (emoji && typeof window !== 'undefined') {
        const addFn = (window as Window & { __addEmojiReaction?: (e: string) => void }).__addEmojiReaction
        addFn?.(emoji)
      }
    })
    onEvent('SWITCH_ISSUE', (payload) => {
      const issueId = (payload as { issueId?: string }).issueId
      if (!issueId) return
      setCurrentIssueId(issueId)
      const supabase = createClient()
      supabase.from('votes').select('*').eq('issue_id', issueId).then(({ data }) => {
        if (data) setVotes(data as Vote[])
      })
    })
  }, [])

  const currentIssue = issues.find((i) => i.id === currentIssueId)
  const isRevealed = currentIssue?.status === 'revealed'
  const isVoting = currentIssue?.status === 'voting'
  const currentVotes = votes.filter((v) => v.issue_id === currentIssueId)
  const hasPendingIssues = issues.some((i) => i.status === 'pending')

  // Issue exibida na área central (convidados podem navegar localmente)
  const displayedIssueId = localViewingId ?? currentIssueId
  const displayedIssue = issues.find((i) => i.id === displayedIssueId)
  const displayedIndex = issues.findIndex((i) => i.id === displayedIssueId)
  const isViewingDifferent = !isFacilitator && !!localViewingId && localViewingId !== currentIssueId

  // Auto-switch mobile tab para "voting" quando votação inicia
  useEffect(() => {
    if (isVoting) setMobileTab('voting')
  }, [isVoting, currentIssueId])

  // Quando o facilitador inicia uma nova votação, traz todos de volta automaticamente
  useEffect(() => {
    if (isVoting) setLocalViewingId(null)
  }, [currentIssueId, isVoting])

  // Limpa a carta selecionada ao trocar de issue
  useEffect(() => {
    setSelectedCard(null)
  }, [currentIssueId, setSelectedCard])

  // Convidados navegam localmente sem alterar o estado da sala
  const handleBrowseIssue = useCallback((issueId: string) => {
    setLocalViewingId(issueId === currentIssueId ? null : issueId)
    setMobileTab('voting')
  }, [currentIssueId])

  useEffect(() => {
    if (isRevealed && currentVotes.length > 0) {
      const analysis = analyzeVotes(currentVotes.map((v) => v.value))
      if (analysis?.strongConsensus) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 4000)
      }
    }
  }, [isRevealed])

  const handleSelectIssue = useCallback(async (issueId: string) => {
    const issue = issues.find((i) => i.id === issueId)
    if (!issue) return

    if (issue.status === 'pending') {
      const supabase = createClient()
      await supabase
        .from('issues')
        .update({ status: 'voting', updated_at: new Date().toISOString() })
        .eq('id', issueId)
    } else {
      setCurrentIssueId(issueId)
      await send('SWITCH_ISSUE', { issueId })
      const supabase = createClient()
      const { data } = await supabase.from('votes').select('*').eq('issue_id', issueId)
      if (data) setVotes(data as Vote[])
    }
    // Volta pro tab de votação no mobile ao selecionar issue
    setMobileTab('voting')
  }, [issues, send, setCurrentIssueId, setVotes])

  async function handleReveal() {
    await send('REVEAL_CARDS')
    await revealVotes()
    stop()
  }

  async function handleNextIssue() {
    await send('NEXT_ISSUE')
    await nextIssue()
    await updateVoteStatus(false)
    stop()
  }

  async function handleReVote() {
    await send('RE_VOTE')
    await reVote()
    await updateVoteStatus(false)
  }

  async function handleTimerStart() {
    await send('TIMER_START', { seconds: timerSeconds })
    start(timerSeconds)
  }

  async function handleTimerStop() {
    await send('TIMER_STOP')
    stop()
  }

  async function handleCoffeeBreak() {
    await send('COFFEE_BREAK')
    setCoffeeBreakActive(true)
  }

  async function handleCastVote(value: number | string) {
    await castVote(value)
    await updateVoteStatus(true)
  }

  async function handleDeselect() {
    await removeVote()
    await updateVoteStatus(false)
  }

  async function handleEmojiSend(emoji: string) {
    await send('EMOJI_REACTION', { emoji })
  }

  const cardDeckSection = isVoting && userRole !== 'spectator' && (
    <div className="w-full border-t border-border bg-card/50 shrink-0">
      <CardDeck
        deckType={(room?.deck_type ?? initialRoom.deck_type) as DeckType}
        selectedValue={selectedCard}
        onSelect={handleCastVote}
        onDeselect={handleDeselect}
        disabled={isRevealed}
        customValues={
          ((room?.settings ?? initialRoom.settings) as { custom_values?: number[] } | null)
            ?.custom_values
        }
      />
      <div className="flex justify-center pb-2 lg:pb-3">
        <EmojiReactions onSend={handleEmojiSend} />
      </div>
    </div>
  )

  const pokerContent = (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 lg:gap-6 p-4 lg:p-6 w-full max-w-2xl mx-auto overflow-y-auto">

      {/* Banner: convidado visualizando issue diferente da do facilitador */}
      {isViewingDifferent && currentIssue && (
        <div className="w-full bg-primary/10 border border-primary/30 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3">
          <p className="text-sm text-foreground truncate">
            🎯 Facilitador está em:{' '}
            <strong className="text-primary">
              {currentIssue.title.length > 35
                ? currentIssue.title.slice(0, 35) + '…'
                : currentIssue.title}
            </strong>
          </p>
          <button
            onClick={() => setLocalViewingId(null)}
            className="text-xs text-primary font-medium hover:underline shrink-0"
          >
            Seguir →
          </button>
        </div>
      )}

      {displayedIssue ? (
        <>
          <IssueCard
            issue={displayedIssue}
            issueNumber={displayedIndex + 1}
            totalIssues={issues.length}
            jiraSiteName={jiraSiteName}
          />

          {/* VoteReveal e controles apenas quando vendo a issue ativa */}
          {!isViewingDifferent && (isVoting || isRevealed) && (
            <VoteReveal
              votes={currentVotes}
              participants={onlineUsers}
              isRevealed={isRevealed}
              issueId={currentIssueId!}
            />
          )}

          {isFacilitator && !isViewingDifferent && (
            <FacilitatorControls
              roomStatus={room?.status ?? 'waiting'}
              issueStatus={currentIssue!.status}
              hasVotes={currentVotes.length > 0}
              onReveal={handleReveal}
              onNextIssue={handleNextIssue}
              onReVote={handleReVote}
              onSkip={() => skipIssue()}
              onCoffeeBreak={handleCoffeeBreak}
            />
          )}
        </>
      ) : (
        <div className="text-center text-muted-foreground px-6">
          <div className="text-5xl mb-4">🃏</div>
          {issues.length === 0 ? (
            <>
              <p className="text-lg font-medium">Adicione issues para começar</p>
              {isFacilitator && (
                <p className="text-sm mt-2 text-muted-foreground">
                  Toque em{' '}
                  <button
                    onClick={() => setMobileTab('issues')}
                    className="text-primary underline lg:hidden"
                  >
                    Issues
                  </button>
                  <span className="hidden lg:inline">Use o painel à esquerda</span>
                  {' '}para adicionar issues
                </p>
              )}
            </>
          ) : hasPendingIssues && isFacilitator ? (
            <>
              <p className="text-lg font-medium">Selecione uma issue para iniciar</p>
              <button
                onClick={() => setMobileTab('issues')}
                className="mt-3 text-sm text-primary underline lg:hidden"
              >
                Ver Issues →
              </button>
            </>
          ) : (
            <p className="text-lg font-medium">Todas as issues foram estimadas! 🎉</p>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col h-dvh bg-background">
      <Confetti active={showConfetti} />

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        roomSlug={initialRoom.slug}
        roomName={room?.name ?? initialRoom.name}
      />

      <CoffeeBreak
        active={coffeeBreakActive}
        onEnd={() => setCoffeeBreakActive(false)}
      />

      <Navbar userDisplayName={userDisplayName} userAvatarUrl={userAvatarUrl} />

      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ── PAINEL: ISSUES ──────────────────────────────────────── */}
        {/* Mobile: visível só quando mobileTab === 'issues'           */}
        {/* Desktop (lg+): sidebar fixa à esquerda                    */}
        <aside className={`
          ${mobileTab === 'issues' ? 'flex' : 'hidden'} lg:flex
          flex-col w-full lg:w-72 shrink-0 border-r border-border overflow-hidden
        `}>
          <IssueList
            issues={issues}
            currentIssueId={currentIssueId}
            localViewingId={localViewingId}
            roomId={room?.id ?? initialRoom.id}
            isFacilitator={isFacilitator}
            onSelectIssue={isFacilitator ? handleSelectIssue : undefined}
            onBrowseIssue={!isFacilitator ? handleBrowseIssue : undefined}
          />
        </aside>

        {/* ── PAINEL: VOTAÇÃO (centro) ─────────────────────────────── */}
        <main className={`
          ${mobileTab === 'voting' ? 'flex' : 'hidden'} lg:flex
          flex-1 flex-col overflow-hidden min-w-0
        `}>
          {/* Header da sala */}
          <div className="w-full px-4 lg:px-6 py-2 lg:py-3 border-b border-border flex items-center justify-between shrink-0 gap-3">
            <h1 className="font-semibold text-foreground truncate text-sm lg:text-base">
              {room?.name ?? initialRoom.name}
            </h1>
            <div className="flex items-center gap-2 lg:gap-4 shrink-0">
              {/* Tabs de view — apenas desktop */}
              <div className="hidden lg:flex items-center gap-1">
                {(['poker', 'sprint', 'charts'] as const).map((view) => {
                  const labels: Record<DesktopView, string> = { poker: '🃏 Poker', sprint: '📋 Sprint', charts: '📊 Gráficos' }
                  return (
                    <button
                      key={view}
                      onClick={() => setDesktopView(view)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        desktopView === view
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {labels[view]}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setIsInviteOpen(true)}
                title="Convidar participantes"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                🔗 <span className="hidden sm:inline">Convidar</span>
              </button>

              {displayedIssue && desktopView === 'poker' && (
                <span className="text-xs text-muted-foreground hidden lg:inline">
                  {displayedIndex + 1} / {issues.length}
                </span>
              )}

              {/* Contador de issue — mobile */}
              {displayedIssue && (
                <span className="text-xs text-muted-foreground lg:hidden">
                  {displayedIndex + 1}/{issues.length}
                </span>
              )}

              {isVoting && (
                <Timer
                  secondsLeft={secondsLeft}
                  totalSeconds={timerSeconds}
                  isRunning={isRunning}
                  isFacilitator={isFacilitator}
                  onStart={handleTimerStart}
                  onStop={handleTimerStop}
                />
              )}
            </div>
          </div>

          {/* Conteúdo: sprint/charts no desktop; poker em ambos */}
          {desktopView === 'sprint' ? (
            <div className="flex-1 overflow-hidden hidden lg:flex flex-col">
              <SprintTable issues={issues} jiraSiteName={jiraSiteName} />
            </div>
          ) : desktopView === 'charts' ? (
            <div className="flex-1 overflow-hidden hidden lg:flex flex-col">
              <SprintCharts issues={issues} />
            </div>
          ) : null}

          {/* Poker view — mobile sempre, desktop apenas no modo poker */}
          <div className={`flex-1 flex-col overflow-hidden min-h-0 ${
            desktopView === 'poker' ? 'flex' : 'flex lg:hidden'
          }`}>
            {pokerContent}
          </div>

          {/* Deck de votação */}
          {desktopView === 'poker' && cardDeckSection}
          {/* Mobile: deck sempre visível quando em votação, independente de desktopView */}
          <div className="lg:hidden">
            {desktopView !== 'poker' && cardDeckSection}
          </div>
        </main>

        {/* ── PAINEL: SPRINT (mobile only) ─────────────────────────── */}
        <div className={`
          ${mobileTab === 'sprint' ? 'flex' : 'hidden'} lg:hidden
          flex-col flex-1 overflow-hidden min-w-0
        `}>
          {/* Sub-tabs: Tabela | Gráficos */}
          <div className="flex border-b border-border shrink-0">
            <button
              onClick={() => setMobileSprintView('table')}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                mobileSprintView === 'table'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground'
              }`}
            >
              📋 Tabela
            </button>
            <button
              onClick={() => setMobileSprintView('charts')}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                mobileSprintView === 'charts'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground'
              }`}
            >
              📊 Gráficos
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {mobileSprintView === 'charts' ? (
              <SprintCharts issues={issues} />
            ) : (
              <SprintTable issues={issues} jiraSiteName={jiraSiteName} />
            )}
          </div>
        </div>

        {/* ── PAINEL: EQUIPE ───────────────────────────────────────── */}
        {/* Mobile: visível só quando mobileTab === 'team'             */}
        {/* Desktop (lg+): sidebar fixa à direita                     */}
        <aside className={`
          ${mobileTab === 'team' ? 'flex' : 'hidden'} lg:flex
          flex-col w-full lg:w-56 shrink-0 border-l border-border overflow-hidden
        `}>
          <ParticipantList participants={onlineUsers} currentUserId={userId} />
        </aside>

      </div>

      {/* ── BOTTOM NAV (mobile only) ─────────────────────────────── */}
      <nav className="lg:hidden flex border-t border-border bg-card shrink-0 pb-safe">
        {([
          { tab: 'issues' as MobileTab, icon: '📋', label: 'Issues', badge: issues.length > 0 ? issues.length : null },
          { tab: 'voting' as MobileTab, icon: '🃏', label: 'Votar', dot: isVoting },
          { tab: 'sprint' as MobileTab, icon: '📊', label: 'Sprint', badge: null },
          { tab: 'team' as MobileTab, icon: '👥', label: 'Equipe', badge: onlineUsers.length > 0 ? onlineUsers.length : null },
        ] as Array<{ tab: MobileTab; icon: string; label: string; badge?: number | null; dot?: boolean }>)
          .map(({ tab, icon, label, badge, dot }) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`relative flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              mobileTab === tab ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {/* Indicador de aba ativa */}
            {mobileTab === tab && (
              <span className="absolute top-0 inset-x-3 h-0.5 bg-primary rounded-b-full" />
            )}

            <span className="relative text-lg leading-none">
              {icon}
              {/* Badge numérico */}
              {badge != null && (
                <span className="absolute -top-1 -right-2.5 text-[9px] bg-primary text-primary-foreground rounded-full min-w-[14px] h-3.5 flex items-center justify-center font-bold px-0.5">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
              {/* Dot de status (ex: votação ativa) */}
              {dot && !badge && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-card" />
              )}
            </span>
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
