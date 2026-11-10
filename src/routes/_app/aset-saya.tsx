import { createFileRoute } from "@tanstack/react-router"
import { MyAssetsView } from "@/features/assets/components/MyAssetsView"

export const Route = createFileRoute("/_app/aset-saya")({
  component: MyAssetsView,
})
