'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRoomStore } from '@/stores/roomStore'
import type { Database } from '@/lib/types/database'
import IssueDetailsModal from '@/components/room/IssueDetailsModal'
import type { IssueDetailsFields } from '@/components/room/IssueDetailsModal'

type Issue = Database['public']['Tables']['issues']['Row']

export interface IssueListProps {
  issues: Issue[]
  currentIssueId: string | null
  localViewingId?: string | null
  roomId: string
  onSelectIssue?: (issueId: string) => void
  onBrowseIssue?: (issueId: string) => void
  isFacilitator?: boolean
  isRoomCreator?: boolean
}

interface JiraResult {
  id: string
  key: string
  summary: string
  issueType: string | null
  status: string | null
  priority: string | null
  assigneeName: string | null
  reporterName: string | null
  deadline: string | null
  spentHours: number | null
}

const STATUS_ICON: Record<string, string> = {
  pending: '⏳',
  voting: '🗳️',
  revealed: '✅',
  skipped: '⏭️',
}

export default function IssueList({
  issues,
  currentIssueId,
  localViewingId,
  roomId,
  onSelectIssue,
  onBrowseIssue,
  isFacilitator = false,
  isRoomCreator = false,
}: IssueListProps) {
  const [addingIssue, setAddingIssue] = useState(false)
  const [mode, setMode] = useState<'manual' | 'jira'>('manual')

  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const [showDetailsPrompt, setShowDetailsPrompt] = useState(false)
  const [pendingIssueId, setPendingIssueId] = useState<string | null>(null)
  const [editingIssueId, setEditingIssueId] = useState<string | null>(null)

  const [jiraKey, setJiraKey] = useState('')
  const [jiraResult, setJiraResult] = useState<JiraResult | null>(null)
  const [jiraError, setJiraError] = useState<string | null>(null)
  const [jiraLoading, setJiraLoading] = useState(false)

  const [deleteError, setDeleteError] = useState<string | null>(null)
  const removeIssue = useRoomStore((s) => s.removeIssue)

  async function handleDeleteIssue(issueId: string) {
    removeIssue(issueId)
    const supabase = createClient()
    const { error } = await supabase.from('issues').delete().eq('id', issueId)
    if (error) {
      setDeleteError('Erro ao excluir issue.')
      setTimeout(() => setDeleteError(null), 3000)
    }
  }

  function resetForm() {
    setNewTitle('')
    setAddError(null)
    setJiraKey('')
    setJiraResult(null)
    setJiraError(null)
    setLoading(false)
    setAddingIssue(false)
    setShowDetailsPrompt(false)
    setPendingIssueId(null)
  }

  function detectProjectPrefix(): string | null {
    const issueWithKey = issues.find((i) => i.jira_issue_key)
    if (!issueWithKey?.jira_issue_key) return null
    const match = issueWithKey.jira_issue_key.match(/^([A-Z]+-)/i)
    return match ? match[1].toUpperCase() : null
  }

  async function searchJiraIssue(e: React.FormEvent) {
    e.preventDefault()
    let key = jiraKey.trim().toUpperCase()
    if (!key) return

    if (/^\d+$/.test(key)) {
      const prefix = detectProjectPrefix()
      if (prefix) {
        key = `${prefix}${key}`
      } else {
        setJiraError('Digite o código completo (ex: NMTZ-10366)')
        return
      }
    }

    setJiraLoading(true)
    setJiraError(null)
    setJiraResult(null)

    const res = await fetch(`/api/jira/issue?key=${encodeURIComponent(key)}`)
    const data = await res.json() as JiraResult & { error?: string }

    if (!res.ok) {
      if (data.error === 'jira_not_connected') {
        setJiraError('Jira não conectado. Acesse Configurações → Jira.')
      } else if (data.error === 'not_found') {
        setJiraError(`Issue "${key}" não encontrada.`)
      } else {
        setJiraError('Erro ao buscar no Jira. Tente novamente.')
      }
      setJiraLoading(false)
      return
    }

    setJiraResult(data)
    setJiraLoading(false)
  }

  async function handleAddManual(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setLoading(true)
    setAddError(null)

    const supabase = createClient()
    const { data, error } = await supabase.from('issues').insert({
      room_id: roomId,
      title: newTitle.trim(),
      position: issues.length,
      status: 'pending',
    }).select('id').single()

    if (error || !data) {
      setAddError('Erro ao criar issue. Verifique suas permissões.')
      setLoading(false)
      return
    }

    setPendingIssueId(data.id)
    setShowDetailsPrompt(true)
    setNewTitle('')
    setLoading(false)
  }

  async function handleAddFromJira() {
    if (!jiraResult) return
    setLoading(true)
    setAddError(null)

    const supabase = createClient()
    const { error } = await supabase.from('issues').insert({
      room_id: roomId,
      title: jiraResult.summary,
      jira_issue_key: jiraResult.key,
      jira_issue_id: jiraResult.id,
      position: issues.length,
      status: 'pending',
      jira_status: jiraResult.status,
      issue_type: jiraResult.issueType,
      criticality: jiraResult.priority,
      assignee_name: jiraResult.assigneeName,
      reporter_name: jiraResult.reporterName,
      deadline: jiraResult.deadline,
      spent_hours: jiraResult.spentHours,
    })

    if (error) {
      setAddError('Erro ao criar issue.')
      setLoading(false)
      return
    }

    resetForm()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden relative z-10">
      {/* Header */}
      <div className="shrink-0 px-3 pt-3 pb-2 bg-[rgba(8,8,8,0.88)] backdrop-blur-[12px] border-b border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[0.8rem] font-semibold tracking-[0.06em] uppercase text-[var(--muted)]">Issues</h3>
            <span className="text-[var(--muted)] text-[0.75rem]">{issues.length} no sprint</span>
          </div>
          {isRoomCreator && !addingIssue && (
            <button
              onClick={() => setAddingIssue(true)}
              title="Adicionar issue"
              className="flex items-center gap-1.5 px-3 py-1.5 text-[0.75rem] font-bold bg-[var(--accent)] text-[#111] rounded-[8px] hover:bg-[var(--accent-2)] transition-all shadow-[0_4px_12px_rgba(255,214,10,0.15)]"
            >
              <span>+</span> Nova
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {deleteError && (
          <p className="text-xs text-[var(--accent)] text-center py-2 bg-[var(--accent)]/10">{deleteError}</p>
        )}
        {issues.length === 0 && !addingIssue && (
          <p className="text-center text-[var(--muted)] text-sm p-6">
            {isFacilitator ? 'Clique em + Nova para adicionar' : 'Nenhuma issue adicionada'}
          </p>
        )}

        {/* Issue cards */}
        <div className="p-3 grid gap-2.5">
          {issues.map((issue, index) => {
            const isFacilitatorIssue = issue.id === currentIssueId
            const isLocallyViewing = issue.id === localViewingId && localViewingId !== currentIssueId
            const canFacilitatorClick = isFacilitator && issue.status !== 'skipped'
            const canGuestBrowse = !isFacilitator && !!onBrowseIssue
            const isClickable = canFacilitatorClick || canGuestBrowse

            function handleClick() {
              if (canFacilitatorClick) onSelectIssue?.(issue.id)
              else if (canGuestBrowse) onBrowseIssue?.(issue.id)
            }

            return (
              <motion.div
                key={issue.id}
                whileHover={isClickable ? { x: 2 } : {}}
                className={`
                  rounded-[18px] border transition-all overflow-hidden
                  ${isFacilitatorIssue
                    ? 'border-[var(--accent)]/22'
                    : isLocallyViewing
                      ? 'border-[var(--muted)]/20 bg-white/[0.02]'
                      : 'border-white/5 bg-white/[0.02] hover:border-[var(--accent)]/14 hover:bg-white/[0.03]'
                  }
                `}
                style={isFacilitatorIssue ? {
                  background: 'linear-gradient(180deg, rgba(255,214,10,0.08), rgba(255,255,255,0.03)), rgba(255,255,255,0.02)',
                  boxShadow: 'inset 3px 0 0 #ffd60a',
                } : {}}
              >
                <div className="flex items-start">
                  <button
                    onClick={handleClick}
                    className={`flex-1 text-left px-3 py-3 flex items-start gap-2.5 min-w-0 ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {/* Status icon / check */}
                    {issue.status === 'revealed' ? (
                      <div className="w-[18px] h-[18px] rounded-[6px] bg-gradient-to-br from-[#32da80] to-[#1aa85e] grid place-items-center text-white font-extrabold text-[0.72rem] flex-shrink-0 mt-0.5">
                        ✓
                      </div>
                    ) : (
                      <span className="text-sm mt-0.5 shrink-0 leading-none">{STATUS_ICON[issue.status]}</span>
                    )}

                    <div className="min-w-0 flex-1">
                      {issue.jira_issue_key && (
                        <span className="block text-[0.82rem] text-[#ffb703] font-medium mb-0.5 font-mono">
                          {issue.jira_issue_key}
                        </span>
                      )}
                      <p className={`text-[0.97rem] font-bold leading-[1.4] ${isFacilitatorIssue ? 'text-foreground' : 'text-foreground/80'} ${issue.title.length > 40 ? 'line-clamp-2' : 'truncate'}`}>
                        <span className="text-[var(--muted)] text-xs font-normal mr-1">#{index + 1}</span>
                        {issue.title}
                      </p>
                      {issue.final_estimate !== null && (
                        <p className="text-[0.88rem] font-extrabold text-[var(--accent)] mt-1">
                          {issue.final_estimate}h estimado
                        </p>
                      )}
                    </div>

                    {isFacilitatorIssue && (
                      <span className="shrink-0 text-xs" title="Facilitador está aqui">🎯</span>
                    )}
                  </button>

                  {isRoomCreator && (
                    <button
                      onClick={() => setEditingIssueId(issue.id)}
                      title="Editar detalhes"
                      className="shrink-0 mr-1 mt-2 w-6 h-6 flex items-center justify-center text-[var(--muted)]/40 hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all rounded text-sm"
                    >
                      ✎
                    </button>
                  )}
                  {isFacilitator && (
                    <button
                      onClick={() => handleDeleteIssue(issue.id)}
                      title="Remover issue"
                      className="shrink-0 mr-2 mt-2 w-6 h-6 flex items-center justify-center text-[var(--muted)]/40 hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all rounded text-base"
                    >
                      ×
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Form inline para adicionar issue */}
        <AnimatePresence>
          {addingIssue && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="px-3 pb-3 space-y-2.5"
            >
              {/* Tabs manual / jira */}
              <div className="flex rounded-lg overflow-hidden border border-[var(--border)] text-xs font-medium">
                <button
                  type="button"
                  onClick={() => { setMode('manual'); setJiraResult(null); setJiraError(null) }}
                  className={`flex-1 py-1.5 transition-colors ${mode === 'manual' ? 'bg-[var(--accent)] text-[#111] font-bold' : 'text-[var(--muted)] hover:text-foreground'}`}
                >
                  Manual
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('jira'); setAddError(null) }}
                  className={`flex-1 py-1.5 transition-colors ${mode === 'jira' ? 'bg-[var(--accent)] text-[#111] font-bold' : 'text-[var(--muted)] hover:text-foreground'}`}
                >
                  🎯 Jira
                </button>
              </div>

              {mode === 'manual' ? (
                !showDetailsPrompt ? (
                  <form onSubmit={handleAddManual} className="space-y-2">
                    <input
                      autoFocus
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Título da issue..."
                      className="w-full px-3 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-lg text-foreground placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
                    />
                    {addError && <p className="text-xs text-[var(--danger)]">{addError}</p>}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={loading || !newTitle.trim()}
                        className="flex-1 py-1.5 rounded-lg text-xs font-bold text-[#111] bg-[var(--accent)] hover:bg-[var(--accent-2)] disabled:opacity-50 transition-all"
                      >
                        {loading ? '...' : 'Adicionar'}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 py-1.5 border border-[var(--border)] rounded-lg text-xs text-[var(--muted)] hover:text-foreground transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.04] rounded-xl p-3 space-y-2"
                  >
                    <p className="text-xs text-foreground font-medium">✓ Issue criada! Quer adicionar mais detalhes?</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAddingIssue(false)
                          setShowDetailsPrompt(false)
                          setEditingIssueId(pendingIssueId)
                          setPendingIssueId(null)
                        }}
                        className="flex-1 py-1.5 rounded-lg text-xs font-bold text-[#111] bg-[var(--accent)] hover:bg-[var(--accent-2)] transition-all"
                      >
                        Adicionar detalhes
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 py-1.5 border border-[var(--border)] rounded-lg text-xs text-[var(--muted)] hover:text-foreground transition-colors"
                      >
                        Não, obrigado
                      </button>
                    </div>
                  </motion.div>
                )
              ) : (
                <div className="space-y-2">
                  <form onSubmit={searchJiraIssue} className="space-y-1.5">
                    <input
                      autoFocus
                      type="text"
                      value={jiraKey}
                      onChange={(e) => { setJiraKey(e.target.value); setJiraResult(null); setJiraError(null) }}
                      placeholder="10366 ou NMTZ-10366"
                      className="w-full px-3 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-lg text-foreground placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] font-mono"
                    />
                    <button
                      type="submit"
                      disabled={jiraLoading || !jiraKey.trim()}
                      className="w-full py-1.5 rounded-lg text-xs font-bold text-[#111] bg-[var(--accent)] hover:bg-[var(--accent-2)] disabled:opacity-50 transition-all"
                    >
                      {jiraLoading ? 'Buscando...' : 'Buscar no Jira'}
                    </button>
                  </form>

                  {jiraError && (
                    <p className="text-xs text-[var(--danger)]">{jiraError}</p>
                  )}

                  {jiraResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/[0.04] rounded-lg p-2.5 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <code className="text-xs font-mono text-[var(--accent)] font-semibold">{jiraResult.key}</code>
                        {jiraResult.issueType && (
                          <span className="text-xs text-[var(--muted)]">{jiraResult.issueType}</span>
                        )}
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">{jiraResult.summary}</p>
                      {jiraResult.status && (
                        <span className="inline-block text-xs bg-white/5 text-[var(--muted)] px-1.5 py-0.5 rounded">
                          {jiraResult.status}
                        </span>
                      )}
                    </motion.div>
                  )}

                  {addError && <p className="text-xs text-[var(--danger)]">{addError}</p>}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddFromJira}
                      disabled={loading || !jiraResult}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold text-[#111] bg-[var(--accent)] hover:bg-[var(--accent-2)] disabled:opacity-50 transition-all"
                    >
                      {loading ? '...' : 'Adicionar'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 py-1.5 border border-[var(--border)] rounded-lg text-xs text-[var(--muted)] hover:text-foreground transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <IssueDetailsModal
        isOpen={editingIssueId !== null}
        onClose={() => setEditingIssueId(null)}
        issueId={editingIssueId ?? ''}
        initialValues={(() => {
          const issue = issues.find((i) => i.id === editingIssueId)
          if (!issue) return undefined
          return {
            description: issue.description ?? '',
            issue_type: issue.issue_type ?? '',
            criticality: issue.criticality ?? '',
            reporter_name: issue.reporter_name ?? '',
            assignee_name: issue.assignee_name ?? '',
            deadline: issue.deadline ?? '',
            jira_status: issue.jira_status ?? '',
          } satisfies Partial<IssueDetailsFields>
        })()}
      />
    </div>
  )
}
