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
          'max-w-[min(720px,92%)] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-6 sm:max-w-[min(720px,78%)] sm:px-5 sm:py-4 sm:leading-7',
          isUser
            ? 'bg-accent text-black shadow-[0_10px_30px_rgba(56,189,248,.10)]'
            : 'glass text-white/90',
        )}
      >
        {text}
      </div>
    </motion.div>
  )
}
