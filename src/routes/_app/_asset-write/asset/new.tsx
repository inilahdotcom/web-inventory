import { createFileRoute } from "@tanstack/react-router"
import { AssetCreateView } from "@/features/assets/components/AssetCreateView"

export const Route = createFileRoute("/_app/_asset-write/asset/new")({
  component: AssetCreateView,
})
