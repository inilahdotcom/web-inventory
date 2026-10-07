import { Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { profileService } from "@/services/profileService"
import { usePermission } from "@/hooks/usePermission"
import { useAutoLogout } from "@/hooks/useAutoLogout"
import { SessionExpiredModal } from "@/components/ui/SessionExpiredModa"

interface SidebarMenuItem {
  to: string
  label: string
}

export function Sidebar({
  collapsed,
  onCollapsedChange,
}: {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [showDesktopContent, setShowDesktopContent] = useState(!collapsed)

  const { isExpired, confirmLogout } = useAutoLogout()

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
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <aside
        className={`fixed inset-y-0 left-0 z-20 hidden h-svh bg-[#1c1c1e] text-white transition-[width] duration-200 lg:flex ${collapsed ? "w-16" : "w-58"}`}
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
            <SidebarContent
              onNavigate={() => setOpen(false)}
              onCollapse={() => setOpen(false)}
            />
          </aside>
        </div>
      )}

      <SessionExpiredModal isOpen={isExpired} onConfirm={confirmLogout} />
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
  const {
    canCreateEditAsset,
    canImportExcel,
    canManageAdminData,
    canDeleteRestoreAsset,
  } = usePermission()

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileService.get(),
  })

  const displayName = profile?.attributes?.name || "..."
  const roleName = profile?.attributes?.role || "..."

  const userInitials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0])
    .join("")
    .toUpperCase()

  // Menu utama dasar yang terbuka untuk semua role (Profil disertakan di sini)
  const primaryItems: SidebarMenuItem[] = [
    { to: "/", label: "Dashboard" },
    { to: "/asset", label: "Daftar Aset" },
    // Mutasi Aset hanya untuk Admin & Staff GA
    ...(canCreateEditAsset ? [{ to: "/mutasi", label: "Mutasi Aset" }] : []),
    // Import Data hanya untuk Admin & Staff GA
    ...(canImportExcel
      ? [{ to: "/import/preview", label: "Import Data" }]
      : []),
    { to: "/laporan", label: "Laporan" },
    // Arsip Aset hanya untuk Admin
    ...(canDeleteRestoreAsset || canManageAdminData
      ? [{ to: "/arsip", label: "Arsip Aset" }]
      : []),
    // Menu Profil sekarang tampil di SEMUA role
    { to: "/profile", label: "Profil" },
  ]

  // Menu khusus Admin saja
  const adminItems: SidebarMenuItem[] = [
    { to: "/master-data", label: "Master Data" },
    { to: "/user-management", label: "Pengguna" },
    { to: "/audit-log", label: "Audit Log" },
  ]

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-16 items-center px-5.5">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center transition-opacity hover:opacity-85"
        >
          <img
            src="/image/Logo.png"
            alt="Logo INC"
            className="size-10.5 rounded-xl border border-[#343438] bg-[#2a2a2e] object-contain p-1.5 shadow-sm"
          />
          <span className="ml-2.5">
            <span className="block text-xs leading-3.5 font-bold">
              INC Inventaris
            </span>
            <span className="block text-[10px] leading-3.25 text-[#777780]">
              General Affairs
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onCollapse}
          aria-label="Ciutkan sidebar"
          className="ml-auto cursor-pointer text-[13px] text-[#777780]"
        >
          «
        </button>
      </div>

      <nav className="flex-1 px-3.5 pt-2.75">
        <div className="space-y-0.75">
          {primaryItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              label={item.label}
              onNavigate={onNavigate}
              exact={item.to === "/"}
            />
          ))}
        </div>

        {/* Section ADMIN hanya ditampilkan jika role adalah Admin */}
        {canManageAdminData && (
          <>
            <p className="mt-6.25 mb-2.25 px-2.25 text-[10px] font-bold text-[#777780]">
              ADMIN
            </p>
            <div className="space-y-0.75">
              {adminItems.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </>
        )}
      </nav>

      <div className="p-3.5">
        <Link
          to="/profile"
          onClick={onNavigate}
          className="flex h-11.75 items-center gap-2.5 rounded-[11px] bg-[#343438] px-2.5 transition-colors hover:bg-[#3a3a3e]"
        >
          <span className="grid size-6.75 place-items-center rounded-full bg-[#ffc6c6] text-[9px] font-bold text-[#600000]">
            {userInitials || "..."}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[11px] leading-3.25 font-bold">
              {displayName}
            </span>
            <span className="block truncate pt-px text-[10px] leading-3 text-[#858896]">
              {roleName}
            </span>
          </span>
        </Link>
      </div>
    </div>
  )
}

function NavItem({
  to,
  label,
  onNavigate,
  exact = false,
}: {
  to: string
  label: string
  onNavigate?: () => void
  exact?: boolean
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      activeOptions={{ exact }}
      className="flex h-8.25 items-center rounded-lg px-2.25 text-[12.5px] font-medium text-[#a5a8b5]"
      activeProps={{
        className:
          "flex h-8.5 items-center rounded-lg bg-[#3a3a3e] px-2.25 text-[12.5px] font-bold text-white",
      }}
    >
      {({ isActive }) => (
        <>
          <span
            className={`mr-2.75 size-3.5 rounded border ${isActive ? "border-[#ffd02f] bg-[#ffd02f]" : "border-[#858896]"}`}
          />
          <span>{label}</span>
        </>
      )}
    </Link>
  )
}
