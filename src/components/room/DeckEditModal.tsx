'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { ALL_HOUR_VALUES, DEFAULT_HOUR_VALUES } from '@/lib/utils/deck'

export interface DeckEditModalProps {
  isOpen: boolean
  onClose: () => void
  roomId: string
  currentSettings: Record<string, unknown>
  onSave: (newValues: number[]) => Promise<void>
}

export default function DeckEditModal({
  isOpen,
  onClose,
  roomId,
  currentSettings,
  onSave,
}: DeckEditModalProps) {
  const initialValues = (currentSettings?.custom_values as number[] | undefined)
  const [activeValues, setActiveValues] = useState<number[]>(
    () => [...(initialValues ?? DEFAULT_HOUR_VALUES)]
  )
  const [customInput, setCustomInput] = useState('')
  const [saving, setSaving] = useState(false)

  const knownValues = ALL_HOUR_VALUES as readonly number[]
  const customValues = activeValues.filter((v) => !knownValues.includes(v))

  function toggleValue(v: number) {
    setActiveValues((prev) => {
      if (prev.includes(v)) {
        if (prev.length <= 1) return prev // mínimo 1
        return prev.filter((x) => x !== v)
      }
      return [...prev, v].sort((a, b) => a - b)
    })
  }

  function addCustomValue() {
    const num = parseFloat(customInput)
    if (isNaN(num) || num < 0.5 || num > 999) return
    if (activeValues.includes(num)) {
      setCustomInput('')
      return
    }
    setActiveValues((prev) => [...prev, num].sort((a, b) => a - b))
    setCustomInput('')
  }

  async function handleSave() {
    setSaving(true)
    try {
      const supabase = createClient()
      await supabase.from('rooms').update({
        settings: { ...currentSettings, custom_values: activeValues },
      }).eq('id', roomId)
      await onSave(activeValues)
    } finally {
      setSaving(false)
    }
  }

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
            <div className="bg-[#0d1020] border border-white/[0.08] rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Editar estimativas</h2>
                <button onClick={onClose} className="text-[var(--muted)] hover:text-foreground transition-colors">✕</button>
              </div>

              {/* Valores disponíveis */}
              <div>
                <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
                  Valores disponíveis
                </p>
                <div className="flex flex-wrap gap-2">
                  {(ALL_HOUR_VALUES as readonly number[]).map((v) => {
                    const isActive = activeValues.includes(v)
                    return (
                      <button
                        key={v}
                        onClick={() => toggleValue(v)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                          isActive
                            ? 'bg-[var(--accent)] text-[#111] border-transparent'
                            : 'border-white/[0.08] text-[var(--muted)] hover:border-[var(--accent)]/30 hover:text-foreground'
                        }`}
                      >
                        {v}h
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Valores customizados */}
              {customValues.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
                    Valores personalizados
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {customValues.map((v) => (
                      <span
                        key={v}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-[var(--accent)] text-[#111]"
                      >
                        {v}h
                        <button
                          onClick={() => toggleValue(v)}
                          className="text-[#111]/60 hover:text-[#111] transition-colors leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Adicionar valor personalizado */}
              <div>
                <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
                  Adicionar valor personalizado
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0.5}
                    max={999}
                    step={0.5}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomValue()}
                    placeholder="ex: 40"
                    className="flex-1 px-3 py-2 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-lg text-foreground placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    onClick={addCustomValue}
                    disabled={!customInput}
                    className="px-4 py-2 rounded-lg text-sm font-bold text-[#111] bg-[var(--accent)] hover:bg-[var(--accent-2)] disabled:opacity-40 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving || activeValues.length === 0}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#111] bg-[var(--accent)] hover:bg-[var(--accent-2)] disabled:opacity-50 transition-all"
                >
                  {saving ? 'Salvando...' : 'Salvar deck'}
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
