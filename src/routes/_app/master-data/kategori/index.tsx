import { createFileRoute } from '@tanstack/react-router'
import { AssetCategoryView } from '@/features/master-data/components/AssetCategoryView'

export const Route = createFileRoute('/_app/master-data/kategori/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AssetCategoryView />
}