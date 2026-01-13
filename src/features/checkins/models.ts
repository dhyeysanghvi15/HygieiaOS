import { z } from 'zod'

export const CheckinSchema = z.object({
  id: z.string(),
  createdAt: z.number(),
  mood: z.number().int().min(1).max(5),
  stress: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5),
  tags: z.array(z.string()).max(8),
  note: z.string().max(280).optional(),
})

export type Checkin = z.infer<typeof CheckinSchema>

export type HydrationState = {
  waterMlToday: number
  goalMl: number
  lastUpdatedDayKey: string
}

