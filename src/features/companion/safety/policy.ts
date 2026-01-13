import type { AssistantPayload } from '../types'
import { clinicianTemplate, crisisResources, trustedContactTemplate } from './templates'

const DISALLOWED_SELF_HARM_HINTS = [
  'how to',
  'method',
  'instructions',
  'ways to',
  'best way to',
  'painless',
  'quickly',
]

export function applySafetyPolicy(input: string, draft: AssistantPayload): AssistantPayload {
  const tier = draft.risk.tier

  if (tier === 'red') {
    const resources = crisisResources()
    const text = [
      'I’m really sorry you’re feeling this way. I can’t help with anything that could hurt you.',
      'Are you safe right now?',
      '',
      resources.map((r) => `• ${r.label}: ${r.detail}`).join('\n'),
      '',
      'If you want, copy a ready-to-send message:',
      `“${trustedContactTemplate()}”`,
      `“${clinicianTemplate()}”`,
    ].join('\n')

    return {
      text,
      risk: draft.risk,
      citations: [],
      actions: [
        { kind: 'copy_text', label: 'Copy trusted-contact message', text: trustedContactTemplate() },
        { kind: 'copy_text', label: 'Copy clinician message', text: clinicianTemplate() },
        { kind: 'open_vault', label: 'Open Vault (Trusted Contact)' },
      ],
    }
  }

  if (tier === 'orange') {
    const text = [
      'I’m here with you. I can help with small steps right now, and it may help to involve a real person.',
      'If you feel unsafe, please contact emergency services or a crisis hotline in your area.',
      '',
      'If you want, try a 60-second reset: breathe in 4, hold 4, out 6. Then tell me: are you alone right now?',
    ].join('\n')
    return { ...draft, text }
  }

  if (tier === 'yellow') {
    const text = [
      draft.text,
      '',
      'If this is overwhelming: try 5-4-3-2-1 grounding (5 things you see… 1 thing you feel).',
    ].join('\n')
    return { ...draft, text }
  }

  const lower = input.toLowerCase()
  if (DISALLOWED_SELF_HARM_HINTS.some((w) => lower.includes(w)) && draft.risk.tier !== 'green') {
    return { ...draft, text: 'I can’t help with that. If you’re feeling unsafe, please contact emergency services or a crisis hotline.' }
  }

  return draft
}
