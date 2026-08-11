import { createFileRoute } from "@tanstack/react-router"
import { AssetDetailView } from "@/features/assets/components/AssetDetailView"

export const Route = createFileRoute("/_app/aset/$assetId")({
  component: AssetDetailView,
})
