export type Env = Record<string, unknown>

const ALLOWLIST: Array<{ title: string; url: string; topicTokens: string[] }> = [
  {
    title: 'CDC: When and How to Wash Your Hands',
    url: 'https://www.cdc.gov/clean-hands/about-handwashing.html',
    topicTokens: ['hand', 'wash', 'soap', 'seconds'],
  },
  {
    title: 'ADA: Brushing Your Teeth',
    url: 'https://www.ada.org/resources/ada-library/oral-health-topics/brushing-your-teeth',
    topicTokens: ['brush', 'teeth', 'fluoride', 'minutes'],
  },
  {
    title: 'ADA: Floss',
    url: 'https://www.ada.org/resources/ada-library/oral-health-topics/floss',
    topicTokens: ['floss', 'plaque', 'between'],
  },
  {
    title: 'NHLBI (NIH): Sleep Deprivation and Deficiency',
    url: 'https://www.nhlbi.nih.gov/health/sleep-deprivation',
    topicTokens: ['sleep', 'schedule', 'caffeine', 'screen'],
  },
]

function normalizeText(s: string) {
  return s.replace(/\\s+/g, ' ').replace(/\\u00a0/g, ' ').trim()
}

function truncateWords(text: string, maxWords: number) {
  const words = normalizeText(text).split(/\\s+/)
  if (words.length <= maxWords) return words.join(' ')
  return words.slice(0, maxWords).join(' ')
}

async function fetchHtml(url: string) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'WellnessOS-LiveWeb/1.0',
      accept: 'text/html,*/*',
    },
  })
  if (!res.ok) throw new Error('fetch failed')
  return await res.text()
}

function extractSnippet(html: string, tokens: string[]) {
  // lightweight heuristic: pick the first paragraph with topic hits
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
  const paras = text.split(/\n{2,}/).map(normalizeText).filter((p) => p.length > 40 && p.length < 320)
  const lowerTokens = tokens.map((t) => t.toLowerCase())
  const best =
    paras.find((p) => lowerTokens.some((t) => p.toLowerCase().includes(t))) ?? paras[0] ?? 'No snippet.'
  return truncateWords(best, 25)
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname !== '/search') return new Response('Not found', { status: 404 })
    const q = (url.searchParams.get('q') ?? '').trim()
    if (!q) return new Response(JSON.stringify({ text: 'Missing query', citations: [] }), { status: 400 })

    const qTokens = q.toLowerCase().split(/\s+/).slice(0, 12)
    const ranked = ALLOWLIST.map((s) => ({
      s,
      score: s.topicTokens.reduce((a, t) => (qTokens.includes(t) ? a + 1 : a), 0),
    }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)

    const citations = []
    const snippets: string[] = []
    for (const r of ranked) {
      try {
        const html = await fetchHtml(r.s.url)
        const snippet = extractSnippet(html, r.s.topicTokens)
        citations.push({ title: r.s.title, url: r.s.url, last_updated: new Date().toISOString().slice(0, 10) })
        snippets.push(`• ${snippet}`)
      } catch {
        // ignore
      }
    }

    const body = {
      text: snippets.length ? snippets.join('\\n') : 'No live results available. Use Offline Knowledge Mode.',
      citations,
    }
    return new Response(JSON.stringify(body), {
      headers: { 'content-type': 'application/json; charset=utf-8' },
    })
  },
}
