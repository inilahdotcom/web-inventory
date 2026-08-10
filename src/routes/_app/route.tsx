import { createFileRoute, Outlet } from "@tanstack/react-router"
import { Sidebar } from "@/components/layout/Sidebar"

export const Route = createFileRoute("/_app")({
  component: AppLayout,
})

function AppLayout() {
  return (
    <div className="flex min-h-svh bg-[#f7f8fa]">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
