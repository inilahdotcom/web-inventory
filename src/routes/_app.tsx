import { createFileRoute, Outlet } from "@tanstack/react-router"
import { useState } from "react"
import { Sidebar } from "@/components/layout/Sidebar"

export const Route = createFileRoute("/_app")({
  component: AppLayout,
})

function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="h-svh bg-[#f7f8fa]">
      <Sidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      <main className={`h-svh min-w-0 overflow-y-auto ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-58"}`}>
        <Outlet />
      </main>
    </div>
  )
}
