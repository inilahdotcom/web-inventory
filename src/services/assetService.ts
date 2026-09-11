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

// ===== UPDATE =====
export interface UpdateAssetPayload {
  asset_code?: string
  name: string
  category_id?: number
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

// ===== GET BY ID (JSON:API style, camelCase) =====
export interface AssetPhoto {
  id: number
  url: string
  caption: string | null
  isPrimary: boolean
  sortOrder: number
}

export interface AssetData {
  code: string
  slug: string
  name: string
  categoryId: number | null
  category: string
  brandId: number | null
  brand: string | null
  quantity: number
  unit: string
  acquisitionPrice: number | null
  acquisitionDate: string | null
  locationId: number | null
  location: string
  holder: string | null
  condition: string
  status: string
  description: string | null
  photos: AssetPhoto[]
  createdAt: string | null
  updatedAt: string | null
}

export interface AssetAttr {
  id: string
  attributes: AssetData
}

export interface AssetSingle {
  data: AssetAttr
}

// ===== ARCHIVE & PERMANENT DELETE =====
export interface ArchivedAssetItem {
  id: string
  asset_code?: string
  code?: string
  name: string
  notes?: string
  reason?: string
  deleted_at?: string
  updated_by?: string
  deleted_by?: string
  has_movement_history?: boolean
}

export interface PermanentDeletePayload {
  asset_code: string
  reason: string
}

export const assetService = {
  createAsset: async (payload: CreateAssetPayload): Promise<CreateAssetResponse> => {
    const response = await api.post('/assets/create', payload)
    return response.data?.data || response.data
  },

  updateAsset: async (id: string, payload: UpdateAssetPayload): Promise<CreateAssetResponse> => {
    const response = await api.put(`/assets/update/${id}`, payload)
    return response.data?.data || response.data
  },

  getAssetById: async (id: string): Promise<AssetAttr> => {
    const response = await api.get<AssetSingle>(`/assets/${id}`)
    return response.data.data // unwrap { data: { id, attributes } }
  },

  setPrimaryPhoto: async (assetId: string, photoId: number | string): Promise<void> => {
    await api.patch(`/assets/${assetId}/photos/${photoId}/primary`)
  },

  deletePhoto: async (photoId: number | string): Promise<void> => {
    await api.delete(`/assets/photos/${photoId}`)
  },

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

  // ===== ARCHIVE & PERMANENT DELETE METHOD =====
  getArchivedAssets: async (): Promise<ArchivedAssetItem[]> => {
    const response = await api.get('/assets/archive')
    return response.data?.data || response.data || []
  },

  permanentDeleteAsset: async (id: string, payload: PermanentDeletePayload): Promise<void> => {
    await api.delete(`/assets/permanent-delete/${id}`, {
      data: payload,
    })
  },


restoreAsset: async (id: string): Promise<CreateAssetResponse> => {
  const response = await api.patch(`/assets/restore/${id}`)
  return response.data?.data || response.data
},
}