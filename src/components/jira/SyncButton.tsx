'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SyncItem {
  jiraIssueId: string
  jiraIssueKey: string
  title: string
  estimate: number
}

interface SyncResult {
  key: string
  success: boolean
  error?: string
}

interface SyncButtonProps {
  items: SyncItem[]
}

export default function SyncButton({ items }: SyncButtonProps) {
  const [state, setState] = useState<'idle' | 'preview' | 'syncing' | 'done'>('idle')
  const [results, setResults] = useState<SyncResult[]>([])

  async function handleSync() {
    setState('syncing')
    const res = await fetch('/api/jira/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
    const data = await res.json() as { results: SyncResult[] }
    setResults(data.results)
    setState('done')
  }

  if (items.length === 0) return null

  return (
    <div className="space-y-3">
      {state === 'idle' && (
        <button
          onClick={() => setState('preview')}
          className="w-full py-2.5 border border-primary/50 text-primary rounded-lg text-sm font-medium hover:bg-primary/5 transition-colors"
        >
          Sincronizar com Jira ({items.length} issues)
        </button>
      )}

      <AnimatePresence>
        {state === 'preview' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-border rounded-xl p-4 space-y-3"
          >
            <p className="text-sm font-medium text-foreground">Issues a sincronizar:</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.jiraIssueId} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    <span className="font-mono text-xs">{item.jiraIssueKey}</span>{' '}
                    {item.title.slice(0, 40)}{item.title.length > 40 ? '…' : ''}
                  </span>
                  <span className="font-semibold text-primary">{item.estimate}h</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setState('idle')}
                className="flex-1 py-2 border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSync}
                className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                Confirmar sync
              </button>
            </div>
          </motion.div>
        )}

        {state === 'syncing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6 text-muted-foreground text-sm"
          >
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Sincronizando com Jira...
          </motion.div>
        )}

        {state === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-border rounded-xl p-4 space-y-2"
          >
            <p className="text-sm font-medium text-foreground">Resultado:</p>
            {results.map((r) => (
              <div key={r.key} className="flex items-center gap-2 text-sm">
                <span>{r.success ? '✅' : '❌'}</span>
                <span className="font-mono text-xs text-muted-foreground">{r.key}</span>
                {r.error && <span className="text-xs text-accent">{r.error}</span>}
              </div>
            ))}
            <button
              onClick={() => setState('idle')}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
            >
              Fechar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
