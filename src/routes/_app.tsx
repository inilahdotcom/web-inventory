import { createFileRoute, Outlet } from "@tanstack/react-router"
import { Sidebar } from "@/components/layout/Sidebar"

export const Route = createFileRoute("/_app")({
  component: AppLayout,
})

function AppLayout() {
  return (
    <div className="h-svh bg-[#f7f8fa]">
      <Sidebar />
      <main className="h-svh min-w-0 overflow-y-auto lg:ml-[232px]">
        <Outlet />
      </main>
    </div>
  )
}
