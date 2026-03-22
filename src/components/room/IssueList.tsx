'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRoomStore } from '@/stores/roomStore'
import type { Database } from '@/lib/types/database'

type Issue = Database['public']['Tables']['issues']['Row']

export interface IssueListProps {
  issues: Issue[]
  /** Issue que o facilitador está controlando — sempre destacada para todos */
  currentIssueId: string | null
  /** Issue que o usuário local está visualizando (pode diferir do facilitador) */
  localViewingId?: string | null
  roomId: string
  /** Facilitador: muda o estado da sala */
  onSelectIssue?: (issueId: string) => void
  /** Convidado: muda apenas a visualização local */
  onBrowseIssue?: (issueId: string) => void
  isFacilitator?: boolean
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
}: IssueListProps) {
  const [addingIssue, setAddingIssue] = useState(false)
  const [mode, setMode] = useState<'manual' | 'jira'>('manual')

  // Manual mode state
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  // Jira search state
  const [jiraKey, setJiraKey] = useState('')
  const [jiraResult, setJiraResult] = useState<JiraResult | null>(null)
  const [jiraError, setJiraError] = useState<string | null>(null)
  const [jiraLoading, setJiraLoading] = useState(false)

  const [deleteError, setDeleteError] = useState<string | null>(null)
  const removeIssue = useRoomStore((s) => s.removeIssue)

  async function handleDeleteIssue(issueId: string) {
    // Update otimista imediato — não depende do evento Realtime (que pode não chegar
    // quando a tabela não tem REPLICA IDENTITY FULL configurada)
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

    // Se digitou só números, tenta detectar o prefixo do projeto
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
        setJiraError('Jira não conectado. Acesse Configurações → Jira para conectar.')
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
    const { error } = await supabase.from('issues').insert({
      room_id: roomId,
      title: newTitle.trim(),
      position: issues.length,
      status: 'pending',
    })

    if (error) {
      setAddError('Erro ao criar issue. Verifique suas permissões.')
      setLoading(false)
      return
    }

    resetForm()
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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Issues ({issues.length})
        </h2>
        {isFacilitator && !addingIssue && (
          <button
            onClick={() => setAddingIssue(true)}
            title="Adicionar issue"
            className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors text-xl leading-none"
          >
            +
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {deleteError && (
          <p className="text-xs text-accent text-center py-2 bg-accent/10">{deleteError}</p>
        )}
        {issues.length === 0 && !addingIssue && (
          <p className="text-center text-muted-foreground text-sm p-6">
            {isFacilitator ? 'Clique em + para adicionar issues' : 'Nenhuma issue adicionada'}
          </p>
        )}

        {issues.map((issue, index) => {
          // Issue que o facilitador controla — destaque forte para todos
          const isFacilitatorIssue = issue.id === currentIssueId
          // Issue que o usuário local está visualizando (pode ser diferente)
          const isLocallyViewing = issue.id === localViewingId && localViewingId !== currentIssueId
          // Facilitador pode clicar para mudar estado; convidado pode navegar localmente
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
                relative border-b border-border/50 flex items-center transition-colors
                ${isFacilitatorIssue ? 'bg-primary/10 border-l-[3px] border-l-primary' : ''}
                ${isLocallyViewing ? 'bg-muted/60 border-l-2 border-l-muted-foreground/40' : ''}
                ${isClickable && !isFacilitatorIssue && !isLocallyViewing ? 'hover:bg-muted/50' : ''}
                ${isFacilitatorIssue && isClickable ? 'hover:bg-primary/15' : ''}
              `}
            >
              <button
                onClick={handleClick}
                className={`flex-1 text-left px-3 py-3 flex items-start gap-2 min-w-0 ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span className="text-sm mt-0.5 shrink-0 leading-none">{STATUS_ICON[issue.status]}</span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm leading-snug ${isFacilitatorIssue ? 'font-semibold text-foreground' : 'text-foreground/80'} ${issue.title.length > 40 ? 'line-clamp-2' : 'truncate'}`}>
                    <span className="text-muted-foreground text-xs mr-1">#{index + 1}</span>{issue.title}
                  </p>
                  {issue.jira_issue_key && (
                    <p className="text-xs text-primary/70 mt-0.5 font-mono">{issue.jira_issue_key}</p>
                  )}
                  {issue.final_estimate !== null && (
                    <p className="text-xs text-primary font-semibold mt-0.5">
                      {issue.final_estimate}h estimado
                    </p>
                  )}
                </div>
                {/* Indicador: issue ativa do facilitador */}
                {isFacilitatorIssue && (
                  <span className="shrink-0 text-xs" title="Facilitador está aqui">🎯</span>
                )}
              </button>

              {isFacilitator && (
                <button
                  onClick={() => handleDeleteIssue(issue.id)}
                  title="Remover issue"
                  className="shrink-0 mr-2 w-6 h-6 flex items-center justify-center text-muted-foreground/40 hover:text-accent hover:bg-accent/10 transition-all rounded text-base"
                >
                  ×
                </button>
              )}
            </motion.div>
          )
        })}

        {/* Form inline para adicionar issue */}
        <AnimatePresence>
          {addingIssue && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 border-b border-border/50 space-y-2.5"
            >
              {/* Tabs manual / jira */}
              <div className="flex rounded-lg overflow-hidden border border-border text-xs font-medium">
                <button
                  type="button"
                  onClick={() => { setMode('manual'); setJiraResult(null); setJiraError(null) }}
                  className={`flex-1 py-1.5 transition-colors ${mode === 'manual' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Manual
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('jira'); setAddError(null) }}
                  className={`flex-1 py-1.5 transition-colors ${mode === 'jira' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  🎯 Jira
                </button>
              </div>

              {mode === 'manual' ? (
                <form onSubmit={handleAddManual} className="space-y-2">
                  <input
                    autoFocus
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Título da issue..."
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                  />
                  {addError && <p className="text-xs text-accent">{addError}</p>}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading || !newTitle.trim()}
                      className="flex-1 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium disabled:opacity-50 transition-colors"
                    >
                      {loading ? '...' : 'Adicionar'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 py-1.5 border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2">
                  {/* Busca por chave */}
                  <form onSubmit={searchJiraIssue} className="space-y-1.5">
                    <input
                      autoFocus
                      type="text"
                      value={jiraKey}
                      onChange={(e) => { setJiraKey(e.target.value); setJiraResult(null); setJiraError(null) }}
                      placeholder="10366 ou NMTZ-10366"
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary font-mono"
                    />
                    <button
                      type="submit"
                      disabled={jiraLoading || !jiraKey.trim()}
                      className="w-full py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium disabled:opacity-50 transition-colors"
                    >
                      {jiraLoading ? 'Buscando...' : 'Buscar no Jira'}
                    </button>
                  </form>

                  {jiraError && (
                    <p className="text-xs text-accent">{jiraError}</p>
                  )}

                  {/* Preview do resultado */}
                  {jiraResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-muted/60 rounded-lg p-2.5 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <code className="text-xs font-mono text-primary font-semibold">{jiraResult.key}</code>
                        {jiraResult.issueType && (
                          <span className="text-xs text-muted-foreground">{jiraResult.issueType}</span>
                        )}
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">{jiraResult.summary}</p>
                      {jiraResult.status && (
                        <span className="inline-block text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                          {jiraResult.status}
                        </span>
                      )}
                    </motion.div>
                  )}

                  {addError && <p className="text-xs text-accent">{addError}</p>}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddFromJira}
                      disabled={loading || !jiraResult}
                      className="flex-1 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium disabled:opacity-50 transition-colors"
                    >
                      {loading ? '...' : 'Adicionar'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 py-1.5 border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
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
    </div>
  )
}
