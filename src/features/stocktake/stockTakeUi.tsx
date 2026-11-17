/* eslint-disable react-refresh/only-export-components */
import type { ItemStatus, SessionStatus } from "@/types/stocktake"
import { formatDate, formatDateOnly } from "@/lib/formatters"

const SESSION_STATUS: Record<
  SessionStatus,
  { label: string; className: string }
> = {
  draft: { label: "Draft", className: "bg-[#eef0f3] text-[#555a6a]" },
  open: { label: "Berjalan", className: "bg-[#c3faf5] text-[#187574]" },
  closed: { label: "Selesai", className: "bg-[#f0efff] text-[#4262ff]" },
  cancelled: { label: "Dibatalkan", className: "bg-rose-100 text-rose-800" },
}

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  const s = SESSION_STATUS[status] ?? SESSION_STATUS.draft
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-[11px] font-semibold ${s.className}`}
    >
      {s.label}
    </span>
  )
}

export const ITEM_STATUS_LABEL: Record<ItemStatus, string> = {
  pending: "Belum dicek",
  checked: "Sudah dicek",
  missing: "Hilang",
  unchecked: "Tidak diperiksa",
}

const ITEM_STATUS_STYLE: Record<ItemStatus, string> = {
  pending: "bg-[#eef0f3] text-[#555a6a]",
  checked: "bg-emerald-100 text-emerald-800",
  missing: "bg-rose-100 text-rose-800",
  unchecked: "bg-amber-100 text-amber-800",
}

export function ItemStatusBadge({ status }: { status: ItemStatus }) {
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold whitespace-nowrap ${ITEM_STATUS_STYLE[status] ?? ITEM_STATUS_STYLE.pending}`}
    >
      {ITEM_STATUS_LABEL[status] ?? status}
    </span>
  )
}

export function ProgressBar({
  percent,
  className = "",
}: {
  percent: number
  className?: string
}) {
  const value = Math.max(
    0,
    Math.min(100, Number.isFinite(percent) ? percent : 0)
  )
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-2 overflow-hidden rounded-full bg-[#eef0f3] ${className}`}
    >
      <div
        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

const dateOptions: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
}

const dateTimeOptions: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
}

export function formatDateID(value: string) {
  return formatDateOnly(value, dateOptions)
}

export function formatPeriod(start: string, end: string) {
  return `${formatDateID(start)} – ${formatDateID(end)}`
}

export function formatDateTimeID(value: string | null | undefined) {
  if (!value) return "—"
  return formatDate(value, dateTimeOptions, "—")
}

export function toISODate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}
