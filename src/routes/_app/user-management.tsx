import { createFileRoute } from "@tanstack/react-router"
import { UserManagementView } from "@/features/users/components/UserManagementView"

export const Route = createFileRoute("/_app/user-management")({
  component: UserManagementView,
})
