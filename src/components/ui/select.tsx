import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

// ─── Select Root ──────────────────────────────────────────────────────────────

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, placeholder, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          data-slot="select"
          className={cn(
            // Base
            "flex h-10 w-full cursor-pointer appearance-none rounded-lg border bg-white px-3 py-2 pr-9 text-sm text-foreground shadow-none transition outline-none",
            // Border & focus
            "border-hairline-strong focus:border-primary focus:ring-1 focus:ring-primary/30",
            // Placeholder colour (applied via JS to :has([value='']))
            "disabled:cursor-not-allowed disabled:border-hairline disabled:bg-muted disabled:text-muted-foreground",
            // Invalid
            "aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/30",
            // Dark
            "dark:border-hairline dark:bg-card dark:focus:border-primary",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    )
  }
)
Select.displayName = "Select"

// ─── SelectItem ──────────────────────────────────────────────────────────────

export type SelectItemProps = React.OptionHTMLAttributes<HTMLOptionElement>

const SelectItem = React.forwardRef<HTMLOptionElement, SelectItemProps>(
  ({ className, children, ...props }, ref) => (
    <option ref={ref} className={cn("text-sm", className)} {...props}>
      {children}
    </option>
  )
)
SelectItem.displayName = "SelectItem"

export { Select, SelectItem }
