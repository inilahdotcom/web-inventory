import { createFileRoute, Outlet } from "@tanstack/react-router"
import { Sidebar } from "@/components/layout/Sidebar"

export const Route = createFileRoute("/_app")({
  component: AppLayout,
})

function AppLayout() {
  return (
    <div className="flex min-h-svh bg-[#f0eee9]">
      <Sidebar />

      <main className="flex-1 px-10 py-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}