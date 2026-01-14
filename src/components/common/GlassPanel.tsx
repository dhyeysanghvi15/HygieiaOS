import { cn } from '../../lib/strings'

export function GlassPanel({
  className,
  children,
  density = 'comfortable',
}: {
  className?: string
  children: React.ReactNode
  density?: 'comfortable' | 'compact'
}) {
  return (
    <div
      className={cn(
        'glass rounded-2xl',
        density === 'compact' ? 'p-4' : 'p-5 sm:p-6',
        className,
      )}
    >
      {children}
    </div>
  )
}
