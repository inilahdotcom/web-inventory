import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
}

export function Input({ label, className = '', ...props }: InputProps) {
    return (
        <div className="space-y-1">
            {label && <label className="text-xs font-medium text-neutral-700">{label}</label>}
            <input 
                className={`w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 ${className}`}
                {...props}
            />
        </div>
    )
}