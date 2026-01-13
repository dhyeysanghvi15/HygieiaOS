import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import YAML from 'yaml'
import { buildKeywords, extractHeadings, extractSnippet } from './extract'

type Source = {
  id: string
  title: string
  url: string
  topics: string[]
}

type SourcesFile = { sources: Source[] }

async function fetchHtml(url: string) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'WellnessOS-KnowledgePackBot/1.0 (offline-index builder)',
      accept: 'text/html,*/*',
    },
  })
  if (!res.ok) throw new Error(`Fetch failed: ${url} (${res.status})`)
  return await res.text()
}

async function main() {
  const sourcesPath = resolve('data/sources.yml')
  const raw = await readFile(sourcesPath, 'utf8')
  const parsed = YAML.parse(raw) as SourcesFile

  const docs = []
  for (const s of parsed.sources) {
    const html = await fetchHtml(s.url)
    const headings = extractHeadings(html)
    const snippet = extractSnippet(html, s.topics)
    const keywords = buildKeywords(s.title, headings, s.topics)
    docs.push({
      id: s.id,
      title: s.title,
      url: s.url,
      last_updated: new Date().toISOString().slice(0, 10),
      snippet,
      keywords,
      headings,
    })
    process.stdout.write(`Built: ${s.id} (${snippet.split(/\\s+/).length} words)\\n`)
  }

  const out = {
    generated_at: new Date().toISOString(),
    docs,
  }

  const outPath = resolve('public/knowledge/index.json')
  await writeFile(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8')
  process.stdout.write(`Wrote ${outPath}\\n`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

