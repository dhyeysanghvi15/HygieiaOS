import { cn } from '../../lib/strings'

export function Stack({
  children,
  className,
  gap = 'gap-4',
}: {
  children: React.ReactNode
  className?: string
  gap?: string
}) {
  return <div className={cn('flex flex-col', gap, className)}>{children}</div>
}

