import { motion } from 'framer-motion'
import { cn, truncate } from '../../lib/strings'
import type { ChatMessage } from '../../features/companion/types'

export function MessageBubble({
  message,
  whisperMode,
}: {
  message: ChatMessage
  whisperMode: boolean
}) {
  const isUser = message.role === 'user'
  const text =
    message.role === 'assistant'
      ? whisperMode
        ? truncate(message.payload.text.replace(/\s+/g, ' ').trim(), 180)
        : message.payload.text
      : message.text

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[min(560px,85%)] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-accent text-black shadow-[0_10px_30px_rgba(56,189,248,.12)]'
            : 'glass text-white/90',
        )}
      >
        {text}
      </div>
    </motion.div>
  )
}

