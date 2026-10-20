import * as React from "react"
import { Select, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface SelectedFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { label: string; value: string }[]
  errorText?: string | string[]
  helperText?: string
  isLoading?: boolean
}

export function SelectedField({
  label,
  options,
  errorText,
  helperText,
  className,
  disabled,
  isLoading,
  id,
  ...props
}: SelectedFieldProps) {
  const generatedId = React.useId()
  const selectId = id ?? generatedId
  const errorMessage = Array.isArray(errorText) ? errorText[0] : errorText
  const hasError = Boolean(errorMessage)

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <Label htmlFor={selectId}>{label}</Label>
          {isLoading && (
            <span className="animate-pulse text-[10px] text-muted-foreground">
              Memuat pilihan...
            </span>
          )}
        </div>
      )}

      <Select
        id={selectId}
        disabled={disabled || isLoading}
        aria-invalid={hasError || undefined}
        aria-describedby={
          errorMessage
            ? `${selectId}-error`
            : helperText
              ? `${selectId}-helper`
              : undefined
        }
        placeholder="Pilih salah satu..."
        className={className}
        {...props}
      >
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </Select>

      {errorMessage && (
        <p
          id={`${selectId}-error`}
          role="alert"
          className="rounded-md border border-destructive/15 bg-destructive/5 px-2 py-1.5 text-[11px] text-destructive"
        >
          {errorMessage}
        </p>
      )}

      {helperText && !errorMessage && (
        <p
          id={`${selectId}-helper`}
          className="text-[10px] text-muted-foreground"
        >
          {helperText}
        </p>
      )}
    </div>
  )
}
