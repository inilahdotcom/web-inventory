import { createFileRoute } from "@tanstack/react-router"
import { AssetListView } from "@/features/assets/components/AssetListView"

export const Route = createFileRoute("/_app/aset")({
  component: AssetListView,
})
