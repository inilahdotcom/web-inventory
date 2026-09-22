import { api } from '@/lib/axios'

export interface MasterDataItem {
    id: number
    name: string
}

export const masterDataService = {
    getCategories: async (): Promise<MasterDataItem[]> => {
        const res = await api.get('/masters/categories')
        return res.data?.data || []
    },
    getBrands: async (): Promise<MasterDataItem[]> => {
        const res = await api.get('/masters/brands')
        return res.data?.data || []
    },
    getLocations: async (): Promise<MasterDataItem[]> => {
        const res = await api.get('/masters/locations')
        return res.data?.data || []
    },
}
