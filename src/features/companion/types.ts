export type RiskTier = 'green' | 'yellow' | 'orange' | 'red'

export type Citation = {
  id: string
  title: string
  url: string
  lastUpdated: string
}

export type CompanionAction =
  | { kind: 'start_timer'; label: string; timer: { id: string; label: string; seconds: number } }
  | { kind: 'log_water'; label: string; ml: number }
  | { kind: 'open_vault'; label: string }
  | { kind: 'open_tools'; label: string }
  | { kind: 'copy_text'; label: string; text: string }

export type AssistantPayload = {
  text: string
  risk: { tier: RiskTier; reasons: string[] }
  actions: CompanionAction[]
  citations: Citation[]
}

export type ChatMessage =
  | { id: string; role: 'user'; createdAt: number; text: string }
  | { id: string; role: 'assistant'; createdAt: number; payload: AssistantPayload }

