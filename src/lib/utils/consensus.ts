function getMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

function getStdDev(values: number[], avg: number): number {
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length
  return Math.sqrt(variance)
}

function getDistribution(values: number[]): Record<number, number> {
  return values.reduce(
    (acc, v) => {
      acc[v] = (acc[v] || 0) + 1
      return acc
    },
    {} as Record<number, number>
  )
}

export function analyzeVotes(votes: (number | null)[]) {
  const validVotes = votes.filter((v): v is number => v !== null && !isNaN(v))
  if (validVotes.length === 0) return null

  const avg = validVotes.reduce((a, b) => a + b, 0) / validVotes.length
  const median = getMedian(validVotes)
  const min = Math.min(...validVotes)
  const max = Math.max(...validVotes)
  const range = max - min
  const stdDev = getStdDev(validVotes, avg)
  const cv = avg > 0 ? (stdDev / avg) * 100 : 0

  return {
    average: Math.round(avg * 10) / 10,
    median,
    min,
    max,
    range,
    standardDeviation: Math.round(stdDev * 10) / 10,
    coefficientOfVariation: Math.round(cv),
    consensus: cv < 25,
    highDivergence: cv > 60,
    needsDiscussion: cv >= 25 && cv <= 60,
    strongConsensus: cv < 15,
    distribution: getDistribution(validVotes),
    totalVoters: validVotes.length,
  }
}
