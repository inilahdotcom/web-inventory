import { createFileRoute, Outlet } from "@tanstack/react-router"
import { Sidebar } from "@/components/layout/Sidebar"

export const Route = createFileRoute("/_app")({
  component: AppLayout,
})

function AppLayout() {
  return (
    <div className="flex flex-col lg:flex-row min-h-svh bg-[#F7F8FA] w-full overflow-x-hidden">
      <Sidebar />

      <main className="flex-1 w-full min-w-0 px-4 sm:px-10 py-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}