import { Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"

const primaryItems = [
  ["/", "Dashboard"],
  ["/asset", "Daftar Aset", "95"],
  ["/mutasi", "Mutasi Aset"],
  ["/import/preview", "Import Data"],
  ["/laporan", "Laporan"],
  ["/arsip", "Arsip Aset", "3"],
] as const

const adminItems = [
  ["/master-data", "Master Data"],
  ["/pengguna", "Pengguna", "7"],
  ["/audit-log", "Audit Log"],
  ["/profil", "Profil"],
] as const

export function Sidebar({ collapsed, onCollapsedChange }: { collapsed: boolean; onCollapsedChange: (collapsed: boolean) => void }) {
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
        onClick={() => setOpen(true)}
        aria-label="Buka menu"
        className="fixed z-20top-3 left-4 z-30 grid size-10 place-items-center rounded-full bg-[#1c1c1e] text-lg text-white lg:hidden"
      >
        ☰
      </button>
      <aside className={`fixed inset-y-0 left-0 z-20 hidden h-svh bg-[#1c1c1e] text-white transition-[width] duration-200 lg:flex ${collapsed ? "w-16" : "w-58"}`}>
        {showDesktopContent ? <SidebarContent onCollapse={collapseSidebar} /> : <button type="button" onClick={() => onCollapsedChange(false)} aria-label="Buka sidebar" className="m-3 grid size-10 place-items-center rounded-full bg-[#343438] text-lg text-white">☰</button>}
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
            className="absolute inset-0 bg-black/45"
          />
          <aside className="relative h-svh w-58 bg-[#1c1c1e] text-white shadow-2xl">
            <SidebarContent 
            onNavigate={() => setOpen(false)}
            onCollapse={() => setOpen(false)}
             />
          </aside>
        </div>
      )}
    </>
  )
}

function SidebarContent({ onNavigate, onCollapse }: { onNavigate?: () => void; onCollapse?: () => void }) {
  return (
    <div className="flex h-full w-full flex-col justify-between">
      <div className="space-y-6">
        <div className="flex h-16 items-center px-5.5">
          <span className="grid size-7 place-items-center rounded-lg bg-amber-400 text-xs font-bold text-neutral-900">
            GA
          </span>
          <span className="ml-2.25">
            <span className="block text-xs leading-3.5 font-bold">
              INC Inventaris
            </span>
            <span className="block text-[10px] leading-3 text-neutral-400">
              General Affairs
            </span>
          </span>
          <button type="button" onClick={onCollapse} aria-label="Ciutkan sidebar" className="ml-auto text-sm text-neutral-400 cursor-pointer">&laquo;</button>
        </div>
        <nav className="flex-1 px-3.5 pt-3">
          <div className="space-y-0.75">
            {primaryItems.map(([to, label, count]) => (
              <NavItem
                key={to}
                to={to}
                label={label}
                count={count}
                onNavigate={onNavigate}
                exact={to === "/"}
              />
            ))}
          </div>
          <p className="mt-6 mb-2.25 px-2.25 text-[10px] font-bold text-neutral-400">
            ADMIN
          </p>
          <div className="space-y-0.75">
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
      </div>

      <div className="p-3.5 border-t border-neutral-800/60">
        <span className="flex h-12 items-center gap-2.5 rounded-xl bg-neutral-900/80 p-3 border border-neutral-800">
          <span className="flex size-8 items-center justify-center rounded-lg bg-amber-400/20 text-amber-400 font-bold text-xs">
            RS
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium text-white">
              Rizky Saputra
            </span>
            <span className="block truncate pt-px text-[10px] text-neutral-400">
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
  exact = false,
}: {
  to: string
  label: string
  count?: string
  onNavigate?: () => void
  exact?: boolean
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      activeOptions={{ exact }}
      className="flex h-8 items-center rounded-lg px-2.25 text-xs font-medium text-neutral-400 transition hover:bg-neutral-800/60 hover:text-white"
      activeProps={{
        className:
          "flex h-8 items-center rounded-lg bg-neutral-800 px-2.25 text-xs font-semibold text-white",
      }}
    >
      {({ isActive }) => (
        <>
          <span
            className={`mr-2.75 size-3.5 rounded border ${isActive ? "border-amber-400 bg-amber-400" : "border-neutral-600 bg-transparent"}`}
          />
          <span className="truncate">{label}</span>
          {count && (
            <span className="ml-auto text-[10px] font-normal text-neutral-400">
              {count}
            </span>
          )}
        </>
      )}
    </Link>
  )
}