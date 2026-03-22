'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils/slug'
import { ALL_HOUR_VALUES, DEFAULT_HOUR_VALUES } from '@/lib/utils/deck'

export interface CreateRoomModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}


export default function CreateRoomModal({ isOpen, onClose, userId }: CreateRoomModalProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [timerSeconds, setTimerSeconds] = useState(120)
  const [selectedValues, setSelectedValues] = useState<number[]>([...DEFAULT_HOUR_VALUES])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleValue(v: number) {
    setSelectedValues((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    )
  }

  function resetForm() {
    setName('')
    setTimerSeconds(120)
    setSelectedValues([...DEFAULT_HOUR_VALUES])
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    if (selectedValues.length < 2) {
      setError('Selecione ao menos 2 valores de estimativa.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const slug = generateSlug()

      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert({
          name: name.trim(),
          slug,
          created_by: userId,
          deck_type: 'hours',
          settings: {
            timer_seconds: timerSeconds,
            custom_values: [...selectedValues].sort((a, b) => a - b),
            auto_reveal: false,
            allow_spectators: true,
            show_average: true,
            coffee_break_enabled: true,
          },
        })
        .select()
        .single()

      if (roomError) throw roomError

      const room = roomData as { id: string; slug: string }

      await supabase.from('room_participants').insert({
        room_id: room.id,
        user_id: userId,
        role: 'facilitator',
      })

      resetForm()
      router.push(`/room/${slug}`)
      onClose()
    } catch (err) {
      setError('Erro ao criar sala. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
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
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">Nova Sala</h2>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Nome da sala
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sprint 42 — Planning"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary text-sm"
                    required
                  />
                </div>

                {/* Valores de estimativa */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-foreground">
                      Valores de estimativa (horas)
                    </label>
                    <span className="text-xs text-muted-foreground">
                      {selectedValues.length} selecionado{selectedValues.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ALL_HOUR_VALUES.map((v) => {
                      const selected = selectedValues.includes(v)
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => toggleValue(v)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                            selected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                          }`}
                        >
                          {v}h
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedValues([...ALL_HOUR_VALUES])}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedValues([...DEFAULT_HOUR_VALUES])}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
                    >
                      Padrão
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedValues([])}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                {/* Timer */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Timer por issue
                  </label>
                  <select
                    value={timerSeconds}
                    onChange={(e) => setTimerSeconds(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary text-sm"
                  >
                    <option value={0}>Sem timer</option>
                    <option value={60}>1 minuto</option>
                    <option value={120}>2 minutos</option>
                    <option value={180}>3 minutos</option>
                    <option value={300}>5 minutos</option>
                    <option value={600}>10 minutos</option>
                  </select>
                </div>

                {error && (
                  <p className="text-sm text-accent">{error}</p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !name.trim() || selectedValues.length < 2}
                    className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Criando...' : 'Criar Sala'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
