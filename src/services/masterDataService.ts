import { api } from '@/lib/axios'

export interface MasterDataItem {
    id: number
    name: string
}

export const masterDataService = {
    getCategories: async (): Promise<MasterDataItem[]> => {
        const res = await api.get('/categories')
        return res.data?.data || []
    },
    getBrands: async (): Promise<MasterDataItem[]> => {
        const res = await api.get('/brands')
        return res.data?.data || []
    },
    getLocations: async (): Promise<MasterDataItem[]> => {
        const res = await api.get('/locations')
        return res.data?.data || []
    },
}