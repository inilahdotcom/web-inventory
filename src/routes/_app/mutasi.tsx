import { createFileRoute } from "@tanstack/react-router"
import { AssetMutationView } from "@/features/assets/components/AssetMutationView"

export const Route = createFileRoute("/_app/mutasi")({
  component: AssetMutationView,
})
