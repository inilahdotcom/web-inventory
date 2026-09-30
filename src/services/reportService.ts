import { api } from "@/lib/axios"
import type { ReportData, ReportFilters, ReportTab } from "@/types/report"

const endpoints: Record<ReportTab, string> = {
  "Rekap per kategori": "/reports/category-summary",
  "Aset rusak": "/reports/damaged-assets",
  "Per lokasi & pemegang": "/reports/location-holders",
  "Mutasi aset": "/reports/movements",
}

export const reportService = {
  get: async <T extends ReportTab>(
    tab: T,
    filters: ReportFilters,
    signal?: AbortSignal
  ): Promise<ReportData[T]> => {
    const response = await api.get<{ data: ReportData[T] }>(endpoints[tab], {
      params: filters,
      signal,
    })
    return response.data.data ?? []
  },
}
