import { useEffect, useState, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { api } from "../../lib/axios"
import { profileService } from "@/services/profileService"
import { assetService } from "@/services/assetServices"
import { downloadBlob } from "@/lib/DownloadBlob"
import { DashboardStats } from "./components/DashboardStats"
import { RecentActivityTable } from "./components/RecentActivityTable"
import { CategoryBarChart } from "./components/charts/CategoryBarChart"
import { ConditionDonutChart } from "./components/charts/ConditionDonutChart"
import { BrandProgressBar } from "./components/charts/BrandProgressBar"
import { HeaderSearchDropdown } from "./components/HeaderSearchDropdown"
import { ChevronDown } from "lucide-react"
import { toast } from "sonner"

interface DashboardData {
  summary: {
    total_asset_types: number
    total_quantity: number
    total_asset_value: number
    total_damaged: number
    filled_price_count?: number
  }
  categories: Array<{ category_name: string; total_assets: number }> | null
  conditions: Array<{ condition: string; total_assets: number }> | null
  top_brands: Array<{ brand_name: string; total_assets: number }> | null
  recent_activities: Array<{
    id: number
    entity_type: string
    entity_id: string
    action: string
    changed_by: string
    created_at: string
  }> | null
  alert_assets: Array<{
    id: string
    asset_code: string
    name: string
    condition: string
    status: string
  }> | null
}

type ExportType = "excel" | "pdf"

export function DashboardView() {
  const navigate = useNavigate()
  // Data dashboard (React Query: tanpa setState di dalam useEffect)
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const response = await api.get<{ data: DashboardData }>(
        "/dashboard/stats"
      )
      return response.data.data
    },
  })

  // Profil user (turunan dari query, bukan state)
  const { data: profile } = useQuery({
    queryKey: ["dashboard", "profile"],
    queryFn: () => profileService.get(),
  })

  const displayName: string = profile?.attributes?.name || ""
  const userInitials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

  // State & Ref Popover Dropdown Profile
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // State & Ref Popover Dropdown Export
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false)
  const [exporting, setExporting] = useState<ExportType | null>(null)
  const exportRef = useRef<HTMLDivElement>(null)

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false)
      }
      if (
        exportRef.current &&
        !exportRef.current.contains(event.target as Node)
      ) {
        setIsExportOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handler Export (Excel & PDF lewat blob, token ikut terkirim)
  const runExport = async (type: ExportType) => {
    setIsExportOpen(false)
    if (exporting) return

    const isExcel = type === "excel"
    setExporting(type)
    const toastId = toast.loading(
      isExcel ? "Menyiapkan file Excel..." : "Menyiapkan file PDF..."
    )

    try {
      const params = { sort: "code:asc" }
      const response = isExcel
        ? await assetService.exportExcel(params)
        : await assetService.exportPdf(params)

      downloadBlob(
        response,
        `daftar-aset-${new Date().toISOString().slice(0, 10)}.${isExcel ? "xlsx" : "pdf"}`
      )
      toast.success("Export berhasil.", { id: toastId })
    } catch {
      toast.error("Gagal mengekspor data.", { id: toastId })
    } finally {
      setExporting(null)
    }
  }

  const handleExportExcel = () => runExport("excel")
  const handleExportPdf = () => runExport("pdf")

  const categoryData = (data?.categories ?? []).map((c) => ({
    name: c.category_name,
    total: c.total_assets,
  }))

  const conditionData = (data?.conditions ?? []).map((c) => ({
    name: c.condition,
    value: c.total_assets,
    color:
      c.condition === "Bagus"
        ? "#14B8A6"
        : c.condition.includes("Ringan")
          ? "#FBBF24"
          : "#F87171",
  }))

  const topBrands = data?.top_brands ?? []
  const maxBrandCount = topBrands[0]?.total_assets || 1
  const brandData = topBrands.map((b) => ({
    brand: b.brand_name.toUpperCase(),
    count: b.total_assets,
    pct: Math.round((b.total_assets / maxBrandCount) * 100),
  }))

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-sm text-neutral-500">
        Memuat data dashboard...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-3 text-sm text-rose-500">
        <span>Gagal memuat data dashboard dari server.</span>
        <button
          type="button"
          onClick={() => refetch()}
          className="cursor-pointer rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white"
        >
          Coba lagi
        </button>
      </div>
    )
  }

  return (
    <div className="w-full text-[#1C1C1E]">
      <header className="sticky top-0 z-10 w-full border-b border-neutral-200 bg-white px-3 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4">
          <div className="flex max-w-md flex-1 items-center pl-14 lg:pl-0">
            <HeaderSearchDropdown />
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            {/* Dropdown Menu Export Header */}
            <div className="relative hidden sm:inline-block" ref={exportRef}>
              <button
                type="button"
                onClick={() => setIsExportOpen((prev) => !prev)}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-900 shadow-2xs transition hover:bg-neutral-50"
              >
                <span>{exporting ? "Mengekspor..." : "Export"}</span>
                <ChevronDown size={13} strokeWidth={2.5} />
              </button>

              {isExportOpen && (
                <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 focus:outline-none">
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    disabled={exporting !== null}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="grid size-5 place-items-center rounded bg-emerald-100 text-[10px] font-bold text-emerald-700">
                      XLS
                    </span>
                    {exporting === "excel" ? "Mengekspor..." : "Export Excel"}
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    disabled={exporting !== null}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="grid size-5 place-items-center rounded bg-rose-100 text-[10px] font-bold text-rose-700">
                      PDF
                    </span>
                    {exporting === "pdf" ? "Mengekspor..." : "Export PDF"}
                  </button>
                </div>
              )}
            </div>

            {/* Avatar Profile dengan Dropdown Menu (Detail Profile & Logout) */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600 transition select-none hover:ring-2 hover:ring-rose-300 focus:outline-none"
              >
                {userInitials || "DZ"}
              </button>

              {/* Menu Dropdown Profile */}
              {isProfileOpen && (
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-neutral-200 bg-white py-1.5 shadow-lg ring-1 ring-black/5 focus:outline-none">
                  <div className="border-b border-neutral-100 px-4 py-2">
                    <p className="truncate text-xs font-semibold text-neutral-900">
                      {displayName || "Dzaki Admin"}
                    </p>
                    <p className="text-[10px] text-neutral-500">
                      Akun Terverifikasi
                    </p>
                  </div>

                  {/* Pilihan 1: Detail Profile */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false)
                      navigate({ to: "/profile" })
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    <svg
                      className="h-4 w-4 text-neutral-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Detail Profile
                  </button>

                  {/* Pilihan 2: Logout */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false)
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    <svg
                      className="h-4 w-4 text-rose-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 pt-6 pb-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Selamat datang, {displayName ? `Pak ${displayName}` : "Pak Dzaki"}
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              Data terhubung langsung dari Database Server Inventaris
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() =>
                navigate({
                  to: "/import/preview",
                  search: { action: "preview" },
                })
              }
              className="cursor-pointer rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-900 shadow-2xs transition hover:bg-neutral-50"
            >
              Import Excel
            </button>

            <button
              onClick={() =>
                navigate({
                  to: "/asset/new",
                  search: { action: "new" },
                })
              }
              className="cursor-pointer rounded-2xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-neutral-800"
            >
              + Tambah Aset
            </button>
          </div>
        </div>

        <DashboardStats
          summary={data?.summary}
          miniStats={[
            {
              label: "Jenis aset",
              value: data?.summary?.total_asset_types ?? 0,
              subtext: "Item barang terdaftar",
            },
            {
              label: "Total unit",
              value: data?.summary?.total_quantity ?? 0,
              subtext: "Total unit fisik",
            },
            {
              label: "Aset Rusak",
              value: data?.summary?.total_damaged ?? 0,
              subtext: "Unit butuh perbaikan",
            },
          ]}
          alertAssets={data?.alert_assets ?? []}
          onCompletePricesClick={() =>
            navigate({
              to: "/asset",
              search: { filter: "missing_price" },
            })
          }
          onActionClick={(code) =>
            navigate({
              to: "/asset",
              search: { highlight: code },
            })
          }
        />

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
          <CategoryBarChart data={categoryData} />
          <ConditionDonutChart data={conditionData} />
          <BrandProgressBar data={brandData} />
        </div>

        <RecentActivityTable data={data?.recent_activities ?? []} />
      </main>
    </div>
  )
}
