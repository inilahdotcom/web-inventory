import { api } from "@/lib/axios"
import type {
  AssetListItem,
  AssetMasterItem,
  AssetPagination,
} from "@/types/asset"

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

export interface AssetMutation {
  id: number
  fromLocation: string
  toLocation: string
  fromHolder: string | null
  toHolder: string | null
  mutationDate: string
  reason: string
  actorName: string
  createdAt: string | null
}

export interface AssetAuditLog {
  id: number
  actorName: string
  action: string
  fieldName: string | null
  oldValue: string | null
  newValue: string | null
  createdAt: string | null
}

export interface AssetDetailAttr {
  id: string
  attributes: AssetData & {
    mutationHistory: AssetMutation[]
    auditLogs: AssetAuditLog[]
    completeness: {
      filled: number
      total: number
      percentage: number
      missingFields: string[]
    }
  }
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

export interface AssetWriteResult extends Record<string, unknown> {
  id?: string
  code?: string
  asset_code?: string
  warning?: string
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

export interface SplitAssetPayload {
  split_quantity: number
  condition: string
  status?: string
  notes?: string
}

export interface SplitAssetRecord {
  id: string
  asset_code: string
  name: string
  category_id: number
  brand_id: number | null
  quantity: number
  unit: string
  condition: string
  status: string
  purchase_price: number | null
  purchase_date: string | null
  location_id: number
  holder_name: string | null
  notes: string | null
  photos?: string[]
  created_at: string
  updated_at: string
}

export interface SplitAssetResponse {
  original: SplitAssetRecord
  created: SplitAssetRecord
}

// ===== ASSET SERVICE =====
export const assetService = {
  masters: async (type: string): Promise<AssetMasterItem[]> => {
    const endpoint = type.endsWith("s") ? type : `${type}s`
    const response = await api.get(`/${endpoint}`)
    return response.data?.data || response.data || []
  },

  list: async (
    params: AssetListParams,
    signal?: AbortSignal
  ): Promise<AssetListResult> => {
    const response = await api.get("/assets", {
      signal,
      params,
    })
    return {
      assets: response.data?.data || [],
      pagination: response.data?.meta?.pagination || {
        pageSize: params?.pageSize || 25,
        hasNextPage: false,
        nextCursor: "",
      },
    }
  },

  createAsset: async (
    payload: CreateAssetPayload
  ): Promise<AssetWriteResult> => {
    const response = await api.post("/assets/create", payload)
    return response.data?.data || response.data
  },

  updateAsset: async (
    id: string,
    payload: UpdateAssetPayload
  ): Promise<AssetWriteResult> => {
    const response = await api.put(`/assets/update/${id}`, payload)
    return response.data?.data || response.data
  },

  getAssetById: async (id: string): Promise<AssetAttr> => {
    const response = await api.get(`/assets/${id}`)
    return response.data?.data || response.data
  },

  getAssetDetail: async (id: string): Promise<AssetDetailAttr> => {
    const response = await api.get(`/assets/${id}`)
    return response.data?.data || response.data
  },

  moveAsset: async (
    id: string,
    payload: MoveAssetPayload
  ): Promise<MoveAssetResponse> => {
    const response = await api.post(`/assets/${id}/movements`, payload)
    return response.data?.data || response.data
  },

  splitAsset: async (
    id: string,
    payload: SplitAssetPayload
  ): Promise<SplitAssetResponse> => {
    const response = await api.post(`/assets/${id}/split`, payload)
    return response.data?.data || response.data
  },

  uploadPhoto: async (files: File[]): Promise<string[]> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("photo", file)
    })

    const res = await api.post("/assets/upload-photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    const rawData = res.data?.data || res.data
    const urls = rawData?.photo_urls || rawData
    return Array.isArray(urls) ? urls : []
  },

  setPrimaryPhoto: async (
    assetId: string,
    photoId: number | string
  ): Promise<void> => {
    await api.patch(`/assets/${assetId}/photos/${photoId}/primary`)
  },

  deletePhoto: async (photoId: number | string): Promise<void> => {
    await api.delete(`/assets/photos/${photoId}`)
  },

  delete: async (id: string, reason: string): Promise<void> => {
    await api.delete(`/assets/delete/${id}`, { data: { reason } })
  },

  permanentDeleteAsset: async (
    id: string,
    payload: PermanentDeletePayload
  ): Promise<void> => {
    await api.delete(`/assets/permanent-delete/${id}`, {
      data: payload,
    })
  },

  bulkDelete: async (payload: BulkDeletePayload): Promise<unknown> => {
    const response = await api.post("/assets/bulk-delete", payload)
    return response.data?.data || response.data
  },

  getArchivedAssets: async (): Promise<unknown[]> => {
    const response = await api.get("/assets/archive")
    return response.data?.data || response.data || []
  },

  restoreAsset: async (id: string): Promise<unknown> => {
    const response = await api.patch(`/assets/restore/${id}`)
    return response.data?.data || response.data
  },
}
