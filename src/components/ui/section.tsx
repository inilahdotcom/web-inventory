/**
 * SectionHeading — Heading section dengan detail & action button opsional.
 * Diekstrak dari pattern yang berulang di AssetDetailView.
 *
 * Usage:
 *   <SectionHeading title="Riwayat mutasi" detail="3 catatan" />
 *   <SectionHeading
 *     title="Perubahan terakhir"
 *     action="Semua log →"
 *     onAction={() => navigate({ to: "/audit" })}
 *   />
 */

interface SectionHeadingProps {
  title: string
  detail?: string
  action?: string
  onAction?: () => void
  className?: string
}

export function SectionHeading({
  title,
  detail,
  action,
  onAction,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`flex items-baseline gap-2.25 ${className}`}>
      <h2 className="text-[16px] font-semibold">{title}</h2>
      {detail && <span className="text-[11.5px] text-[#8e91a0]">{detail}</span>}
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="ml-auto text-[12.5px] font-semibold text-[#4262ff] hover:underline"
        >
          {action}
        </button>
      )}
    </div>
  )
}

/**
 * PageBreadcrumb — Breadcrumb sederhana untuk header halaman detail.
 *
 * Usage:
 *   <PageBreadcrumb
 *     items={[{ label: "Daftar Aset", to: "/asset" }]}
 *     current="001/INC-GA/L/25"
 *     mono
 *   />
 */

import { useNavigate } from "@tanstack/react-router"

interface BreadcrumbItem {
  label: string
  to?: string
  onClick?: () => void
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[]
  current: string
  mono?: boolean
}

export function PageBreadcrumb({
  items,
  current,
  mono = false,
}: PageBreadcrumbProps) {
  const navigate = useNavigate()

  return (
    <div className="flex min-w-0 items-center gap-2 text-[13px] text-muted-foreground">
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (item.onClick) item.onClick()
              else if (item.to) void navigate({ to: item.to })
            }}
            className="shrink-0 text-muted-foreground hover:text-foreground hover:underline"
          >
            {item.label}
          </button>
          <span>/</span>
        </span>
      ))}
      <span
        className={`truncate text-foreground ${mono ? "font-mono" : "font-medium"}`}
      >
        {current}
      </span>
    </div>
  )
}
