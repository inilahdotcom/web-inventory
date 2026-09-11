export type AssetCondition = "Bagus" | "Rusak Ringan" | "Rusak Berat" | "Hilang"

export type AssetListData = {
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
  condition: AssetCondition
  status: string
  createdAt: string | null
  updatedAt: string | null
}

export type AssetListItem = {
  id: string
  attributes: AssetListData
}

export type AssetPagination = {
  pageSize: number
  hasNextPage: boolean
  nextCursor: string
}

export type AssetListParams = {
  search?: string
  categoryId?: number
  brandId?: number
  locationId?: number
  condition?: AssetCondition
  status?: string
  purchaseDateFrom?: string
  purchaseDateTo?: string
  priceMin?: number
  priceMax?: number
  needsAttention?: boolean
  withoutPrice?: boolean
  withoutPhoto?: boolean
  duplicateCondition?: boolean
  sort?:
    | "code:asc"
    | "code:desc"
    | "name:asc"
    | "name:desc"
    | "purchaseDate:asc"
    | "purchaseDate:desc"
  cursor?: string
  pageSize?: number
}

export type AssetMasterItem = {
  id: number
  name: string
}
