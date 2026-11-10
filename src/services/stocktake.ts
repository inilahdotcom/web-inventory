import { api } from "@/lib/axios"
import type {
  ApiResponse,
  BulkCheckBody,
  BulkCheckResponse,
  CheckResult,
  CloseSessionResult,
  CreateSessionBody,
  ItemStatus,
  Session,
  SessionDetail,
  SessionItemsPage,
  SessionSummary,
  StartSessionResult,
} from "@/types/stocktake"
import { MAX_BULK_CHECK } from "@/types/stocktake"

export interface ListItemsParams {
  status?: ItemStatus | ""
  locationId?: number | ""
  cursor?: string
  pageSize?: number
}

export interface BatchedCheckOutcome {
  results: CheckResult[]
  summary: Record<string, number>
  notProcessed: string[]
  error?: { message: string } | null
}

export function parseApiError(error: unknown, fallback: string): string {
  const err = error as {
    response?: {
      status?: number
      data?: {
        error?: unknown
        message?: unknown
      }
    }
    message?: string
  }

  const resData = err?.response?.data
  // Prioritaskan resData.error karena backend Go menyimpan detail string di field 'error'
  const rawError =
    typeof resData?.error === "string" && resData.error.trim()
      ? resData.error.trim()
      : typeof resData?.message === "string" && resData.message.trim()
        ? resData.message.trim()
        : ""

  if (rawError) {
    const lower = rawError.toLowerCase()
    if (lower.includes("sudah ada sesi aktif")) {
      return "Sudah ada sesi opname aktif pada lokasi yang dipilih."
    }
    if (lower.includes("cakupan lokasi tidak boleh kosong")) {
      return "Lokasi yang dipilih belum memiliki aset untuk diperiksa."
    }
    if (
      lower.includes("tidak memiliki izin") ||
      lower.includes("akses ditolak")
    ) {
      return "Akses ditolak: Anda tidak memiliki izin untuk tindakan ini."
    }
    if (lower.includes("sesi tidak ditemukan")) {
      return "Sesi stok opname tidak ditemukan."
    }
    if (lower.includes("sesi sudah ditutup")) {
      return "Sesi stok opname ini sudah ditutup."
    }
    if (lower.includes("sesi belum dimulai")) {
      return "Sesi stok opname belum dimulai."
    }
    return rawError
  }

  if (err?.message && !err.message.includes("status code")) {
    return err.message
  }

  if (err?.response?.status === 409) {
    return "Terjadi konflik: Sudah ada sesi opname aktif pada lokasi yang dipilih."
  }
  if (err?.response?.status === 403) {
    return "Akses ditolak: Anda tidak memiliki izin untuk melakukan tindakan ini."
  }
  if (err?.response?.status === 404) {
    return "Data sesi atau aset tidak ditemukan."
  }

  return fallback
}

export async function listSessions(
  pageSize?: number
): Promise<SessionSummary[]> {
  const res = await api.get<ApiResponse<SessionSummary[]>>(
    "/stocktake-sessions",
    {
      params: pageSize ? { pageSize } : undefined,
    }
  )
  return res.data?.data ?? []
}

export async function getSession(id: string): Promise<SessionDetail> {
  const res = await api.get<ApiResponse<SessionDetail>>(
    `/stocktake-sessions/${id}`
  )
  return res.data.data
}

export async function createSession(body: CreateSessionBody): Promise<Session> {
  const res = await api.post<ApiResponse<Session>>("/stocktake-sessions", body)
  return res.data.data
}

export async function startSession(id: string): Promise<StartSessionResult> {
  const res = await api.post<ApiResponse<StartSessionResult>>(
    `/stocktake-sessions/${id}/start`
  )
  return res.data.data
}

export async function closeSession(
  id: string,
  force = false
): Promise<CloseSessionResult> {
  const res = await api.post<ApiResponse<CloseSessionResult>>(
    `/stocktake-sessions/${id}/close`,
    null,
    { params: { force } }
  )
  return res.data.data
}

export async function listItems(
  id: string,
  params?: ListItemsParams
): Promise<SessionItemsPage> {
  const queryParams: Record<string, unknown> = {}
  if (params?.status) queryParams.status = params.status
  if (params?.locationId) queryParams.locationId = params.locationId
  if (params?.cursor) queryParams.cursor = params.cursor
  if (params?.pageSize) queryParams.pageSize = params.pageSize

  const res = await api.get<ApiResponse<SessionItemsPage>>(
    `/stocktake-sessions/${id}/items`,
    { params: queryParams }
  )
  return res.data?.data ?? { items: [], nextCursor: "" }
}

export async function checkInSession(
  sessionId: string,
  body: BulkCheckBody
): Promise<BulkCheckResponse> {
  const res = await api.post<ApiResponse<BulkCheckResponse>>(
    `/stocktake-sessions/${sessionId}/checks`,
    body
  )
  return res.data?.data ?? { results: [], summary: {} }
}

export async function bulkCheckInBatches(
  sessionId: string,
  body: BulkCheckBody,
  onProgress?: (done: number, total: number) => void
): Promise<BatchedCheckOutcome> {
  const allIds = body.assetIds
  const total = allIds.length
  let done = 0
  const accumulatedResults: CheckResult[] = []
  const accumulatedSummary: Record<string, number> = {}
  const notProcessed: string[] = []

  for (let i = 0; i < allIds.length; i += MAX_BULK_CHECK) {
    const batch = allIds.slice(i, i + MAX_BULK_CHECK)
    try {
      const res = await checkInSession(sessionId, {
        ...body,
        assetIds: batch,
      })
      accumulatedResults.push(...(res.results ?? []))
      for (const [k, v] of Object.entries(res.summary ?? {})) {
        accumulatedSummary[k] = (accumulatedSummary[k] ?? 0) + v
      }
      done += batch.length
      onProgress?.(done, total)
    } catch (err: unknown) {
      notProcessed.push(...allIds.slice(i))
      const message = parseApiError(err, "Gagal memproses batch aset")
      return {
        results: accumulatedResults,
        summary: accumulatedSummary,
        notProcessed,
        error: { message },
      }
    }
  }

  return {
    results: accumulatedResults,
    summary: accumulatedSummary,
    notProcessed: [],
    error: null,
  }
}
