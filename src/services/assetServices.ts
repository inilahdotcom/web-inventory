import { api } from '@/lib/axios'
import type {
  AssetListItem,
  AssetMasterItem,
  AssetPagination,
} from '@/types/asset'

// ===== PHOTO & DETAIL INTERFACES =====
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

// ===== PAYLOAD INTERFACES =====
export interface CreateAssetPayload {
  asset_code?: string
  name: string
  category_id: number
  brand_id?: number | null
  quantity: number
  unit: string
  condition: string
  status: string
  purchase_price?: number
  purchase_date?: string
  location_id?: number
  holder_name?: string
  notes?: string
  photo_urls?: string[]
}

export interface UpdateAssetPayload {
  asset_code?: string
  name: string
  category_id?: number
  brand_id?: number | null
  quantity: number
  unit: string
  condition: string
  status: string
  purchase_price?: number
  purchase_date?: string
  location_id?: number
  holder_name?: string
  notes?: string
  photo_urls?: string[]
}

export interface PermanentDeletePayload {
  asset_code: string
  reason: string
}

export interface BulkDeletePayload {
  asset_ids: string[]
  reason: string
}

export interface AssetListParams {
  pageSize?: number
  sort?: string
  search?: string
  condition?: string
  status?: string
  brandId?: number
  categoryId?: number
  locationId?: number
  purchaseDateFrom?: string
  purchaseDateTo?: string
  priceMin?: number
  priceMax?: number
  needsAttention?: boolean
  withoutPrice?: boolean
  withoutPhoto?: boolean
  duplicateCondition?: boolean
  cursor?: string
}

export interface AssetListResult {
  assets: AssetListItem[]
  pagination: AssetPagination
}

// ===== ASSET SERVICE =====
export const assetService = {
  masters: async (type: string): Promise<AssetMasterItem[]> => {
    const endpoint = type.endsWith('s') ? type : `${type}s`
    const response = await api.get(`/${endpoint}`)
    return response.data?.data || response.data || []
  },

  list: async (
    params: AssetListParams,
    signal?: AbortSignal
  ): Promise<AssetListResult> => {
    const response = await api.get('/assets', {
      signal,
      params,
    })
    return {
      assets: response.data?.data || [],
      pagination: response.data?.meta?.pagination || {
        pageSize: params?.pageSize || 25,
        hasNextPage: false,
        nextCursor: '',
      },
    }
  },

  createAsset: async (payload: CreateAssetPayload): Promise<any> => {
    const response = await api.post('/assets/create', payload)
    return response.data?.data || response.data
  },

  updateAsset: async (id: string, payload: UpdateAssetPayload): Promise<any> => {
    const response = await api.put(`/assets/update/${id}`, payload)
    return response.data?.data || response.data
  },

  getAssetById: async (id: string): Promise<AssetAttr> => {
    const response = await api.get(`/assets/${id}`)
    return response.data?.data || response.data
  },

  getAssetDetail: async (id: string): Promise<AssetAttr> => {
    const response = await api.get(`/assets/${id}`)
    return response.data?.data || response.data
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
    const rawData = res.data?.data || res.data
    const urls = rawData?.photo_urls || rawData
    return Array.isArray(urls) ? urls : []
  },

  setPrimaryPhoto: async (assetId: string, photoId: number | string): Promise<void> => {
    await api.patch(`/assets/${assetId}/photos/${photoId}/primary`)
  },

  deletePhoto: async (photoId: number | string): Promise<void> => {
    await api.delete(`/assets/photos/${photoId}`)
  },

  delete: async (id: string, reason: string): Promise<void> => {
    await api.delete(`/assets/delete/${id}`, { data: { reason } })
  },

  permanentDeleteAsset: async (id: string, payload: PermanentDeletePayload): Promise<void> => {
    await api.delete(`/assets/permanent-delete/${id}`, {
      data: payload,
    })
  },

  bulkDelete: async (payload: BulkDeletePayload): Promise<any> => {
    const response = await api.post('/assets/bulk-delete', payload)
    return response.data?.data || response.data
  },

  getArchivedAssets: async (): Promise<any[]> => {
    const response = await api.get('/assets/archive')
    return response.data?.data || response.data || []
  },

  restoreAsset: async (id: string): Promise<any> => {
    const response = await api.patch(`/assets/restore/${id}`)
    return response.data?.data || response.data
  },
}