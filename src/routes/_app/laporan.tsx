import { createFileRoute } from "@tanstack/react-router"
import { AssetReportView } from "@/features/reports/components/AssetReportView"

export const Route = createFileRoute("/_app/laporan")({ component: AssetReportView })
