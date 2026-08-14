import { createFileRoute } from "@tanstack/react-router"
import { MasterDataView } from "@/features/master-data/components/MasterDataView"

export const Route = createFileRoute("/_app/master-data/")({
  component: MasterDataView,
})