import { api } from "@/lib/axios"
import type { ReportData, ReportFilters, ReportTab } from "@/types/report"

const reportBaseUrl =
  import.meta.env.VITE_REPORT_API_URL?.replace(/\/$/, "") ?? ""
const reportUrl = (path: string) => `${reportBaseUrl}${path}`

const endpoints: Record<ReportTab, string> = {
  "Rekap per kategori": "/reports/category-summary",
  "Aset rusak": "/reports/damaged-assets",
  "Per lokasi & pemegang": "/reports/location-holders",
  "Mutasi aset": "/reports/movements",
}

export const reportService = {
  locations: async (): Promise<Array<{ id: number; name: string }>> => {
    const response = await api.get<{
      data: Array<{ id: number; name: string }>
    }>(reportUrl("/masters/locations"))
    return response.data.data ?? []
  },
  get: async <T extends ReportTab>(
    tab: T,
    filters: ReportFilters,
    signal?: AbortSignal
  ): Promise<ReportData[T]> => {
    const response = await api.get<{ data: ReportData[T] }>(
      reportUrl(endpoints[tab]),
      {
        params: filters,
        signal,
      }
    )
    return response.data.data ?? []
  },
}
