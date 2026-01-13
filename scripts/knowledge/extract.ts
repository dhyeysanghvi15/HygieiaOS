import * as cheerio from 'cheerio'
import { tokenize } from '../../src/lib/strings'

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
  'that',
  'this',
  'as',
  'at',
  'from',
])

function normalizeText(s: string) {
  return s.replace(/\s+/g, ' ').replace(/\u00a0/g, ' ').trim()
}

export function extractHeadings(html: string) {
  const $ = cheerio.load(html)
  const hs: string[] = []
  $('h1,h2,h3').each((_, el) => {
    const t = normalizeText($(el).text())
    if (t && t.length <= 80) hs.push(t)
  })
  return [...new Set(hs)].slice(0, 8)
}

export function extractSnippet(html: string, topics: string[]) {
  const $ = cheerio.load(html)
  $('script,style,noscript,svg').remove()
  const candidates: string[] = []
  $('p,li').each((_, el) => {
    const t = normalizeText($(el).text())
    if (t.length < 40) return
    if (t.length > 260) return
    candidates.push(t)
  })

  const topicTokens = new Set(tokenize(topics.join(' ')))
  const scored = candidates
    .map((c) => {
      const toks = tokenize(c)
      const score = toks.reduce((a, t) => (topicTokens.has(t) ? a + 1 : a), 0)
      return { c, score }
    })
    .sort((a, b) => b.score - a.score)

  const best = scored.find((s) => s.score > 0)?.c ?? candidates[0] ?? ''
  return truncateWords(best, 25)
}

export function buildKeywords(title: string, headings: string[], topics: string[]) {
  const toks = tokenize([title, ...headings, ...topics].join(' '))
    .filter((t) => t.length > 2 && !STOP.has(t))
    .slice(0, 60)
  const uniq: string[] = []
  for (const t of toks) if (!uniq.includes(t)) uniq.push(t)
  return uniq.slice(0, 16)
}

export function truncateWords(text: string, maxWords: number) {
  const words = normalizeText(text).split(/\s+/)
  if (words.length <= maxWords) return words.join(' ')
  return words.slice(0, maxWords).join(' ')
}

