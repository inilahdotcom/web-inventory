import { createFileRoute } from "@tanstack/react-router"
import { AssetDetailView } from "@/features/assets/components/AssetDetailView"

export const Route = createFileRoute('/_app/asset/$id/')({
  component: AssetDetailView,
})