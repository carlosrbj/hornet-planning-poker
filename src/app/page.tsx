import Link from 'next/link'

const features = [
  {
    icon: '⏱',
    title: 'Estimativa em Horas',
    description: 'Foco em horas reais de trabalho, não apenas story points abstratos.',
  },
  {
    icon: '⚡',
    title: 'Tempo Real',
    description: 'Presence e votação sincronizados instantaneamente via Supabase Realtime.',
  },
  {
    icon: '🎯',
    title: 'Integração Jira',
    description: 'Importe issues da sprint e sincronize estimativas de volta ao Jira.',
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 px-6 py-24 text-center">
        <div className="text-6xl mb-6">🐝</div>
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight max-w-2xl">
          Planning Poker{' '}
          <span className="text-primary">Hornet</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl">
          Estimativas colaborativas em tempo real para times ágeis.
          Integração nativa com Jira, foco em horas e animações que tornam o planning mais leve.
        </p>
        <div className="mt-8 flex gap-4 flex-wrap justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors"
          >
            Começar agora
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-border rounded-xl font-semibold text-base text-foreground hover:bg-muted transition-colors"
          >
            Ver demo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-muted/40">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-muted-foreground border-t border-border">
        Planning Poker Hornet — feito com Next.js 16, Supabase e Framer Motion
      </footer>
    </main>
  )
}
