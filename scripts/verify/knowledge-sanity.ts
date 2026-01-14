import { readFileSync } from 'node:fs'

type Doc = {
  id: string
  title: string
  url: string
  last_updated: string
  snippet: string
  keywords: string[]
  headings?: string[]
}

type Index = { generated_at: string; docs: Doc[] }

function wordCount(s: string) {
  return s.trim().split(/\s+/).filter(Boolean).length
}

function main() {
  const raw = readFileSync('public/knowledge/index.json', 'utf8')
  const index = JSON.parse(raw) as Index
  if (!index.docs?.length) throw new Error('Knowledge pack has no docs.')

  const MAX_WORDS = 25
  const MAX_CHARS = 220
  const MAX_KEYWORDS = 16

  const failures: string[] = []
  for (const d of index.docs) {
    const wc = wordCount(d.snippet)
    if (wc > MAX_WORDS) failures.push(`${d.id}: snippet has ${wc} words (max ${MAX_WORDS})`)
    if (d.snippet.length > MAX_CHARS) failures.push(`${d.id}: snippet has ${d.snippet.length} chars (max ${MAX_CHARS})`)
    if (!d.url?.startsWith('http')) failures.push(`${d.id}: invalid url`)
    if ((d.keywords?.length ?? 0) > MAX_KEYWORDS) failures.push(`${d.id}: too many keywords`)
  }

  if (failures.length) {
    console.error('Knowledge sanity FAIL')
    for (const f of failures) console.error(`- ${f}`)
    process.exit(1)
  }

  console.log('Knowledge sanity PASS')
  console.log(`Docs: ${index.docs.length}`)
  console.log(`Snippets: <= ${MAX_WORDS} words`)
}

main()

