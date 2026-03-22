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
}

export default function CardDeck({ deckType, selectedValue, onSelect, onDeselect, disabled = false, customValues }: CardDeckProps) {
  const deck = DECKS[deckType] as { values: readonly (number | string)[] } | undefined
  const defaultValues: (number | string)[] = deck ? [...deck.values] : [...DEFAULT_HOUR_VALUES]
  const values: (number | string)[] = customValues && customValues.length > 0
    ? [...customValues].sort((a, b) => a - b)
    : defaultValues

  return (
    <div className="flex flex-wrap justify-center gap-2 p-4">
      {values.map((value) => (
        <PokerCard
          key={String(value)}
          value={value}
          isSelected={selectedValue === value}
          onSelect={onSelect}
          onDeselect={onDeselect}
          disabled={disabled}
        />
      ))}
      {Object.entries(SPECIAL_CARDS).map(([key, emoji]) => (
        <PokerCard
          key={key}
          value={emoji}
          isSelected={selectedValue === emoji}
          onSelect={onSelect}
          onDeselect={onDeselect}
          disabled={disabled}
        />
      ))}
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
          scale: 1.08,
          y: -8,
          boxShadow: '0 0 20px rgba(245, 158, 11, 0.6)',
          transition: { type: 'spring', stiffness: 300, damping: 20 },
        },
      }}
      whileHover={disabled ? {} : { scale: 1.05, y: -4 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      disabled={disabled}
      className={`
        relative w-14 h-20 rounded-xl border-2 flex flex-col items-center justify-center
        text-lg font-bold cursor-pointer select-none transition-colors
        ${isSelected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-foreground hover:border-primary/50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <span>{value}</span>
    </motion.button>
  )
}
