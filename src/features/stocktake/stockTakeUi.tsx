/* eslint-disable react-refresh/only-export-components */
import type { ItemStatus, SessionStatus } from "@/types/stocktake"

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

// ---------------------------------------------------------------------------
// Tanggal. periodStart dan periodEnd dari backend berbentuk YYYY-MM-DD,
// diuraikan manual supaya tidak bergeser oleh zona waktu.
// ---------------------------------------------------------------------------
const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

const dateTimeFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function parseDateOnly(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

export function formatDateID(value: string) {
  const d = parseDateOnly(value)
  return d ? dateFmt.format(d) : value
}

export function formatPeriod(start: string, end: string) {
  return `${formatDateID(start)} – ${formatDateID(end)}`
}

export function formatDateTimeID(value: string | null | undefined) {
  if (!value) return "—"
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? "—" : dateTimeFmt.format(d)
}

export function toISODate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}
