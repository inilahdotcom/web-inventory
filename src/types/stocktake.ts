// Kontrak API stok opname. Semua respons dibungkus ApiResponse<T>.
// Field yang bertanda [CEK] belum kulihat langsung dari respons nyata:
// samakan dengan JSON dari Postman sebelum dipakai.

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export type SessionStatus = "draft" | "open" | "closed" | "cancelled"

// unchecked = tidak pernah diperiksa, dipaksa ditutup (close?force=true).
// missing   = diperiksa dan dinyatakan hilang (kondisi "Hilang").
export type ItemStatus = "pending" | "checked" | "missing" | "unchecked"

export type CheckResultStatus =
  "ok" | "not_found" | "not_in_scope" | "already_checked" | "error" // [CEK] nilai pasti ada di konstanta Result* pada backend

export interface Session {
  id: string
  name: string
  status: SessionStatus
  locationIds: number[]
  periodStart: string // YYYY-MM-DD
  periodEnd: string // YYYY-MM-DD
  createdBy: string
  startedAt: string | null
  closedAt: string | null
  closedBy: string | null
  createdAt: string // ISO, UTC
}

// GET /stocktake-sessions
export interface SessionSummary extends Session {
  totalItems: number
  doneItems: number // checked + missing
}

export interface Progress {
  total: number
  checked: number
  pending: number
  missing: number
  unchecked: number // [CEK] tag JSON setelah entities.go diubah
  percent: number // (checked + missing) / total * 100
}

// [CEK] nama field per lokasi, lihat respons GET /stocktake-sessions/:id
export interface LocationProgress {
  locationId: number
  locationName: string
  total: number
  checked: number
  pending: number
  missing: number
  unchecked: number
}

// GET /stocktake-sessions/:id
export interface SessionDetail {
  session: Session
  progress: Progress
  byLocation: LocationProgress[]
}

// [CEK] tag JSON ItemRow, lihat respons GET .../items
export interface SessionItem {
  assetId: string
  code: string
  name: string
  locationId: number
  location: string
  condition: string
  status: ItemStatus
  checkedAt: string | null
}

// GET /stocktake-sessions/:id/items?status=&locationId=&cursor=&pageSize=
export interface SessionItemsPage {
  items: SessionItem[]
  nextCursor: string // "" jika sudah halaman terakhir
}

// POST /stocktake-sessions
export interface CreateSessionBody {
  name: string
  locationIds: number[] // minimal 1; lokasi tidak berhierarki, pilih semua yang dibutuhkan
  periodStart: string // YYYY-MM-DD
  periodEnd: string // YYYY-MM-DD, tidak boleh sebelum periodStart
}

// POST /stocktake-sessions/:id/start
export interface StartSessionResult {
  id: string
  status: "open"
  totalItems: number
}

// POST /stocktake-sessions/:id/close?force=true
export interface CloseSessionResult {
  id: string
  status: "closed"
}

// POST /stocktake-sessions/:id/checks (maks 500 aset per request)
export interface BulkCheckBody {
  assetIds: string[]
  condition: string // harus salah satu kondisi yang valid di backend, mis. "Bagus", "Hilang"
  notes?: string | null
  countedQuantity?: number | null // tidak boleh negatif
}

export interface CheckResult {
  assetId: string
  status: CheckResultStatus
}

export interface BulkCheckResponse {
  results: CheckResult[] // urutan TIDAK sama dengan request: cocokkan lewat assetId
  summary: Record<string, number> // mis. { ok: 2, not_in_scope: 1 }
}

export const MAX_BULK_CHECK = 500
export const CONDITION_LOST = "Hilang"

// Kode error 409 dibedakan lewat teks error dari backend; belum ada field code khusus.
