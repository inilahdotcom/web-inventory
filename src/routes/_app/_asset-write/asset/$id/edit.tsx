import { createFileRoute } from "@tanstack/react-router"
import { AssetEditView } from "@/features/assets/components/AssetEditView"

export const Route = createFileRoute("/_app/_asset-write/asset/$id/edit")({
  component: AssetEditView,
})
