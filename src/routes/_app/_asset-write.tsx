import { createFileRoute, Outlet } from "@tanstack/react-router"
import { ASSET_WRITE_ROLES } from "@/lib/rbac"
import { createRoleGuard } from "@/lib/route-guard"

export const Route = createFileRoute("/_app/_asset-write")({
  // Route yang mengubah data aset diwariskan ke Admin dan Staff GA.
  beforeLoad: createRoleGuard(ASSET_WRITE_ROLES),
  component: Outlet,
})
