import { createFileRoute } from "@tanstack/react-router"
import { PrintLabelsView } from "@/features/assets/components/PrintLabelsView"

export const Route = createFileRoute("/_app/asset/$id/print_label")({
  component: PrintLabelsView,
})
