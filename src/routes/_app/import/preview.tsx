import { createFileRoute } from '@tanstack/react-router'
import { AssetImportPreviewView } from '@/features/import/components/AssetImportPreviewView'

export const Route = createFileRoute('/_app/import/preview')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AssetImportPreviewView />
}