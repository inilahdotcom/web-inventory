import React from 'react'

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
  className = '',
  disabled,
  isLoading,
  ...props
}: SelectedFieldProps) {
  const errorMessage = Array.isArray(errorText) ? errorText[0] : errorText

  return (
    <div className="space-y-1 w-full">
      {label && (
        <label className="text-xs font-medium text-neutral-700 flex justify-between items-center">
          <span>{label}</span>
          {isLoading && <span className="text-[10px] text-neutral-400 animate-pulse">Memuat pilihan...</span>}
        </label>
      )}

      <select
        disabled={disabled || isLoading}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition disabled:bg-neutral-100 disabled:cursor-not-allowed ${
          errorMessage
            ? 'border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/10 text-rose-900'
            : 'border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'
        } ${className}`}
        {...props}
      >
        <option value="" disabled>
          Pilih salah satu...
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

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