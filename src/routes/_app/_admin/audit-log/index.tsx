import { createFileRoute } from "@tanstack/react-router"
import { AuditLogView } from "@/features/audit-log/components/AuditLogView"

export const Route = createFileRoute("/_app/_admin/audit-log/")({
  component: AuditLogView,
})
