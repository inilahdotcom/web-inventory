import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { useState } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { authStorage } from "@/lib/auth-storage"
import { useAutoLogout } from "@/hooks/useAutoLogout"
import {
  FullscreenLoadingProvider,
  useFullscreenLoading,
} from "@/hooks/useFullscreenLoading"

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (!authStorage.getAccessToken()) {
      throw redirect({ to: "/auth/login" })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  return (
    <FullscreenLoadingProvider>
      <AppLayoutInner />
    </FullscreenLoadingProvider>
  )
}

function AppLayoutInner() {
  useAutoLogout()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { isFullscreenLoading } = useFullscreenLoading()

  if (isFullscreenLoading) {
    return (
      <div className="h-svh bg-background">
        <main className="h-svh min-w-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="h-svh bg-background">
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
