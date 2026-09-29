import { createFileRoute } from '@tanstack/react-router'
import { DashboardView } from '@/features/dashboard/DashboardView' // pastikan path import sesuai lokasi filenya

export const Route = createFileRoute('/_app/')({
  component: DashboardView,
})