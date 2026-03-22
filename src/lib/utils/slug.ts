const adjectives = [
  'fast', 'sharp', 'bright', 'bold', 'swift', 'calm', 'dark', 'cool',
  'deep', 'fierce', 'golden', 'iron', 'jade', 'keen', 'lean', 'mighty',
]

const nouns = [
  'tiger', 'falcon', 'hornet', 'wolf', 'hawk', 'bear', 'eagle', 'fox',
  'lion', 'lynx', 'panther', 'raven', 'shark', 'viper', 'wasp', 'crane',
]

export function generateSlug(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 90) + 10
  return `${adj}-${noun}-${num}`
}
