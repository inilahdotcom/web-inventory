import { api } from "@/lib/axios"
import type {
  AssetMasterItem,
  AssetListItem,
  AssetListParams,
  AssetPagination,
} from "@/types/asset"

type AssetListApiResponse = {
  code: number
  message: string
  data: AssetListItem[]
  meta: {
    pagination: AssetPagination
  }
}

type AssetMasterApiResponse = {
  code: number
  message: string
  data: AssetMasterItem[]
}

type AssetDeleteApiResponse = {
  code: number
  message: string
}

export const assetService = {
  async list(params: AssetListParams, signal?: AbortSignal) {
    const response = await api.get<AssetListApiResponse>("/assets", {
      params,
      signal,
    })

    return {
      assets: response.data.data,
      pagination: response.data.meta.pagination,
    }
  },

  async masters(resource: "brands" | "categories" | "locations") {
    const response = await api.get<AssetMasterApiResponse>(
      `/masters/${resource}`
    )

    return response.data.data
  },

  // Perubahan pada method delete (menerima argumen reason & melempar payload data)
  async delete(id: string, reason: string = "Dihapus dari daftar aset") {
    const response = await api.delete<AssetDeleteApiResponse>(`/assets/delete/${id}`, {
      data: { reason },
    })
    return response.data
  },
}