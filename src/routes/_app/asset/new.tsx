import { createFileRoute } from '@tanstack/react-router'
import { AssetCreateView } from '@/features/assets/components/AssetCreateView'

export const Route = createFileRoute('/_app/asset/new')({
  component: AssetCreateView,
})