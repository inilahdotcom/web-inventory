import { createFileRoute, Link, Outlet } from "@tanstack/react-router"
import { Boxes, LayoutDashboard, LogOut, User } from "lucide-react"

export const Route = createFileRoute("/_app")({
  component: AppLayout,
})

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/aset", label: "Daftar Aset", icon: Boxes },
] as const

function AppLayout() {
  return (
    <div className="flex min-h-svh bg-[#f0eee9]">
      <aside className="sticky top-0 flex h-svh w-[232px] shrink-0 flex-col gap-6 bg-sidebar p-5 text-sidebar-foreground">
        <Link to="/" className="flex items-center gap-2 px-2 py-1">
          <span className="rounded-md bg-brand-yellow px-2 py-1 text-xs font-semibold text-brand-yellow-foreground">
            INC
          </span>
          <span className="text-sm font-medium">Inventaris GA</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              activeProps={{
                className:
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium bg-sidebar-accent text-sidebar-foreground",
              }}
              activeOptions={{ exact: to === "/" }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-1 border-t border-sidebar-border pt-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <User className="size-4" />
            Profil
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="size-4" />
            Keluar
          </Link>
        </div>
      </aside>

      <main className="flex-1 px-10 py-8">
        <Outlet />
      </main>
    </div>
  )
}
