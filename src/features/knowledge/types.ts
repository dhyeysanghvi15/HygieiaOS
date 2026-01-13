import { z } from 'zod'

export const KnowledgeDocSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  last_updated: z.string(),
  snippet: z.string(),
  keywords: z.array(z.string()),
  headings: z.array(z.string()).optional().default([]),
})

export type KnowledgeDoc = z.infer<typeof KnowledgeDocSchema>

export const KnowledgeIndexSchema = z.object({
  generated_at: z.string(),
  docs: z.array(KnowledgeDocSchema),
})

export type KnowledgeIndex = z.infer<typeof KnowledgeIndexSchema>

