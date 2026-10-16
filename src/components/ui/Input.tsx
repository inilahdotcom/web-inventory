import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          "flex h-10 w-full min-w-0 rounded-lg border bg-white px-3 py-2 text-sm text-foreground shadow-none transition outline-none",
          "border-hairline-strong focus:border-primary focus:ring-1 focus:ring-primary/30",
          // Placeholder
          "placeholder:text-muted-foreground/60",
          // Disabled
          "disabled:cursor-not-allowed disabled:border-hairline disabled:bg-muted disabled:text-muted-foreground",
          // Invalid / aria-invalid
          "aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/30",
          // Dark mode
          "dark:border-hairline dark:bg-card dark:focus:border-primary",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
