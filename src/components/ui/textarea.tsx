import * as React from "react"
import { cn } from "@/lib/utils"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border bg-white px-3 py-2 text-sm text-foreground shadow-none transition outline-none",
          "border-hairline-strong focus:border-primary focus:ring-1 focus:ring-primary/30",
          "placeholder:text-muted-foreground/60",
          "disabled:cursor-not-allowed disabled:border-hairline disabled:bg-muted disabled:text-muted-foreground",
          "aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/30",
          "dark:border-hairline dark:bg-card dark:focus:border-primary",
          "resize-none",
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
