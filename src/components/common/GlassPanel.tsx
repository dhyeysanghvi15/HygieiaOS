import { cn } from '../../lib/strings'

export function GlassPanel({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn('glass rounded-2xl p-4', className)}>{children}</div>
}

