import { cn } from '../../lib/strings'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-md bg-[linear-gradient(110deg,rgba(255,255,255,.06),rgba(255,255,255,.12),rgba(255,255,255,.06))] bg-[length:200%_100%]',
        className,
      )}
    />
  )
}

