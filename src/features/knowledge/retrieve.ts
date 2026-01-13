import { tokenize } from '../../lib/strings'
import type { KnowledgeDoc } from './types'

type Scored = { doc: KnowledgeDoc; score: number }

const STOP = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'to',
  'of',
  'in',
  'on',
  'for',
  'with',
  'is',
  'are',
  'be',
  'how',
  'what',
  'should',
  'do',
  'i',
  'my',
  'me',
  'can',
  'it',
])

function normalize(tokens: string[]) {
  return tokens.filter((t) => t.length > 1 && !STOP.has(t))
}

export function bm25Lite(query: string, docs: KnowledgeDoc[], k1 = 1.2, b = 0.75) {
  const q = normalize(tokenize(query))
  const N = docs.length
  if (!q.length || !N) return [] as Scored[]

  const df = new Map<string, number>()
  const docTerms = docs.map((d) => {
    const tokens = normalize(tokenize([d.title, d.snippet, d.keywords.join(' '), (d.headings ?? []).join(' ')].join(' ')))
    const counts = new Map<string, number>()
    for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1)
    for (const t of new Set(tokens)) df.set(t, (df.get(t) ?? 0) + 1)
    return { len: tokens.length, counts }
  })

  const avgLen = docTerms.reduce((a, d) => a + d.len, 0) / N

  const scored: Scored[] = docs.map((doc, i) => {
    let score = 0
    for (const term of q) {
      const n = df.get(term) ?? 0
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5))
      const f = docTerms[i].counts.get(term) ?? 0
      if (!f) continue
      const denom = f + k1 * (1 - b + b * (docTerms[i].len / avgLen))
      score += idf * (f * (k1 + 1)) / denom
    }
    return { doc, score }
  })

  return scored.sort((a, b2) => b2.score - a.score).filter((s) => s.score > 0)
}

