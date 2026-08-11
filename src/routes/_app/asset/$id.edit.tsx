import { createFileRoute } from '@tanstack/react-router'
import { AssetEditView } from '@/features/assets/components/AssetEditView'

export const Route = createFileRoute('/_app/asset/$id/edit')({
  component: AssetEditView,
})  