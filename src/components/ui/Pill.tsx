/**
 * Pill — Tombol pill/chip berbentuk rounded-full.
 * Digunakan untuk filter toggle, action button, dll.
 *
 * Usage:
 *   <Pill active onClick={handleClick}>Semua</Pill>
 *   <Pill active={false} onClick={() => setFilter("needsAttention")}>Perlu Tindakan</Pill>
 */

import type { ReactNode } from "react"

interface PillProps {
  children: ReactNode
  active?: boolean
  disabled?: boolean
  className?: string
  onClick?: () => void
}

export function Pill({
  children,
  active = false,
  disabled = false,
  className = "",
  onClick,
}: PillProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex h-8.5 cursor-pointer items-center gap-1.5 rounded-full border px-3.75 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? "border-[#1c1c1e] bg-[#1c1c1e] text-white"
          : "border-[#e0e2e8] bg-white text-[#555a6a] hover:border-[#a5a8b5]"
      } ${className}`}
    >
      {children}
    </button>
  )
}

/**
 * FilterChip — Alias dari Pill, digunakan khusus untuk filter toggle (quick filter).
 * Mendukung aria-pressed untuk aksesibilitas.
 */
interface FilterChipProps {
  active: boolean
  children: ReactNode
  onClick: () => void
  className?: string
}

export function FilterChip({
  active,
  children,
  onClick,
  className = "",
}: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-8.5 cursor-pointer items-center rounded-full border px-3.75 text-xs font-semibold transition ${
        active
          ? "border-[#1c1c1e] bg-[#1c1c1e] text-white"
          : "border-[#e0e2e8] bg-white text-[#555a6a] hover:border-[#a5a8b5]"
      } ${className}`}
    >
      {children}
    </button>
  )
}
