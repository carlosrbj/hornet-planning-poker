import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PlanId } from '@/lib/billing/plans'

const VALID_PLANS: PlanId[] = ['free', 'starter', 'pro', 'pro_plus']

// Rota protegida por token secreto — nunca exposto ao cliente
// Uso: PUT /api/admin/plan  { token, userId, planId }
// Exemplo de ativação manual enquanto o Stripe não está integrado

export async function PUT(request: NextRequest) {
  const adminToken = process.env.ADMIN_SECRET_TOKEN
  if (!adminToken) {
    return NextResponse.json({ error: 'ADMIN_SECRET_TOKEN não configurado' }, { status: 500 })
  }

  const body = await request.json() as {
    token?: string
    userId?: string
    planId?: string
    billingPeriod?: 'monthly' | 'annual'
    notes?: string
  }

  if (body.token !== adminToken) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (!body.userId || !body.planId) {
    return NextResponse.json({ error: 'userId e planId são obrigatórios' }, { status: 400 })
  }

  if (!VALID_PLANS.includes(body.planId as PlanId)) {
    return NextResponse.json({ error: `planId inválido. Use: ${VALID_PLANS.join(', ')}` }, { status: 400 })
  }

  const supabase = await createClient()

  // Verificar se usuário existe
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .eq('id', body.userId)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  const planId = body.planId as PlanId
  const now = new Date()
  const periodDays = body.billingPeriod === 'annual' ? 365 : 30
  const periodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000)

  // Upsert na tabela subscriptions
  const { error: subError } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: body.userId,
        plan_id: planId,
        status: planId === 'free' ? 'active' : 'active',
        billing_period: planId === 'free' ? null : (body.billingPeriod ?? 'monthly'),
        current_period_end: planId === 'free' ? null : periodEnd.toISOString(),
        payment_method: 'manual',
        notes: body.notes ?? `Ativado manualmente em ${now.toLocaleDateString('pt-BR')}`,
        updated_at: now.toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 })
  }

  // Atualiza profiles.plan_id diretamente (redundante com trigger, mas garante consistência)
  await supabase
    .from('profiles')
    .update({ plan_id: planId })
    .eq('id', body.userId)

  return NextResponse.json({
    ok: true,
    user: { id: profile.id, name: profile.display_name, email: profile.email },
    plan: planId,
    periodEnd: planId === 'free' ? null : periodEnd.toISOString(),
  })
}
