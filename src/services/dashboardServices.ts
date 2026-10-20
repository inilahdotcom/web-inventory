import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/auth"

export interface DashboardStats {
  summary: {
    total_asset_types: number
    total_quantity: number
    total_asset_value: number
    total_damaged: number
  }
  categories: Array<{ category_name: string; total_assets: number }>
  conditions: Array<{ condition: string; total_assets: number }>
  top_brands: Array<{ brand_name: string; total_assets: number }>
  recent_activities: Array<{
    id: number
    entity_type: string
    entity_id: string
    action: string
    changed_by: string
    created_at: string
  }>
  alert_assets: Array<{
    id: string
    asset_code: string
    name: string
    condition: string
    status: string
  }>
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response =
    await api.get<ApiResponse<DashboardStats>>("/dashboard/stats")
  return response.data.data
}
