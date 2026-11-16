import { createFileRoute } from "@tanstack/react-router"
import { ASSET_WRITE_ROLES } from "@/lib/rbac"
import { createRoleGuard } from "@/lib/route-guard"
import { ReminderSettingsView } from "@/features/reminder/ReminderSettingsView"

export const Route = createFileRoute("/_app/reminder-setting")({
  beforeLoad: createRoleGuard(ASSET_WRITE_ROLES),
  component: ReminderSettingsView,
})
