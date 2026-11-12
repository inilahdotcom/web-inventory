/**
 * TimelineItem — Item riwayat/timeline (mutasi, perubahan, dll).
 *
 * Usage:
 *   <TimelineItem
 *     title="Ruang A → Ruang B"
 *     subtitle="Pemegang: John → Doe"
 *     meta="01/01/2025 · Admin"
 *     active
 *   />
 */

import type { ReactNode } from "react"

interface TimelineItemProps {
  title: ReactNode
  subtitle?: string
  meta: string
  active?: boolean
  last?: boolean
}

export function TimelineItem({
  title,
  subtitle,
  meta,
  active = false,
  last = false,
}: TimelineItemProps) {
  return (
    <div
      className={`relative ml-1.25 border-l-2 border-[#eef0f3] pl-4 ${last ? "" : "pb-4"}`}
    >
      <span
        className={`absolute top-0.5 -left-1.5 size-2.5 rounded-full ${
          active ? "bg-[#1c1c1e]" : "bg-[#c7cad5]"
        }`}
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-semibold">{title}</span>
        {subtitle && (
          <span className="text-[12px] text-[#6b6f7e]">{subtitle}</span>
        )}
        <span className="text-[11.5px] text-[#8e91a0]">{meta}</span>
      </div>
    </div>
  )
}

/**
 * AuditItem — Item perubahan audit log.
 *
 * Usage:
 *   <AuditItem title="Kondisi diubah" detail={<span>Bagus → Rusak</span>} meta="Admin · 01/01/2025" />
 */

interface AuditItemProps {
  title: string
  detail: ReactNode
  meta: string
}

export function AuditItem({ title, detail, meta }: AuditItemProps) {
  return (
    <div className="flex flex-col gap-0.75 border-b border-[#eef0f3] pb-2.75 last:border-0 last:pb-0">
      <span className="text-[12.5px] font-semibold">{title}</span>
      <span className="wrap-break-words line-clamp-2 text-[12px] text-[#6b6f7e]">
        {detail}
      </span>
      <span className="text-[11px] text-[#8e91a0]">{meta}</span>
    </div>
  )
}
