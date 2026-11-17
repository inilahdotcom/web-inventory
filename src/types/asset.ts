export type AssetCondition = "Bagus" | "Rusak Ringan" | "Rusak Berat" | "Hilang"

export type AssetPhoto = {
  id: number
  url: string
  caption: string | null
  isPrimary: boolean
  sortOrder: number
}

export type AssetBaseData = {
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
  holderConfirmedAt?: string | null
  createdAt: string | null
  updatedAt: string | null
}

export type AssetListData = AssetBaseData & {
  holderConfirmedAt: string | null
  photos?: AssetPhoto[]
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

export type AssetDocumentType = "invoice" | "warranty" | "condition_evidence"

export type AssetDocument = {
  id: number
  type: AssetDocumentType
  fileName: string
  fileUrl: string
  mimeType: string
  fileSize: number
  warrantyExpiresAt: string | null
  createdAt: string
}

export type AssetData = AssetBaseData & {
  description: string | null
  photos: AssetPhoto[]
  documents: AssetDocument[]
}

export type AssetAttr = {
  id: string
  attributes: AssetData
}

export type AssetMutation = {
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

export type AssetAuditLog = {
  id: number
  actorName: string
  action: string
  fieldName: string | null
  oldValue: string | null
  newValue: string | null
  createdAt: string | null
}

export type AssetDetailAttr = {
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
