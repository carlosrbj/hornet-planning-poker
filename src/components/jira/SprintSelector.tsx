'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { JiraBoard, JiraSprint, JiraIssue } from '@/lib/jira/api'

interface SprintSelectorProps {
  roomId: string
  onImported: () => void
  onCancel: () => void
}

export default function SprintSelector({ roomId, onImported, onCancel }: SprintSelectorProps) {
  const [step, setStep] = useState<'board' | 'sprint' | 'issues'>('board')
  const [boards, setBoards] = useState<JiraBoard[]>([])
  const [sprints, setSprints] = useState<JiraSprint[]>([])
  const [issues, setIssues] = useState<JiraIssue[]>([])
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null)
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null)
  const [selectedIssueIds, setSelectedIssueIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadBoards() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/jira/boards')
      if (!res.ok) throw new Error('Erro ao carregar boards')
      const data = await res.json() as JiraBoard[]
      setBoards(data)
      setStep('board')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro')
    } finally {
      setLoading(false)
    }
  }

  async function loadSprints(boardId: number) {
    setSelectedBoardId(boardId)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/jira/sprints?boardId=${boardId}`)
      if (!res.ok) throw new Error('Erro ao carregar sprints')
      const data = await res.json() as JiraSprint[]
      setSprints(data)
      setStep('sprint')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro')
    } finally {
      setLoading(false)
    }
  }

  async function loadIssues(sprintId: number) {
    setSelectedSprintId(sprintId)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/jira/issues?sprintId=${sprintId}`)
      if (!res.ok) throw new Error('Erro ao carregar issues')
      const data = await res.json() as JiraIssue[]
      setIssues(data)
      setSelectedIssueIds(new Set(data.map((i) => i.id)))
      setStep('issues')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro')
    } finally {
      setLoading(false)
    }
  }

  function toggleIssue(id: string) {
    setSelectedIssueIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleImport() {
    const toImport = issues.filter((i) => selectedIssueIds.has(i.id))
    if (toImport.length === 0) return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/jira/import-issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          issues: toImport.map((issue, idx) => ({
            title: issue.fields.summary,
            jira_issue_key: issue.key,
            jira_issue_id: issue.id,
            position: idx,
            jira_status: issue.fields.status?.name ?? null,
            issue_type: issue.fields.issuetype?.name ?? null,
            criticality: issue.fields.priority?.name ?? null,
            assignee_name: issue.fields._developerName ?? issue.fields.assignee?.displayName ?? null,
            reporter_name: issue.fields.reporter?.displayName ?? null,
            deadline: issue.fields._resolvedDeadline ?? issue.fields.duedate ?? null,
            spent_hours: typeof issue.fields.timespent === 'number' ? issue.fields.timespent / 3600 : null,
          })),
        }),
      })
      if (!res.ok) throw new Error('Erro ao importar')
      onImported()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao importar')
    } finally {
      setLoading(false)
    }
  }

  // Carrega boards na montagem
  useState(() => { loadBoards() })

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-accent bg-accent/10 px-3 py-2 rounded-lg">{error}</p>
      )}

      {loading && (
        <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div>
      )}

      <AnimatePresence mode="wait">
        {!loading && step === 'board' && (
          <motion.div key="board" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="text-sm font-medium text-foreground mb-3">Selecione o Board</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {boards.map((b) => (
                <button
                  key={b.id}
                  onClick={() => loadSprints(b.id)}
                  className="w-full text-left px-3 py-2.5 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-sm"
                >
                  <span className="font-medium text-foreground">{b.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{b.type}</span>
                </button>
              ))}
              {boards.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum board encontrado</p>
              )}
            </div>
          </motion.div>
        )}

        {!loading && step === 'sprint' && (
          <motion.div key="sprint" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setStep('board')} className="text-xs text-muted-foreground hover:text-foreground">← Boards</button>
              <span className="text-sm font-medium text-foreground">Selecione a Sprint</span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sprints.map((s) => (
                <button
                  key={s.id}
                  onClick={() => loadIssues(s.id)}
                  className="w-full text-left px-3 py-2.5 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                    s.state === 'active' ? 'bg-green-500/15 text-green-600' : 'bg-muted text-muted-foreground'
                  }`}>
                    {s.state}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {!loading && step === 'issues' && (
          <motion.div key="issues" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setStep('sprint')} className="text-xs text-muted-foreground hover:text-foreground">← Sprints</button>
                <span className="text-sm font-medium text-foreground">
                  {selectedIssueIds.size} de {issues.length} selecionadas
                </span>
              </div>
              <button
                onClick={() =>
                  setSelectedIssueIds(
                    selectedIssueIds.size === issues.length ? new Set() : new Set(issues.map((i) => i.id))
                  )
                }
                className="text-xs text-primary hover:underline"
              >
                {selectedIssueIds.size === issues.length ? 'Desmarcar tudo' : 'Selecionar tudo'}
              </button>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {issues.map((issue) => (
                <label
                  key={issue.id}
                  className="flex items-start gap-3 px-3 py-2 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedIssueIds.has(issue.id)}
                    onChange={() => toggleIssue(issue.id)}
                    className="mt-0.5 accent-primary"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-mono text-muted-foreground">{issue.key}</span>
                    <p className="text-sm text-foreground truncate">{issue.fields.summary}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={onCancel}
                className="flex-1 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={loading || selectedIssueIds.size === 0}
                className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {loading ? 'Importando...' : `Importar ${selectedIssueIds.size} issues`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
