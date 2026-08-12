import { AssetCreateView } from '@/features/assets/components/AssetCreateView';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/asset/new')({
  component: AssetCreateView
})