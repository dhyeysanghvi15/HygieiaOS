import type { RiskTier } from '../types'

const RED_PATTERNS: Array<[RegExp, string]> = [
  [/\b(suicid(e|al)|kill myself|end my life|take my life)\b/i, 'self-harm intent'],
  [/\b(self[- ]?harm|cut myself|hurt myself)\b/i, 'self-harm mention'],
  [/\b(i want to die|i'm going to die)\b/i, 'death wish'],
]

const ORANGE_PATTERNS: Array<[RegExp, string]> = [
  [/\b(can't go on|no reason to live)\b/i, 'hopelessness'],
  [/\b(overdose|od)\b/i, 'overdose mention'],
  [/\b(abuse|assault|rape)\b/i, 'violence/abuse mention'],
]

const YELLOW_PATTERNS: Array<[RegExp, string]> = [
  [/\b(panic attack|panic|can't breathe)\b/i, 'panic'],
  [/\b(anxious|anxiety|depressed|depression)\b/i, 'mental health distress'],
  [/\b(self-esteem|worthless|hate myself)\b/i, 'low self-worth'],
]

export function scoreRisk(input: string): { tier: RiskTier; reasons: string[] } {
  const reasons: string[] = []

  for (const [re, reason] of RED_PATTERNS) {
    if (re.test(input)) reasons.push(reason)
  }
  if (reasons.length) return { tier: 'red', reasons }

  for (const [re, reason] of ORANGE_PATTERNS) {
    if (re.test(input)) reasons.push(reason)
  }
  if (reasons.length) return { tier: 'orange', reasons }

  for (const [re, reason] of YELLOW_PATTERNS) {
    if (re.test(input)) reasons.push(reason)
  }
  if (reasons.length) return { tier: 'yellow', reasons }

  return { tier: 'green', reasons: [] }
}

