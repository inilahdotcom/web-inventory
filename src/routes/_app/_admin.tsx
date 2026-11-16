import { createFileRoute, Outlet } from "@tanstack/react-router"
import { ADMIN_ROLES } from "@/lib/rbac"
import { createRoleGuard } from "@/lib/route-guard"

export const Route = createFileRoute("/_app/_admin")({
  // Semua route khusus Admin wajib ditempatkan di folder _admin.
  beforeLoad: createRoleGuard(ADMIN_ROLES),
  component: Outlet,
})
