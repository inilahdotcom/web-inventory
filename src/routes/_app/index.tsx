import { createFileRoute } from "@tanstack/react-router"
import { DashboardView } from "@/features/dashboard/DashboardView"

export const Route = createFileRoute("/_app/")({
  component: DashboardView,
})