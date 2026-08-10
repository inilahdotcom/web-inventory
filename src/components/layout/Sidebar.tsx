import { Link } from "@tanstack/react-router"

export function Sidebar() {
  return (
    <aside className="hidden min-h-svh w-[232px] shrink-0 bg-[#1c1c1e] text-white lg:block">
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
        <span className="ml-auto text-[13px] text-[#777780]">«</span>
      </div>

      <nav className="px-[14px] pt-[11px]">
        <div className="space-y-[3px]">
          <NavItem to="/dashboard" label="Dashboard" />
          <NavItem to="/aset" label="Daftar Aset" count="95" />
          <NavItem to="/mutasi" label="Mutasi Aset" />
          <NavItem to="/import" label="Import Data" />
          <NavItem to="/laporan" label="Laporan" />
          <NavItem to="/arsip" label="Arsip Aset" count="3" />
        </div>

        <p className="mt-[25px] mb-[9px] px-[9px] text-[10px] font-bold text-[#777780]">
          ADMIN
        </p>
        <div className="space-y-[3px]">
          <NavItem to="/master-data" label="Master Data" />
          <NavItem to="/pengguna" label="Pengguna" count="7" />
          <NavItem to="/audit-log" label="Audit Log" />
          <NavItem to="/profil" label="Profil" />
        </div>
      </nav>
    </aside>
  )
}

function NavItem({
  to,
  label,
  count,
  exact = false,
}: {
  to: string
  label: string
  count?: string
  exact?: boolean
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
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
