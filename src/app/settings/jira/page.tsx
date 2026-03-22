import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Database } from '@/lib/types/database'

type JiraConnection = Database['public']['Tables']['jira_connections']['Row']

interface JiraSettingsPageProps {
  searchParams: Promise<{ status?: string; error?: string }>
}

export default async function JiraSettingsPage({ searchParams }: JiraSettingsPageProps) {
  const { status, error } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: connectionData } = await supabase
    .from('jira_connections')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const connection = connectionData as JiraConnection | null
  const isConnected = !!connection

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border px-6 py-4 flex items-center gap-3">
        <Link href="/settings" className="text-muted-foreground hover:text-foreground text-sm">
          ← Configurações
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="font-semibold text-foreground">Integração Jira</h1>
      </div>

      <div className="max-w-lg mx-auto px-6 py-10 space-y-8">
        {status === 'connected' && (
          <div className="px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-600">
            ✅ Jira conectado com sucesso!
          </div>
        )}
        {error === 'jira_not_configured' ? (
          <div className="px-4 py-4 bg-accent/10 border border-accent/30 rounded-lg text-sm space-y-2">
            <p className="font-semibold text-accent">⚙️ Integração não configurada</p>
            <p className="text-muted-foreground">
              As variáveis <code className="font-mono bg-muted px-1 rounded">JIRA_CLIENT_ID</code> e{' '}
              <code className="font-mono bg-muted px-1 rounded">JIRA_CLIENT_SECRET</code> não estão definidas no servidor.
            </p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Acesse <strong>developer.atlassian.com</strong> → Create app → OAuth 2.0</li>
              <li>Adicione o callback URL: <code className="font-mono bg-muted px-1 rounded">{process.env.NEXT_PUBLIC_APP_URL}/api/jira/callback</code></li>
              <li>Copie o <strong>Client ID</strong> e <strong>Secret</strong> e adicione ao <code className="font-mono bg-muted px-1 rounded">.env.local</code></li>
              <li>Reinicie o servidor de desenvolvimento</li>
            </ol>
          </div>
        ) : error ? (
          <div className="px-4 py-3 bg-accent/10 border border-accent/30 rounded-lg text-sm text-accent">
            ❌ Erro: {error}
          </div>
        ) : null}

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-xl">
              🎯
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Jira Cloud</h2>
              <p className="text-xs text-muted-foreground">OAuth 2.0 (3LO)</p>
            </div>
            <span className={`ml-auto text-xs font-medium px-2 py-1 rounded-full ${
              isConnected ? 'bg-green-500/15 text-green-600' : 'bg-muted text-muted-foreground'
            }`}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>

          {isConnected && connection && (
            <div className="text-sm text-muted-foreground space-y-1 border-t border-border pt-4">
              <p>Site: <span className="text-foreground font-medium">{connection.site_name}</span></p>
              <p>Expira em: <span className="text-foreground">
                {new Date(connection.token_expires_at).toLocaleDateString('pt-BR')}
              </span></p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Link
              href="/api/jira/connect"
              className="flex-1 text-center py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {isConnected ? 'Reconectar' : 'Conectar Jira'}
            </Link>
            {isConnected && (
              <DisconnectButton userId={user.id} />
            )}
          </div>
        </div>

        <div className="bg-muted/40 rounded-xl p-5 space-y-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">O que a integração permite:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Importar issues de qualquer sprint do Jira</li>
            <li>Sincronizar estimativas de volta ao Jira (campo timetracking)</li>
            <li>Escopo: leitura e escrita de issues</li>
          </ul>
        </div>
      </div>
    </main>
  )
}

function DisconnectButton({ userId }: { userId: string }) {
  return (
    <form action="/api/jira/disconnect" method="POST">
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        className="py-2.5 px-4 border border-border rounded-lg text-sm text-muted-foreground hover:text-accent hover:border-accent/50 transition-colors"
      >
        Desconectar
      </button>
    </form>
  )
}
