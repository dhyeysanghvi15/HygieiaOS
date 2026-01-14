import { cn } from '../../lib/strings'

export function Grid({
  children,
  className,
  gap = 'gap-4',
}: {
  children: React.ReactNode
  className?: string
  gap?: string
}) {
  return <div className={cn('grid', gap, className)}>{children}</div>
}

