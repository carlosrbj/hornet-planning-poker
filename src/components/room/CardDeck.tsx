'use client'

import { motion } from 'framer-motion'
import { DECKS, SPECIAL_CARDS, DEFAULT_HOUR_VALUES } from '@/lib/utils/deck'
import type { DeckType } from '@/lib/utils/deck'

export interface CardDeckProps {
  deckType: DeckType
  selectedValue: number | string | null
  onSelect: (value: number | string) => void
  onDeselect?: () => void
  disabled?: boolean
  customValues?: number[]
  isCreator?: boolean
  onEditDeck?: () => void
}

export default function CardDeck({ deckType, selectedValue, onSelect, onDeselect, disabled = false, customValues, isCreator, onEditDeck }: CardDeckProps) {
  const deck = DECKS[deckType] as { values: readonly (number | string)[] } | undefined
  const defaultValues: (number | string)[] = deck ? [...deck.values] : [...DEFAULT_HOUR_VALUES]
  const values: (number | string)[] = customValues && customValues.length > 0
    ? [...customValues].sort((a, b) => a - b)
    : defaultValues

  const allValues = [...values, ...Object.values(SPECIAL_CARDS)]

  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <h3 className="text-[0.75rem] font-semibold text-[var(--muted)] tracking-wide uppercase">Estimativa</h3>
          {isCreator && onEditDeck && (
            <button
              onClick={onEditDeck}
              title="Editar estimativas"
              className="text-[var(--muted)]/50 hover:text-[var(--accent)] transition-colors text-[0.8rem] leading-none"
            >
              ✎
            </button>
          )}
        </div>
        {selectedValue !== null && (
          <span className="text-[var(--muted)] text-[0.72rem]">
            Selecionado: <strong className="text-[var(--accent)]">{selectedValue}</strong>
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {allValues.map((value) => (
          <PokerCard
            key={String(value)}
            value={value}
            isSelected={selectedValue === value}
            onSelect={onSelect}
            onDeselect={onDeselect}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}

interface PokerCardProps {
  value: number | string
  isSelected: boolean
  onSelect: (value: number | string) => void
  onDeselect?: () => void
  disabled: boolean
}

function PokerCard({ value, isSelected, onSelect, onDeselect, disabled }: PokerCardProps) {
  return (
    <motion.button
      onClick={() => {
        if (disabled) return
        if (isSelected) onDeselect?.()
        else onSelect(value)
      }}
      animate={isSelected ? 'selected' : 'idle'}
      variants={{
        idle: { scale: 1, y: 0 },
        selected: {
          scale: 1.06,
          y: -6,
          transition: { type: 'spring', stiffness: 300, damping: 20 },
        },
      }}
      whileHover={disabled ? {} : { y: -3, scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      disabled={disabled}
      className={`
        min-h-[44px] px-3 rounded-xl border flex items-center justify-center
        font-bold text-[0.85rem] cursor-pointer select-none transition-colors
        ${isSelected
          ? 'border-transparent text-[#111]'
          : 'border-white/[0.06] bg-white/[0.04] text-foreground hover:border-[var(--accent)]/20 hover:text-[var(--accent)]'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      style={isSelected ? {
        background: 'linear-gradient(135deg, #ffd60a, #ffbf00)',
        boxShadow: '0 8px 18px rgba(255,214,10,0.22)',
      } : {}}
    >
      <span>{value}</span>
    </motion.button>
  )
}
