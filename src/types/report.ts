export type ReportTab =
  "Rekap per kategori" | "Aset rusak" | "Per lokasi & pemegang" | "Mutasi aset"

export interface ReportFilters {
  dateFrom?: string
  dateTo?: string
  locationId?: number
}

export interface CategoryReportRow {
  id: number | null
  name: string
  assetTypes: number
  units: number
  totalValue: number
  pricedAssetTypes: number
  priceCompletenessPercent: number
}

export interface DamagedAssetRow {
  code: string
  name: string
  category: string
  brand: string | null
  quantity: number
  unit: string
  condition: string
  status: string
  location: string
  holder: string | null
  purchasePrice: number | null
  purchaseDate: string | null
}

export interface LocationHolderReportRow {
  location: string
  holder: string
  assetTypes: number
  units: number
  totalValue: number
  pricedAssetTypes: number
  priceCompletenessPercent: number
}

export interface MovementReportRow {
  id: number
  assetId: string
  code: string
  name: string
  fromLocation: string
  toLocation: string
  fromHolder: string | null
  toHolder: string | null
  movementDate: string
  reason: string
  actorName: string
}

export interface ReportData {
  "Rekap per kategori": CategoryReportRow[]
  "Aset rusak": DamagedAssetRow[]
  "Per lokasi & pemegang": LocationHolderReportRow[]
  "Mutasi aset": MovementReportRow[]
}
