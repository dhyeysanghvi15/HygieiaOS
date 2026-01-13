export type CrisisResource = { label: string; detail: string }

export function crisisResources(): CrisisResource[] {
  return [
    { label: 'If you are in immediate danger', detail: 'Call your local emergency number now.' },
    { label: 'United States / 988', detail: 'Call or text 988 (Suicide & Crisis Lifeline).' },
    { label: 'If outside the US', detail: 'Search “crisis hotline” + your country, or contact local emergency services.' },
  ]
}

export function trustedContactTemplate(name?: string) {
  const n = name?.trim() ? name.trim() : 'someone I trust'
  return `Hey ${n} — I’m not feeling safe right now. Could you stay with me (in person or on a call) and help me reach support?`
}

export function clinicianTemplate() {
  return `Hi — I’m having a hard time and I think I need support. Are you available today or can you help me find urgent care resources?`
}

