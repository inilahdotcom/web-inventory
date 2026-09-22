import { api } from '@/lib/axios'
import type {
  AssetCondition,
  AssetListItem,
  AssetMasterItem,
  AssetPagination,
} from '@/types/asset'

// ===== PAYLOAD & RESPONSE INTERFACES =====
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

export interface AssetListParams {
  pageSize?: number
  sort?: string
  search?: string
  condition?: AssetCondition | string
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

export interface BulkDeletePayload {
  asset_ids: string[]
  reason: string
}

export interface BulkDeleteResponse {
  message?: string
  deleted_count?: number
}

export interface MoveAssetPayload {
  to_location_id: number
  to_holder?: string
  movement_date: string
  reason: string
}

export interface MoveAssetResponse {
  id: number
  assetId: string
  fromLocationId: number
  toLocationId: number
  fromHolder: string | null
  toHolder: string | null
  movementDate: string
  reason: string
}

// ===== COMBINED ASSET SERVICE =====
export const assetService = {
  // 1. Fetch Master Data (Brands, Categories, Locations)
  masters: async (type: string): Promise<AssetMasterItem[]> => {
    const response = await api.get(`/masters/${type}`)
    return response.data?.data || response.data || []
  },

  // 2. Fetch Paginated Asset List
  list: async (
    params: AssetListParams,
    signal?: AbortSignal
  ): Promise<AssetListResult> => {
    const response = await api.get('/assets', {
      signal,
      params: {
        pageSize: params.pageSize,
        sort: params.sort,
        search: params.search,
        condition: params.condition,
        status: params.status,
        brandId: params.brandId,
        categoryId: params.categoryId,
        locationId: params.locationId,
        purchaseDateFrom: params.purchaseDateFrom,
        purchaseDateTo: params.purchaseDateTo,
        priceMin: params.priceMin,
        priceMax: params.priceMax,
        needsAttention: params.needsAttention,
        withoutPrice: params.withoutPrice,
        withoutPhoto: params.withoutPhoto,
        duplicateCondition: params.duplicateCondition,
        cursor: params.cursor,
      },
    })
    return {
      assets: response.data?.data || [],
      pagination: response.data?.meta?.pagination || {
        pageSize: params.pageSize || 25,
        hasNextPage: false,
        nextCursor: '',
      },
    }
  },

  // 3. Create & Update
  createAsset: async (payload: CreateAssetPayload): Promise<CreateAssetResponse> => {
    const response = await api.post('/assets/create', payload)
    return response.data?.data || response.data
  },

  updateAsset: async (id: string, payload: UpdateAssetPayload): Promise<CreateAssetResponse> => {
    const response = await api.put(`/assets/update/${id}`, payload)
    return response.data?.data || response.data
  },

  // 4. Fetch Single Asset Details
  getAssetById: async (id: string): Promise<AssetAttr> => {
    const response = await api.get<AssetSingle>(`/assets/${id}`)
    return response.data.data
  },

  moveAsset: async (id: string, payload: MoveAssetPayload): Promise<MoveAssetResponse> => {
    const response = await api.post(`/assets/${id}/movements`, payload)
    return response.data?.data || response.data
  },

  // 5. Photos Management
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

  delete: async (id: string, reason: string): Promise<void> => {
    await api.delete(`/assets/delete/${id}`, { data: { reason } })
  },

  getArchivedAssets: async (): Promise<ArchivedAssetItem[]> => {
    const response = await api.get('/assets/archive')
    return response.data?.data || response.data || []
  },

  bulkDelete: async (payload: BulkDeletePayload): Promise<BulkDeleteResponse> => {
    const response = await api.post('/assets/bulk-delete', payload)
    return response.data?.data || response.data
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
