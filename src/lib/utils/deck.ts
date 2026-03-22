export const DECKS = {
  hours: {
    name: 'Horas',
    values: [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 16, 20, 22, 24, 25, 30, 32],
    unit: 'h',
    description: 'Estimativa em horas de trabalho',
  },
} as const

// Todos os valores de hora disponíveis para seleção personalizada
export const ALL_HOUR_VALUES = [
  1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 16, 20, 22, 24, 25, 30, 32,
] as const

// Valores padrão quando nenhuma seleção personalizada for definida
export const DEFAULT_HOUR_VALUES = [1, 2, 3, 4, 6, 8, 12, 16, 24] as const

export const SPECIAL_CARDS = {
  coffee: '☕',
  question: '?',
  infinity: '∞',
} as const

export type DeckType = keyof typeof DECKS
