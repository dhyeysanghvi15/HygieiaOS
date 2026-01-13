import { KnowledgeIndexSchema, type KnowledgeIndex } from './types'

let cached: KnowledgeIndex | null = null

export async function loadKnowledgeIndex(): Promise<KnowledgeIndex> {
  if (cached) return cached
  const res = await fetch(`${import.meta.env.BASE_URL}knowledge/index.json`, { cache: 'force-cache' })
  if (!res.ok) throw new Error('Failed to load knowledge pack.')
  const json = await res.json()
  cached = KnowledgeIndexSchema.parse(json)
  return cached
}

