# Safety Policy (Mental Health)

WellnessOS uses a strict tier system to decide how it responds to mental health risk.

## Tiers

### Green
- Normal supportive coaching + practical tools (timers, routines, check-ins)

### Yellow (distress / panic)
- Avoid heavy theorizing
- Offer grounding and small steps
- Encourage reaching out if needed

### Orange (elevated risk)
- Minimal coaching
- Encourage human support
- Offer copyable “reach out” templates
- Encourage crisis resources if unsafe

### Red (self-harm / suicide intent)
Strict rules:

- Do **not** provide methods, instructions, or “optimization”
- Do **not** roleplay therapy
- Keep language short, calm, non-judgmental
- Ask about immediate safety (“Are you safe right now?”)
- Provide generic crisis resources and encourage emergency services
- Offer ready-to-send message templates (copy-only)

## Enforcement

- Risk scoring: `src/features/companion/safety/riskScoring.ts`
- Policy application: `src/features/companion/safety/policy.ts`
- Red-mode tests: `src/features/companion/safety/__tests__/safety.test.ts`

