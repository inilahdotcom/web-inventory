import React from 'react'

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
  className = '',
  disabled,
  isLoading,
  ...props
}: InputFieldProps) {

  const errorMessage = Array.isArray(errorText) ? errorText[0] : errorText

  return (
    <div className="space-y-1 w-full">
      {label && (
        <label className="text-xs font-medium text-neutral-700 flex justify-between items-center">
          <span>{label}</span>
          {isLoading && <span className="text-[10px] text-neutral-400 animate-pulse">Memuat...</span>}
        </label>
      )}
      
      <input
        disabled={disabled || isLoading}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition disabled:bg-neutral-100 disabled:cursor-not-allowed ${
          errorMessage
            ? 'border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/10 text-rose-900 placeholder:text-rose-300'
            : 'border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'
        } ${className}`}
        {...props}
      />

      {errorMessage && (
        <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded border border-rose-100">
          {errorMessage}
        </p>
      )}

      {helperText && !errorMessage && (
        <p className="text-[10px] text-neutral-400">{helperText}</p>
      )}
    </div>
  )
}