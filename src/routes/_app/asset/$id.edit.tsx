import { AssetEditView } from '@/features/assets/components/AssetEditView';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/asset/$id/edit')({
  component: AssetEditView,
})

