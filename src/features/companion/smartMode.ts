import type { RiskTier } from './types'
import type { MLCEngine } from '@mlc-ai/web-llm'

type SmartResult = { ok: true; text: string } | { ok: false; error: string }

let enginePromise: Promise<MLCEngine> | null = null

async function getEngine() {
  if (enginePromise) return enginePromise
  enginePromise = (async () => {
    const webllm = await import('@mlc-ai/web-llm')
    const engine = await webllm.CreateMLCEngine('Llama-3.2-1B-Instruct-q4f32_1', {
      initProgressCallback: () => {},
    })
    return engine
  })()
  return enginePromise
}

export async function generateSmartResponse({
  user,
  riskTier,
}: {
  user: string
  riskTier: RiskTier
}): Promise<SmartResult> {
  if (riskTier === 'orange' || riskTier === 'red') {
    return { ok: false, error: 'Smart mode disabled for elevated risk.' }
  }
  if (!('gpu' in navigator)) return { ok: false, error: 'WebGPU not available.' }
  try {
    const engine = await getEngine()
    const resp = await engine.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are WellnessOS, an offline-first hygiene + mental health companion. Be concise, practical, and never provide instructions for self-harm or wrongdoing. Prefer timers, routines, and check-ins.',
        },
        { role: 'user', content: user },
      ],
      temperature: 0.4,
      max_tokens: 220,
    })
    const text = resp.choices?.[0]?.message?.content?.trim?.() ?? ''
    if (!text) return { ok: false, error: 'Empty output.' }
    return { ok: true, text }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Smart mode failed.'
    return { ok: false, error: msg }
  }
}
