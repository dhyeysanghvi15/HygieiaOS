import * as React from 'react'
import { cn } from '../../lib/strings'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[90px] w-full resize-none rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-sm text-white placeholder:text-white/45 shadow-glass outline-none focus-visible:ring-2 focus-visible:ring-accent/45',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

