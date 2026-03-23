import { createClient } from '@/lib/supabase/server'

export type PlanId = 'free' | 'starter' | 'pro' | 'pro_plus'

export interface PlanFeatures {
  maxHistorySessions: number | null  // null = ilimitado
  historyRetentionDays: number | null
  analytics: boolean
  exportCsv: boolean
  exportPdf: boolean
  compareSprints: boolean
  executiveDashboard: boolean
}

// Espelho local das regras do banco — fonte da verdade para gating server-side
const PLAN_RULES: Record<PlanId, PlanFeatures> = {
  free: {
    maxHistorySessions: 1,
    historyRetentionDays: 1,
    analytics: false,
    exportCsv: false,
    exportPdf: false,
    compareSprints: false,
    executiveDashboard: false,
  },
  starter: {
    maxHistorySessions: 10,
    historyRetentionDays: 180,
    analytics: false,
    exportCsv: true,
    exportPdf: false,
    compareSprints: false,
    executiveDashboard: false,
  },
  pro: {
    maxHistorySessions: null,
    historyRetentionDays: 365,
    analytics: true,
    exportCsv: true,
    exportPdf: true,
    compareSprints: true,
    executiveDashboard: false,
  },
  pro_plus: {
    maxHistorySessions: null,
    historyRetentionDays: null,
    analytics: true,
    exportCsv: true,
    exportPdf: true,
    compareSprints: true,
    executiveDashboard: true,
  },
}

export async function getUserPlan(userId: string): Promise<PlanId> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('plan_id')
    .eq('id', userId)
    .single()
  return ((data?.plan_id as PlanId) ?? 'free')
}

export function getPlanFeatures(planId: PlanId): PlanFeatures {
  return PLAN_RULES[planId]
}

export function canAccess(planId: PlanId, feature: keyof PlanFeatures): boolean {
  const rules = PLAN_RULES[planId]
  const value = rules[feature]
  if (typeof value === 'boolean') return value
  if (value === null) return true              // null = ilimitado = pode acessar
  if (typeof value === 'number') return value > 1
  return false
}

// Retorna quantas sessões históricas o plano pode ver (null = todas)
export function getHistoryLimit(planId: PlanId): number | null {
  return PLAN_RULES[planId].maxHistorySessions
}
