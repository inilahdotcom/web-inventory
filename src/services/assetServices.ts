import { api } from "@/lib/axios"
import type {
  AssetAttr,
  AssetDetailAttr,
  AssetDocument,
  AssetDocumentType,
  AssetListItem,
  AssetListParams,
  AssetMasterItem,
  AssetPagination,
} from "@/types/asset"

export type {
  AssetAttr,
  AssetAuditLog,
  AssetData,
  AssetDetailAttr,
  AssetDocument,
  AssetDocumentType,
  AssetPhoto,
} from "@/types/asset"

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

export type { AssetListParams } from "@/types/asset"

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
  fromLocation?: string
  toLocation?: string
  fromHolder: string | null
  toHolder: string | null
  movementDate: string
  reason: string
  actorName?: string
  createdAt?: string | null
  asset?: {
    id?: string
    code?: string
    name?: string
    category?: string
    quantity?: number
    unit?: string
    condition?: string
  }
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

export interface ConfirmAssetHolderPayload {
  notes: "konfirmasi pemegang"
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
    return (response.data?.data || response.data) as AssetWriteResult
  },

  updateAsset: async (
    id: string,
    payload: UpdateAssetPayload
  ): Promise<AssetWriteResult> => {
    const response = await api.put(`/assets/update/${id}`, payload)
    return (response.data?.data || response.data) as AssetWriteResult
  },

  getAssetById: async (id: string): Promise<AssetAttr> => {
    const response = await api.get(`/assets/${id}`)
    return (response.data?.data || response.data) as AssetAttr
  },

  getAssetDetail: async (id: string): Promise<AssetDetailAttr> => {
    const response = await api.get(`/assets/${id}`)
    return (response.data?.data || response.data) as AssetDetailAttr
  },

  moveAsset: async (
    id: string,
    payload: MoveAssetPayload
  ): Promise<MoveAssetResponse> => {
    const response = await api.post(`/assets/${id}/movements`, payload)
    return (response.data?.data || response.data) as MoveAssetResponse
  },

  splitAsset: async (
    id: string,
    payload: SplitAssetPayload
  ): Promise<SplitAssetResponse> => {
    const response = await api.post(`/assets/${id}/split`, payload)
    return response.data?.data || response.data
  },

  confirmHolder: async (id: string): Promise<void> => {
    const payload: ConfirmAssetHolderPayload = {
      notes: "konfirmasi pemegang",
    }
    await api.post(`/assets/${id}/checks`, payload)
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
    const rawData = (res.data?.data || res.data) as
      { photo_urls?: string[] } | string[]
    const urls = Array.isArray(rawData) ? rawData : rawData?.photo_urls
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

  uploadDocument: async (
    assetId: string,
    file: File,
    type: AssetDocumentType,
    warrantyExpiresAt?: string
  ): Promise<AssetDocument> => {
    const formData = new FormData()
    formData.append("document", file)
    formData.append("type", type)
    if (warrantyExpiresAt) {
      formData.append("warranty_expires_at", warrantyExpiresAt)
    }

    const response = await api.post(`/assets/${assetId}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return (response.data?.data || response.data) as AssetDocument
  },

  deleteDocument: async (
    assetId: string,
    documentId: number | string
  ): Promise<void> => {
    await api.delete(`/assets/${assetId}/documents/${documentId}`)
  },

  downloadDocument: async (assetId: string, documentId: number | string) => {
    return api.get<Blob>(
      `/assets/${assetId}/documents/${documentId}/download`,
      { responseType: "blob" }
    )
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

  bulkDelete: async (
    payload: BulkDeletePayload
  ): Promise<Record<string, unknown>> => {
    const response = await api.post("/assets/bulk-delete", payload)
    return (response.data?.data || response.data) as Record<string, unknown>
  },

  getArchivedAssets: async (): Promise<Record<string, unknown>[]> => {
    const response = await api.get("/assets/archive")
    return (response.data?.data || response.data || []) as Record<
      string,
      unknown
    >[]
  },

  restoreAsset: async (id: string): Promise<Record<string, unknown>> => {
    const response = await api.patch(`/assets/restore/${id}`)
    return (response.data?.data || response.data) as Record<string, unknown>
  },

  exportExcel: async (
    params: Omit<AssetListParams, "pageSize" | "cursor"> & { ids?: string[] }
  ) => {
    const response = await api.get("/assets/export/excel", {
      params,
      responseType: "blob",
    })
    return response
  },

  exportPdf: async (
    params: Omit<AssetListParams, "pageSize" | "cursor"> & {
      ids?: string[]
    } = {}
  ) => {
    const response = await api.get("/assets/export/pdf", {
      params,
      responseType: "blob",
    })
    return response
  },
}
