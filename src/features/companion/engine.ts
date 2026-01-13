import { applySafetyPolicy } from './safety/policy'
import { scoreRisk } from './safety/riskScoring'
import type { AssistantPayload, CompanionAction } from './types'
import { buildKnowledgeAnswer } from '../knowledge/answer'
import { useSettingsStore } from '../settings/store'
import { generateSmartResponse } from './smartMode'

function isSlashCommand(text: string) {
  return text.trim().startsWith('/')
}

function parseFocusCommand(text: string) {
  const m = text.trim().match(/^\/focus\s+(\d{1,3})/i)
  if (!m) return null
  const minutes = Math.max(1, Math.min(180, Number(m[1])))
  return minutes
}

export async function companionRespond(inputRaw: string): Promise<AssistantPayload> {
  const input = inputRaw.trim()
  const risk = scoreRisk(input)

  const actions: CompanionAction[] = []
  let text = ''
  let citations: AssistantPayload['citations'] = []

  // Safety policy gating happens before any tool/knowledge work.
  if (risk.tier === 'red' || risk.tier === 'orange') {
    const draft: AssistantPayload = {
      text: 'I’m here with you.',
      risk,
      actions,
      citations: [],
    }
    return applySafetyPolicy(input, draft)
  }

  if (isSlashCommand(input)) {
    const cmd = input.toLowerCase()
    if (cmd === '/hydrate') {
      text = 'Logged +250ml. Want a gentle reminder cadence (morning/day/evening)?'
      actions.push({ kind: 'log_water', label: 'Log +250ml again', ml: 250 })
    } else if (cmd.startsWith('/focus')) {
      const minutes = parseFocusCommand(input) ?? 25
      text = `Starting a focus timer for ${minutes} minutes. When it ends, take 2 minutes: stand up + sip water.`
      actions.push({
        kind: 'start_timer',
        label: `Start focus (${minutes}m)`,
        timer: { id: 'focus', label: `Focus (${minutes}m)`, seconds: minutes * 60 },
      })
    } else if (cmd === '/panic') {
      text =
        'Okay. Let’s do one small reset.\n\n1) Unclench your jaw.\n2) Exhale slowly (longer than inhale).\n3) Name 3 things you can see.\n\nWant a 60-second breathing timer?'
      actions.push({
        kind: 'start_timer',
        label: 'Start breathing (60s)',
        timer: { id: 'breath60', label: 'Breathing (60s)', seconds: 60 },
      })
    } else if (cmd === '/morning') {
      text =
        'Morning routine (2 minutes): brush (2m), water (250ml), then 10 seconds of posture reset.\n\nPick what you want to start.'
      actions.push(
        { kind: 'start_timer', label: 'Brush (2m)', timer: { id: 'brush', label: 'Brush (2 min)', seconds: 120 } },
        { kind: 'log_water', label: 'Log +250ml', ml: 250 },
      )
    } else if (cmd === '/sleep') {
      text =
        'Sleep landing (3 minutes): dim lights, 2 minutes slow breathing, then “phone face-down”. Want the breathing timer?'
      actions.push({
        kind: 'start_timer',
        label: 'Breathing (2m)',
        timer: { id: 'breath120', label: 'Breathing (2m)', seconds: 120 },
      })
    } else {
      text =
        'Commands: /morning, /sleep, /panic, /focus 25, /hydrate.\n\nYou can also just ask in plain language.'
    }
  } else {
    const lower = input.toLowerCase()
    const looksLikeHygieneQuestion =
      /\b(handwash|wash hands|brush|floss|tooth|teeth|mouthwash|sleep hygiene|sanitize)\b/i.test(input) ||
      input.includes('?')

    if (looksLikeHygieneQuestion) {
      const liveWebMode = useSettingsStore.getState().liveWebMode
      const ans = await buildKnowledgeAnswer(input, { liveWebMode })
      text = ans.text
      citations = ans.citations
    } else if (lower.includes('brush')) {
      text = 'Starting a 2-minute brush timer. Tip: gentle pressure; split your mouth into 4 quadrants.'
      actions.push({
        kind: 'start_timer',
        label: 'Start brush timer',
        timer: { id: 'brush', label: 'Brush (2 min)', seconds: 120 },
      })
    } else if (lower.includes('wash hands') || lower.includes('handwash')) {
      text = 'Starting a 20-second handwash timer. Get palms, backs of hands, between fingers, and thumbs.'
      actions.push({
        kind: 'start_timer',
        label: 'Start handwash timer',
        timer: { id: 'handwash', label: 'Handwash (20s)', seconds: 20 },
      })
    } else if (lower.includes('water') || lower.includes('hydrate')) {
      text = 'Logged +250ml. Small sips beat big swings—want a reminder strategy?'
      actions.push({ kind: 'log_water', label: 'Log +250ml', ml: 250 })
    } else {
      text =
        'Tell me what you want right now: a timer (brush/handwash/breathing/focus), a routine (morning/study/sleep), or a hygiene question.'
      actions.push({ kind: 'open_tools', label: 'Open Tools' })
    }
  }

  let draft: AssistantPayload = { text, risk, actions, citations }

  draft = applySafetyPolicy(input, draft)
  return draft
}

export async function companionRespondWithSmart(inputRaw: string): Promise<AssistantPayload> {
  const core = await companionRespond(inputRaw)
  const res = await generateSmartResponse({ user: inputRaw, riskTier: core.risk.tier })
  if (!res.ok) return core
  return applySafetyPolicy(inputRaw, { ...core, text: res.text })
}
