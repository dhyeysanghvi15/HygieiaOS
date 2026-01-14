import { cn } from '../../lib/strings'

export function Container({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  )
}

