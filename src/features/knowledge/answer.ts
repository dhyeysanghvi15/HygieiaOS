import { loadKnowledgeIndex } from './index'
import { bm25Lite } from './retrieve'

export async function buildKnowledgeAnswer(
  question: string,
  opts?: { liveWebMode?: boolean },
): Promise<{
  text: string
  citations: Array<{ id: string; title: string; url: string; lastUpdated: string }>
}> {
  const proxy = import.meta.env.VITE_WEB_PROXY_URL as string | undefined
  const liveWebEnabled = !!opts?.liveWebMode
  const liveConfigured = liveWebEnabled && !!proxy
  if (liveConfigured) {
    try {
      const res = await fetch(`${proxy.replace(/\/$/, '')}/search?q=${encodeURIComponent(question)}`)
      if (res.ok) {
        const json = (await res.json()) as {
          text: string
          citations: Array<{ title: string; url: string; last_updated: string }>
        }
        return {
          text: `Web-sourced (Live Web Mode)\n\n${json.text}`,
          citations: json.citations.map((c) => ({
            id: c.url,
            title: c.title,
            url: c.url,
            lastUpdated: c.last_updated,
          })),
        }
      }
    } catch {
      // fall back to offline pack
    }
  }

  const index = await loadKnowledgeIndex()
  const ranked = bm25Lite(question, index.docs).slice(0, 3)

  if (!ranked.length) {
    return {
      text:
        "I can’t find a strong match in the offline Hygiene Knowledge Pack. Try rephrasing (e.g., “handwashing 20 seconds”), or open Tools for a timer.",
      citations: [],
    }
  }

  const best = ranked[0].doc
  const citations = ranked.map((r) => ({
    id: r.doc.id,
    title: r.doc.title,
    url: r.doc.url,
    lastUpdated: r.doc.last_updated,
  }))

  const prefix =
    liveWebEnabled && !proxy
      ? 'Live Web Mode is ON but not configured (no proxy). Using Offline Knowledge Mode.\n\n'
      : ''
  const text = [
    prefix.trimEnd(),
    `Here’s what the offline Hygiene Knowledge Pack says (last updated ${best.last_updated}):`,
    '',
    `• ${best.snippet}`,
    '',
    'Want a timer or routine to go with this?',
  ]
    .filter(Boolean)
    .join('\n')

  return { text, citations }
}
