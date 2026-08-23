import { createFileRoute } from "@tanstack/react-router"
import { ProfileView } from "@/features/profile/components/ProfileView"

export const Route = createFileRoute("/_app/profile")({
  component: ProfileView,
})
