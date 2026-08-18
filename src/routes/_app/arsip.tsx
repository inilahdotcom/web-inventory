import { createFileRoute } from "@tanstack/react-router"
import { AssetArchiveView } from "@/features/assets/components/AssetArchiveView"

export const Route = createFileRoute("/_app/arsip")({
  component: AssetArchiveView,
})
