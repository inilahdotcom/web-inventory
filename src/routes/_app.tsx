import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { useState } from "react"
import { Toaster } from "sonner"
import { Sidebar } from "@/components/layout/Sidebar"
import { authStorage } from "@/lib/auth-storage"
import { useAutoLogout } from "@/hooks/useAutoLogout"

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (!authStorage.getAccessToken()) {
      throw redirect({ to: "/auth/login" })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  useAutoLogout()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="h-svh bg-[#f7f8fa]">
      {/* Container Toast Sonner */}
      <Toaster position="top-right" richColors closeButton />

      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <main
        className={`h-svh min-w-0 overflow-y-auto ${
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-58"
        }`}
      >
        <Outlet />
      </main>
    </div>
  )
}