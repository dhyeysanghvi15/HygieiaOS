import { useEffect, useMemo, useRef } from 'react'
import type { ChatMessage, CompanionAction } from '../../features/companion/types'
import { MessageBubble } from './MessageBubble'
import { ActionCard } from './ActionCard'
import { cn } from '../../lib/strings'

export function ChatThread({
  messages,
  whisperMode,
  onRunAction,
}: {
  messages: ChatMessage[]
  whisperMode: boolean
  onRunAction: (action: CompanionAction) => void
}) {
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [messages.length])

  const lastAssistant = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) if (messages[i].role === 'assistant') return messages[i]
    return null
  }, [messages])

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[860px] space-y-4 px-3 py-4 sm:px-5 sm:py-5">
          {messages.map((m) => (
            <div key={m.id} className="space-y-3">
              <MessageBubble message={m} whisperMode={whisperMode} />

              {m.role === 'assistant' && m.payload.actions.length ? (
                <div className={cn('ml-0 grid gap-2', m.payload.actions.length > 1 && 'sm:grid-cols-2')}>
                  {m.payload.actions.map((a) => (
                    <ActionCard key={`${m.id}_${a.kind}_${a.label}`} action={a} onRun={onRunAction} />
                  ))}
                </div>
              ) : null}

              {m.role === 'assistant' && m.payload.citations.length ? (
                <div className="glass rounded-2xl p-4 text-sm text-white/75">
                  <div className="font-semibold text-white/85">Citations</div>
                  <ul className="mt-2 space-y-1.5">
                    {m.payload.citations.map((c) => (
                      <li key={c.id} className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                        <a
                          className="underline decoration-white/25 underline-offset-4 hover:decoration-white/55"
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {c.title}
                        </a>
                        <span className="shrink-0 text-xs text-white/55">{c.lastUpdated}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      {lastAssistant && lastAssistant.role === 'assistant' && lastAssistant.payload.risk.tier !== 'green' ? (
        <div className="mx-3 mb-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/75 sm:mx-5">
          Safety tier: <span className="font-semibold">{lastAssistant.payload.risk.tier.toUpperCase()}</span>
        </div>
      ) : null}
    </div>
  )
}
