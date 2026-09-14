import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { CheckCircle2, X } from "lucide-react"
import { Sidebar } from "@/components/layout/Sidebar"
import { authStorage, consumeLoginSuccess } from "@/lib/auth-storage"
import { useAutoLogout } from "@/hooks/useAutoLogout"

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (!authStorage.getAccessToken()) {
      throw redirect({ to: "/login" })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  useAutoLogout()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showLoginSuccess, setShowLoginSuccess] = useState(consumeLoginSuccess)

  useEffect(() => {
    if (!showLoginSuccess) return
    const timeout = window.setTimeout(() => setShowLoginSuccess(false), 3000)
    return () => window.clearTimeout(timeout)
  }, [showLoginSuccess])

  return (
    <div className="h-svh bg-[#f7f8fa]">
      {showLoginSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 right-5 z-50 flex max-w-sm animate-in items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-800 shadow-lg duration-200 fade-in slide-in-from-top-2"
        >
          <CheckCircle2
            size={20}
            className="shrink-0 text-emerald-600"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold">Login berhasil</p>
            <p className="text-xs text-emerald-700">
              Selamat datang di INC Inventaris.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowLoginSuccess(false)}
            className="ml-2 rounded-md p-1 text-emerald-700 hover:bg-emerald-50"
            aria-label="Tutup notifikasi"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <main
        className={`h-svh min-w-0 overflow-y-auto ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-[232px]"}`}
      >
        <Outlet />
      </main>
    </div>
  )
}
