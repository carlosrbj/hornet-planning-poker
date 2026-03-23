'use client'

import { useState } from 'react'

export interface JiraSettingsClientProps {
  userId: string
  isConnected: boolean
  siteName: string | null
  tokenExpiresAt: string | null
  savedPrefix: string | null
}

export default function JiraSettingsClient({
  userId,
  isConnected,
  siteName,
  tokenExpiresAt,
  savedPrefix,
}: JiraSettingsClientProps) {
  const [prefix, setPrefix] = useState(savedPrefix ?? '')
  const [prefixSaving, setPrefixSaving] = useState(false)
  const [prefixMsg, setPrefixMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const [refreshing, setRefreshing] = useState(false)
  const [refreshMsg, setRefreshMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [expiresAt, setExpiresAt] = useState(tokenExpiresAt)

  async function handleSavePrefix(e: React.FormEvent) {
    e.preventDefault()
    setPrefixSaving(true)
    setPrefixMsg(null)

    const normalized = prefix.trim().toUpperCase()
    const withDash = normalized && !normalized.endsWith('-') ? `${normalized}-` : normalized

    const res = await fetch('/api/jira/prefix', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: withDash || null }),
    })

    if (res.ok) {
      setPrefix(withDash)
      setPrefixMsg({ ok: true, text: withDash ? `Prefixo "${withDash}" salvo.` : 'Prefixo removido.' })
    } else {
      setPrefixMsg({ ok: false, text: 'Erro ao salvar. Tente novamente.' })
    }
    setPrefixSaving(false)
    setTimeout(() => setPrefixMsg(null), 3000)
  }

  async function handleRefreshToken() {
    setRefreshing(true)
    setRefreshMsg(null)

    const res = await fetch('/api/jira/refresh', { method: 'POST' })
    const data = await res.json() as { ok?: boolean; expires_at?: string; error?: string }

    if (res.ok && data.expires_at) {
      setExpiresAt(data.expires_at)
      setRefreshMsg({ ok: true, text: 'Token atualizado com sucesso.' })
    } else {
      setRefreshMsg({ ok: false, text: data.error ?? 'Falha ao atualizar. Reconecte o Jira.' })
    }
    setRefreshing(false)
    setTimeout(() => setRefreshMsg(null), 4000)
  }

  if (!isConnected) return null

  return (
    <div className="space-y-4">
      {/* Prefixo de issue key */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-foreground">Prefixo do projeto</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure o prefixo do seu projeto para digitar apenas o número da issue.
            Ex: <code className="font-mono bg-muted px-1 rounded text-xs">NMTZ-</code> → você digita <code className="font-mono bg-muted px-1 rounded text-xs">10621</code>
          </p>
        </div>

        <form onSubmit={handleSavePrefix} className="space-y-3">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="Ex: NMTZ ou PROJ"
              maxLength={20}
              className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary font-mono uppercase"
            />
            <button
              type="submit"
              disabled={prefixSaving}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0"
            >
              {prefixSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
          {prefix.trim() && (
            <p className="text-xs text-muted-foreground">
              Será salvo como: <code className="font-mono bg-muted px-1 rounded">
                {prefix.trim().toUpperCase().endsWith('-')
                  ? prefix.trim().toUpperCase()
                  : `${prefix.trim().toUpperCase()}-`}
              </code>
            </p>
          )}
          {prefixMsg && (
            <p className={`text-xs ${prefixMsg.ok ? 'text-green-600' : 'text-destructive'}`}>
              {prefixMsg.ok ? '✅' : '❌'} {prefixMsg.text}
            </p>
          )}
        </form>
      </section>

      {/* Token */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-foreground">Token de acesso</h2>
          {expiresAt && (
            <p className="text-sm text-muted-foreground mt-1">
              Expira em: <span className="text-foreground font-medium">
                {new Date(expiresAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </p>
          )}
        </div>
        <button
          onClick={handleRefreshToken}
          disabled={refreshing}
          className="w-full py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 disabled:opacity-50 transition-colors"
        >
          {refreshing ? 'Atualizando...' : '🔄 Atualizar token agora'}
        </button>
        {refreshMsg && (
          <p className={`text-xs ${refreshMsg.ok ? 'text-green-600' : 'text-destructive'}`}>
            {refreshMsg.ok ? '✅' : '❌'} {refreshMsg.text}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          O token é renovado automaticamente. Use esta opção apenas se estiver com problemas de autenticação.
        </p>
      </section>
    </div>
  )
}
