import * as React from "react"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  errorText?: string | string[]
  helperText?: string
  isLoading?: boolean
}

export function InputField({
  label,
  errorText,
  helperText,
  className,
  disabled,
  isLoading,
  id,
  ...props
}: InputFieldProps) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const errorMessage = Array.isArray(errorText) ? errorText[0] : errorText
  const hasError = Boolean(errorMessage)

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <Label htmlFor={inputId}>{label}</Label>
          {isLoading && (
            <span className="animate-pulse text-[10px] text-muted-foreground">
              Memuat...
            </span>
          )}
        </div>
      )}

      <Input
        id={inputId}
        disabled={disabled || isLoading}
        aria-invalid={hasError || undefined}
        aria-describedby={
          errorMessage
            ? `${inputId}-error`
            : helperText
              ? `${inputId}-helper`
              : undefined
        }
        className={className}
        {...props}
      />

      {errorMessage && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="rounded-md border border-destructive/15 bg-destructive/5 px-2 py-1.5 text-[11px] text-destructive"
        >
          {errorMessage}
        </p>
      )}

      {helperText && !errorMessage && (
        <p
          id={`${inputId}-helper`}
          className="text-[10px] text-muted-foreground"
        >
          {helperText}
        </p>
      )}
    </div>
  )
}
