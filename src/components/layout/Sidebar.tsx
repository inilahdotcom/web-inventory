import { Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"

const primaryItems = [
  ["/dashboard", "Dashboard"],
  ["/aset", "Daftar Aset", "95"],
  ["/mutasi", "Mutasi Aset"],
  ["/import", "Import Data"],
  ["/laporan", "Laporan"],
  ["/arsip", "Arsip Aset", "3"],
] as const

const adminItems = [
  ["/master-data", "Master Data"],
  ["/pengguna", "Pengguna", "7"],
  ["/audit-log", "Audit Log"],
  ["/profil", "Profil"],
] as const

export function Sidebar({
  collapsed,
  onCollapsedChange,
}: {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [showDesktopContent, setShowDesktopContent] = useState(!collapsed)

  useEffect(() => {
    if (collapsed) return
    const timer = window.setTimeout(() => setShowDesktopContent(true), 180)
    return () => window.clearTimeout(timer)
  }, [collapsed])

  const collapseSidebar = () => {
    setShowDesktopContent(false)
    onCollapsedChange(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka menu"
        className="fixed top-3 left-4 z-30 grid size-10 place-items-center rounded-full bg-[#1c1c1e] text-lg text-white lg:hidden"
      >
        ☰
      </button>
      <aside
        className={`fixed inset-y-0 left-0 z-20 hidden h-svh bg-[#1c1c1e] text-white transition-[width] duration-200 lg:flex ${collapsed ? "w-16" : "w-[232px]"}`}
      >
        {showDesktopContent ? (
          <SidebarContent onCollapse={collapseSidebar} />
        ) : (
          <button
            type="button"
            onClick={() => onCollapsedChange(false)}
            aria-label="Buka sidebar"
            className="m-3 grid size-10 place-items-center rounded-full bg-[#343438] text-lg text-white"
          >
            ☰
          </button>
        )}
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
            className="absolute inset-0 bg-black/45"
          />
          <aside className="relative h-svh w-58 bg-[#1c1c1e] text-white shadow-2xl">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  )
}

function SidebarContent({
  onNavigate,
  onCollapse,
}: {
  onNavigate?: () => void
  onCollapse?: () => void
}) {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-16 items-center px-[22px]">
        <span className="grid size-[27px] place-items-center rounded-[8px] bg-[#ffd02f] text-[11px] font-bold text-[#1c1c1e]">
          GA
        </span>
        <span className="ml-[9px]">
          <span className="block text-[12px] leading-[14px] font-bold">
            INC Inventaris
          </span>
          <span className="block text-[10px] leading-[13px] text-[#777780]">
            General Affairs
          </span>
        </span>
        <button
          type="button"
          onClick={onCollapse}
          aria-label="Ciutkan sidebar"
          className="ml-auto text-[13px] text-[#777780]"
        >
          «
        </button>
      </div>
      <nav className="flex-1 px-[14px] pt-[11px]">
        <div className="space-y-[3px]">
          {primaryItems.map(([to, label, count]) => (
            <NavItem
              key={to}
              to={to}
              label={label}
              count={count}
              onNavigate={onNavigate}
            />
          ))}
        </div>
        <p className="mt-[25px] mb-[9px] px-[9px] text-[10px] font-bold text-[#777780]">
          ADMIN
        </p>
        <div className="space-y-[3px]">
          {adminItems.map(([to, label, count]) => (
            <NavItem
              key={to}
              to={to}
              label={label}
              count={count}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>
      <div className="p-[14px]">
        <span className="flex h-[47px] items-center gap-[10px] rounded-[11px] bg-[#343438] px-[10px]">
          <span className="grid size-[27px] place-items-center rounded-full bg-[#ffc6c6] text-[9px] font-bold text-[#600000]">
            RS
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[11px] leading-[13px] font-bold">
              Rizky Saputra
            </span>
            <span className="block truncate pt-[1px] text-[10px] leading-[12px] text-[#858896]">
              Admin GA
            </span>
          </span>
        </span>
      </div>
    </div>
  )
}

function NavItem({
  to,
  label,
  count,
  onNavigate,
}: {
  to: string
  label: string
  count?: string
  onNavigate?: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className="flex h-[33px] items-center rounded-[8px] px-[9px] text-[12.5px] font-medium text-[#a5a8b5]"
      activeProps={{
        className:
          "flex h-[34px] items-center rounded-[8px] bg-[#3a3a3e] px-[9px] text-[12.5px] font-bold text-white",
      }}
    >
      {({ isActive }) => (
        <>
          <span
            className={`mr-[11px] size-[14px] rounded-[4px] border ${isActive ? "border-[#ffd02f] bg-[#ffd02f]" : "border-[#858896]"}`}
          />
          <span>{label}</span>
          {count && (
            <span className="ml-auto text-[10px] font-medium text-[#858896]">
              {count}
            </span>
          )}
        </>
      )}
    </Link>
  )
}
