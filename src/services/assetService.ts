import { api } from '@/lib/axios'

// Interface Payload Request Create Asset
export interface CreateAssetPayload {
  asset_code?: string
  name: string
  category_id: number
  brand_id?: number
  quantity: number
  unit: string
  condition: string
  status: string
  purchase_price?: number
  purchase_date?: string
  location_id?: number
  holder_name?: string
  notes?: string
  photos?: string[]
}

// Interface Response dari Backend
export interface CreateAssetResponse {
  id: string
  asset_code: string
  name: string
  category_id: number
  brand_id?: number
  quantity: number
  unit: string
  condition: string
  status: string
  purchase_price?: number
  purchase_date?: string
  location_id?: number
  holder_name?: string
  notes?: string
  photos?: string[]
  created_at: string
  updated_at: string
  warning?: string
}

export const assetService = {
  createAsset: async (payload: CreateAssetPayload): Promise<CreateAssetResponse> => {
    const response = await api.post('/assets/create', payload)
    return response.data?.data || response.data
  },

  // DITARUH DI SINI (di dalam objek assetService)
  uploadPhoto: async (files: File[]): Promise<string[]> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('photo', file)
    })

    const res = await api.post('/assets/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return res.data?.data?.photo_urls || []
  },
}