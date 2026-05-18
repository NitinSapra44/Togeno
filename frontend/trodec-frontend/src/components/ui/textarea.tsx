import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.ComponentProps<"textarea"> {
  label?: string
  error?: string
}

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(({ className, label, error, ...props }, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          error && "border-destructive focus-visible:ring-destructive/30",
          className
        )}
        aria-invalid={!!error}
        {...props}
      />

      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
})

Textarea.displayName = "Textarea"

export { Textarea }
