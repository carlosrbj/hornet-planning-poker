'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export interface IssueDetailsFields {
  description: string
  issue_type: string
  criticality: string
  reporter_name: string
  assignee_name: string
  deadline: string
  jira_status: string
}

export interface IssueDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  issueId: string
  initialValues?: Partial<IssueDetailsFields>
}

const EMPTY: IssueDetailsFields = {
  description: '',
  issue_type: '',
  criticality: '',
  reporter_name: '',
  assignee_name: '',
  deadline: '',
  jira_status: '',
}

const ISSUE_TYPES = ['Bug', 'Melhoria', 'Story', 'Task', 'Epic']

export default function IssueDetailsModal({
  isOpen,
  onClose,
  issueId,
  initialValues,
}: IssueDetailsModalProps) {
  const [values, setValues] = useState<IssueDetailsFields>({
    ...EMPTY,
    ...initialValues,
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function set(field: keyof IssueDetailsFields, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const supabase = createClient()
    const { error } = await supabase.from('issues').update({
      description: values.description || null,
      issue_type: values.issue_type || null,
      criticality: values.criticality || null,
      reporter_name: values.reporter_name || null,
      assignee_name: values.assignee_name || null,
      deadline: values.deadline || null,
      jira_status: values.jira_status || null,
    }).eq('id', issueId)

    if (error) {
      setSaveError('Erro ao salvar. Tente novamente.')
      setSaving(false)
      return
    }
    setSaving(false)
    onClose()
  }

  const inputClass = "w-full px-3 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-lg text-foreground placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
  const labelClass = "block text-xs text-[var(--muted)] mb-1"

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-[#0d1020] border border-white/[0.08] rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Detalhes da issue</h2>
                <button onClick={onClose} className="text-[var(--muted)] hover:text-foreground transition-colors">✕</button>
              </div>

              <p className="text-xs text-[var(--muted)]">Todos os campos são opcionais.</p>

              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Descrição</label>
                  <textarea
                    value={values.description}
                    onChange={(e) => set('description', e.target.value)}
                    placeholder="Descreva a issue..."
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Tipo</label>
                    <select
                      value={values.issue_type}
                      onChange={(e) => set('issue_type', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Selecione...</option>
                      {ISSUE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Criticidade</label>
                    <input
                      type="text"
                      value={values.criticality}
                      onChange={(e) => set('criticality', e.target.value)}
                      placeholder="ex: Alta, Média, Baixa"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Analista</label>
                    <input
                      type="text"
                      value={values.reporter_name}
                      onChange={(e) => set('reporter_name', e.target.value)}
                      placeholder="Nome do analista"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Desenvolvedor</label>
                    <input
                      type="text"
                      value={values.assignee_name}
                      onChange={(e) => set('assignee_name', e.target.value)}
                      placeholder="Nome do dev"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Prazo</label>
                    <input
                      type="date"
                      value={values.deadline}
                      onChange={(e) => set('deadline', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Status Jira</label>
                    <input
                      type="text"
                      value={values.jira_status}
                      onChange={(e) => set('jira_status', e.target.value)}
                      placeholder="ex: In Progress"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {saveError && (
                <p className="text-xs text-[var(--danger)]">{saveError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#111] bg-[var(--accent)] hover:bg-[var(--accent-2)] disabled:opacity-50 transition-all"
                >
                  {saving ? 'Salvando...' : 'Salvar detalhes'}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--muted)] hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
