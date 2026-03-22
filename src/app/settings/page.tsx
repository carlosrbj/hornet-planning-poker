import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type JiraConnection = Database['public']['Tables']['jira_connections']['Row']

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profileData }, { data: connectionData }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('jira_connections').select('*').eq('user_id', user.id).single(),
  ])

  const profile = profileData as Profile | null
  const jira = connectionData as JiraConnection | null

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground text-sm">
          ← Dashboard
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="font-semibold text-foreground">Configurações</h1>
      </div>

      <div className="max-w-lg mx-auto px-6 py-10 space-y-6">
        {/* Perfil */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Perfil</h2>
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.display_name ?? ''}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
                {(profile?.display_name ?? user.email ?? '?')[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium text-foreground">{profile?.display_name ?? '—'}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Perfil sincronizado via Google OAuth. Para alterar nome ou foto, atualize sua conta Google.
          </p>
        </section>

        {/* Integrações */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Integrações</h2>
          <Link
            href="/settings/jira"
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-lg">
                🎯
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Jira Cloud</p>
                <p className="text-xs text-muted-foreground">
                  {jira ? `Conectado · ${jira.site_name}` : 'Não conectado'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                jira ? 'bg-green-500/15 text-green-600' : 'bg-muted text-muted-foreground'
              }`}>
                {jira ? 'Ativo' : 'Inativo'}
              </span>
              <span className="text-muted-foreground text-sm">→</span>
            </div>
          </Link>
        </section>

        {/* Conta */}
        <section className="bg-card border border-border rounded-xl p-6 space-y-3">
          <h2 className="font-semibold text-foreground">Conta</h2>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>ID: <span className="font-mono text-xs">{user.id}</span></p>
            <p>Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
          <form action="/api/auth/logout" method="POST" className="pt-2">
            <button
              type="submit"
              className="text-sm text-accent hover:text-accent/80 transition-colors"
            >
              Sair da conta
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
