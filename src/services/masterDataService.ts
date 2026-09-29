import { api } from '@/lib/axios'

// Tipe data lengkap untuk Master Data (Category, Brand, Location)
export interface MasterDataItem {
  id: number
  name: string
  code?: string
  description?: string
  createdAt?: string
  updatedAt?: string
  asset_count?: number 
  assetCount?: number  
}

export interface CreateMasterDataPayload {
  name: string
  code?: string
  description?: string
}

export interface UpdateMasterDataPayload {
  name?: string
  code?: string
  description?: string
}

export const masterDataService = {

  getCategories: async (): Promise<MasterDataItem[]> => {
    const res = await api.get('/categories')
    return res.data?.data || []
  },

  getCategoryById: async (id: number): Promise<MasterDataItem> => {
    const res = await api.get(`/categories/${id}`)
    return res.data?.data
  },

  createCategory: async (payload: CreateMasterDataPayload): Promise<MasterDataItem> => {
    const res = await api.post('/categories', payload)
    return res.data?.data
  },

  updateCategory: async (id: number, payload: UpdateMasterDataPayload): Promise<MasterDataItem> => {
    const res = await api.put(`/categories/${id}`, payload)
    return res.data?.data
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`)
  },

  getBrands: async (): Promise<MasterDataItem[]> => {
    const res = await api.get('/brands')
    return res.data?.data || []
  },

  getBrandById: async (id: number): Promise<MasterDataItem> => {
    const res = await api.get(`/brands/${id}`)
    return res.data?.data
  },

  createBrand: async (payload: CreateMasterDataPayload): Promise<MasterDataItem> => {
    const res = await api.post('/brands', payload)
    return res.data?.data
  },

  updateBrand: async (id: number, payload: UpdateMasterDataPayload): Promise<MasterDataItem> => {
    const res = await api.put(`/brands/${id}`, payload)
    return res.data?.data
  },

  deleteBrand: async (id: number): Promise<void> => {
    await api.delete(`/brands/${id}`)
  },

  getLocations: async (): Promise<MasterDataItem[]> => {
    const res = await api.get('/locations')
    return res.data?.data || []
  },

  getLocationById: async (id: number): Promise<MasterDataItem> => {
    const res = await api.get(`/locations/${id}`)
    return res.data?.data
  },

  createLocation: async (payload: CreateMasterDataPayload): Promise<MasterDataItem> => {
    const res = await api.post('/locations', payload)
    return res.data?.data
  },

  updateLocation: async (id: number, payload: UpdateMasterDataPayload): Promise<MasterDataItem> => {
    const res = await api.put(`/locations/${id}`, payload)
    return res.data?.data
  },

  deleteLocation: async (id: number): Promise<void> => {
    await api.delete(`/locations/${id}`)
  },
}