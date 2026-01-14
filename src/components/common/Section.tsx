import { cn } from '../../lib/strings'

export function Section({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <section className={cn('py-4 sm:py-6', className)}>{children}</section>
}

