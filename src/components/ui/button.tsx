import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const baseStyle = 'w-full rounded-lg py-3 text-sm font-medium transition cursor-pointer'
  const variants = {
    primary: 'bg-neutral-900 text-white hover:bg-neutral-200',
    secondary: 'bg-neutral-1oo text-neutral-900 hover:bg-neutral-200',
  }

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}