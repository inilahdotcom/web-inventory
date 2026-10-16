import { useEffect, useState, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "../../lib/axios"
import { profileService } from "@/services/profileService"
import { assetService } from "@/services/assetServices"
import { authService } from "@/services/authServices"
import { usePermission } from "@/hooks/usePermission"
import { downloadBlob } from "@/lib/DownloadBlob"
import { DashboardStats } from "./components/DashboardStats"
import { RecentActivityTable } from "./components/RecentActivityTable"
import { CategoryBarChart } from "./components/charts/CategoryBarChart"
import { ConditionDonutChart } from "./components/charts/ConditionDonutChart"
import { BrandProgressBar } from "./components/charts/BrandProgressBar"
import { HeaderSearchDropdown } from "./components/HeaderSearchDropdown"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronDown, LogOut, User } from "lucide-react"
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
  const queryClient = useQueryClient()

  // Ambil permission untuk menyembunyikan tombol UI bagi Viewer
  const { canCreateEditAsset, canImportExcel, canExportLaporan } =
    usePermission()

  // Data dashboard
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

  // Profil user
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

  // Handler Logout Aktif
  const handleLogout = async () => {
    setIsProfileOpen(false)
    try {
      if (authService?.logout) {
        await authService.logout()
      }
    } catch (err) {
      console.error("Gagal request logout:", err)
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      sessionStorage.clear()

      queryClient.clear()
      toast.success("Berhasil keluar dari akun")
      navigate({ to: "/auth/login" })
    }
  }

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

  // Handler Export
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
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pt-6 pb-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 rounded-md" />
            <Skeleton className="h-4 w-48 rounded-md" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-2xl" />
            <Skeleton className="h-10 w-32 rounded-2xl" />
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <Alert
          variant="destructive"
          className="flex flex-col items-center gap-3 text-center"
        >
          <AlertDescription>
            Gagal memuat data dashboard dari server.
          </AlertDescription>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => refetch()}
          >
            Coba lagi
          </Button>
        </Alert>
      </div>
    )
  }

  return (
    <div className="w-full text-[#1C1C1E]">
      <header className="sticky top-0 z-10 w-full border-b border-hairline bg-white/90 px-3 py-3 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4">
          <div className="flex max-w-md flex-1 items-center pl-14 lg:pl-0">
            <HeaderSearchDropdown />
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            {canExportLaporan && (
              <div className="relative hidden sm:inline-block" ref={exportRef}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExportOpen((prev) => !prev)}
                  className="gap-1.5 rounded-full"
                >
                  <span>{exporting ? "Mengekspor..." : "Export"}</span>
                  <ChevronDown size={13} strokeWidth={2.5} />
                </Button>

                {isExportOpen && (
                  <Card className="absolute right-0 z-50 mt-2 w-44 overflow-hidden p-1.5 shadow-lg">
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
                  </Card>
                )}
              </div>
            )}

            {/* Avatar Profile */}
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
                <Card className="absolute right-0 z-50 mt-2 w-48 py-1.5 shadow-lg">
                  <div className="border-b border-neutral-100 px-4 py-2">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {displayName || "Dzaki Admin"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Akun Terverifikasi
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false)
                      navigate({ to: "/profile" })
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Detail Profile
                  </button>

                  {/* Tombol Logout Aktif */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4 text-rose-500" />
                    Logout
                  </button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 pt-6 pb-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Selamat datang, {displayName ? `Pak ${displayName}` : "Pak Dzaki"}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Data terhubung langsung dari Database Server Inventaris
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {canImportExcel && (
              <Button
                variant="outline"
                size="md"
                onClick={() =>
                  navigate({
                    to: "/import/preview",
                    search: { action: "preview" },
                  })
                }
              >
                Import Excel
              </Button>
            )}

            {canCreateEditAsset && (
              <Button
                variant="primary"
                size="md"
                onClick={() =>
                  navigate({
                    to: "/asset/new",
                    search: { action: "new" },
                  })
                }
              >
                + Tambah Aset
              </Button>
            )}
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
