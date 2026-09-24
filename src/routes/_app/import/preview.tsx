import { createFileRoute } from '@tanstack/react-router'
import AssetImportPage from '@/features/import/components/AssetImportPreviewPage'

export const Route = createFileRoute('/_app/import/preview')({
  component: AssetImportPage,
})