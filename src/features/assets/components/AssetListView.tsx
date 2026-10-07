import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronDown, LayoutGrid, MoreVertical, Table2, X } from "lucide-react"
import { assetService } from "@/services/assetServices"
import { profileService } from "@/services/profileService"
import { toast } from "sonner"
import { downloadBlob } from "@/lib/DownloadBlob"
import type {
  AssetCondition,
  AssetListItem,
  AssetPagination,
} from "@/types/asset"

const SAVED_VIEW_KEY = "asset_list_saved_view"
const PAGE_SIZE_KEY = "asset_list_page_size"

type SavedView = {
  query: string
  condition: AssetCondition | ""
  status: string
  brandId: number | undefined
  categoryId: number | undefined
  locationId: number | undefined
  purchaseDateFrom: string
  purchaseDateTo: string
  priceMin: string
  priceMax: string
  quickFilter: QuickFilter
  sort: SortOption
  pageSize?: number
}

const formatNumber = new Intl.NumberFormat("id-ID")
const rupiahInput = (value: string) =>
  value ? `Rp. ${formatNumber.format(Number(value))}` : ""
const numericInput = (value: string) => value.replace(/\D/g, "")

type Asset = {
  id: string
  slug: string
  code: string
  name: string
  detail: string
  category: string
  brand: string
  quantity: number
  unit: string
  condition: AssetCondition
  status: string
  location: string
  price?: string
  priceValue: number
  attention?: boolean
  hasPhoto: boolean
}

type QuickFilter =
  "" | "needsAttention" | "withoutPrice" | "withoutPhoto" | "duplicateCondition"

type SortOption = "code:asc" | "code:desc" | "name:asc" | "name:desc"

// Style warna badge kondisi aset (Kondisi Rusak Berat TETAP MERAH)
const conditionClass: Record<AssetCondition, string> = {
  Bagus: "bg-[#c3faf5] text-[#187574]",
  "Rusak Ringan": "bg-[#fff8e0] text-[#746019]",
  "Rusak Berat": "bg-[#ffc6c6] text-[#600000]",
  Hilang: "bg-[#e0e2e8] text-[#555a6a]",
}

const emptyPagination: AssetPagination = {
  pageSize: 25,
  hasNextPage: false,
  nextCursor: "",
}

const conditionOptions: AssetCondition[] = [
  "Bagus",
  "Rusak Ringan",
  "Rusak Berat",
  "Hilang",
]
const statusOptions = [
  "Digunakan",
  "Tersedia",
  "Diperbaiki",
  "Dihapuskan",
  "Tidak Tersedia",
]

type AssetListApiAttributes = Partial<AssetListItem["attributes"]> & {
  id?: string
  assetCode?: string
  asset_code?: string
  assetName?: string
  asset_name?: string
  categoryName?: string
  category_name?: string
  brandName?: string
  brand_name?: string
  locationName?: string
  location_name?: string
  holderName?: string
  holder_name?: string
  purchasePrice?: number
  price?: number
  qty?: number
}

function apiErrorMessage(error: unknown) {
  const value = error as {
    message?: string
    response?: { data?: { message?: string; error?: string } }
  }
  return (
    value.response?.data?.message ||
    value.response?.data?.error ||
    value.message
  )
}

function toAsset(item: AssetListItem): Asset {
  const attr = (item.attributes || item) as AssetListApiAttributes

  const priceValue = Number(
    attr.acquisitionPrice ?? attr.purchasePrice ?? attr.price ?? 0
  )
  const hasPhoto = Array.isArray(attr.photos) && attr.photos.length > 0
  const holderName = String(
    attr.holder || attr.holderName || attr.holder_name || ""
  )

  return {
    id: String(item.id || attr.id || ""),
    slug: String(attr.slug || attr.code || attr.assetCode || ""),
    code: String(attr.assetCode || attr.code || attr.asset_code || "—"),
    name: String(
      attr.name || attr.assetName || attr.asset_name || "Tanpa Nama"
    ),
    detail: holderName,
    category: String(
      attr.categoryName || attr.category || attr.category_name || "—"
    ),
    brand: String(attr.brandName || attr.brand || attr.brand_name || "—"),
    location: String(
      attr.locationName || attr.location || attr.location_name || "—"
    ),
    quantity: Number(attr.quantity ?? attr.qty ?? 1),
    unit: String(attr.unit || "Unit"),
    condition: (attr.condition as AssetCondition) || "Bagus",
    status: String(attr.status || "Tersedia"),
    price:
      priceValue > 0 ? `Rp. ${formatNumber.format(priceValue)}` : undefined,
    priceValue,
    attention: ((attr.condition as AssetCondition) || "Bagus") !== "Bagus",
    hasPhoto,
  }
}

const tableColumns =
  "grid-cols-[30px_112px_minmax(150px,1.4fr)_minmax(84px,0.8fr)_minmax(64px,0.65fr)_38px_44px_92px_minmax(76px,0.75fr)_112px_32px]"

export function AssetListView() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Profil user (query key sama dengan dashboard, jadi cache dipakai bersama)
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

  // Popover dropdown profile
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const searchParam = useSearch({ strict: false }) as {
    search?: string
    filter?: string
    highlight?: string
    latest?: string | number
    newCount?: string | number
  }

  const [highlightedCodes, setHighlightedCodes] = useState<string[]>([])
  const [highlightedCount, setHighlightedCount] = useState<number>(0)

  const getInitialSavedView = (): SavedView | null => {
    try {
      const saved = localStorage.getItem(SAVED_VIEW_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  }

  const getInitialPageSize = (): number => {
    try {
      const savedSize = localStorage.getItem(PAGE_SIZE_KEY)
      if (savedSize) return Number(savedSize)

      const savedView = getInitialSavedView()
      if (savedView?.pageSize) return savedView.pageSize
    } catch {
      // fallback
    }
    return 25
  }

  const initialSavedView = getInitialSavedView()
  const showLatestSplit = String(searchParam?.latest ?? "") === "1"

  const [query, setQuery] = useState(
    showLatestSplit ? "" : initialSavedView?.query || ""
  )
  const [debouncedQuery, setDebouncedQuery] = useState(
    showLatestSplit ? "" : initialSavedView?.query || ""
  )
  const [condition, setCondition] = useState<AssetCondition | "">(
    showLatestSplit ? "" : initialSavedView?.condition || ""
  )
  const [status, setStatus] = useState(
    showLatestSplit ? "" : initialSavedView?.status || ""
  )
  const [brandId, setBrandId] = useState<number | undefined>(
    showLatestSplit ? undefined : initialSavedView?.brandId
  )
  const [categoryId, setCategoryId] = useState<number | undefined>(
    showLatestSplit ? undefined : initialSavedView?.categoryId
  )
  const [locationId, setLocationId] = useState<number | undefined>(
    showLatestSplit ? undefined : initialSavedView?.locationId
  )
  const [purchaseDateFrom, setPurchaseDateFrom] = useState(
    showLatestSplit ? "" : initialSavedView?.purchaseDateFrom || ""
  )
  const [purchaseDateTo, setPurchaseDateTo] = useState(
    showLatestSplit ? "" : initialSavedView?.purchaseDateTo || ""
  )
  const [priceMin, setPriceMin] = useState(
    showLatestSplit ? "" : initialSavedView?.priceMin || ""
  )
  const [priceMax, setPriceMax] = useState(
    showLatestSplit ? "" : initialSavedView?.priceMax || ""
  )
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(
    showLatestSplit ? "" : initialSavedView?.quickFilter || ""
  )
  const [sort, setSort] = useState<SortOption>(
    showLatestSplit ? "code:desc" : initialSavedView?.sort || "code:asc"
  )

  const [pageSize, setPageSize] = useState<number>(getInitialPageSize)
  const [hasSavedPreset, setHasSavedPreset] = useState<boolean>(
    Boolean(initialSavedView)
  )

  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [cursor, setCursor] = useState("")
  const [cursorHistory, setCursorHistory] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"auto" | "table" | "card">("auto")
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 767px)").matches
  )
  const [selectedCodes, setSelectedCodes] = useState(() => new Set<string>())
  const [notice, setNotice] = useState("")
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const queryFromUrl = searchParam?.search || urlParams.get("search") || ""
    const filterFromUrl = searchParam?.filter || urlParams.get("filter") || ""

    if (queryFromUrl) {
      queueMicrotask(() => {
        setQuery(queryFromUrl)
        setDebouncedQuery(queryFromUrl)
      })
    }

    if (filterFromUrl === "missing_price") {
      queueMicrotask(() => {
        setQuickFilter("withoutPrice")
      })
    }
  }, [searchParam?.search, searchParam?.filter])

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = query.trim()
      if (trimmed.length === 0 || trimmed.length >= 2) {
        setDebouncedQuery(trimmed)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    localStorage.setItem(PAGE_SIZE_KEY, String(newSize))
    resetPagination()
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)")
    const syncViewport = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mediaQuery.addEventListener("change", syncViewport)
    return () => mediaQuery.removeEventListener("change", syncViewport)
  }, [])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const rawHighlight = searchParam?.highlight || urlParams.get("highlight")
    const rawCount = searchParam?.newCount || urlParams.get("newCount")

    if (rawHighlight) {
      const codes = decodeURIComponent(rawHighlight)
        .split(",")
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean)

      queueMicrotask(() => {
        setHighlightedCodes(codes)
      })
    }

    if (rawCount) {
      queueMicrotask(() => {
        setHighlightedCount(Number(rawCount))
      })
    }

    if (rawHighlight || rawCount) {
      const timer = setTimeout(() => {
        setHighlightedCodes([])
        setHighlightedCount(0)

        navigate({
          to: "/asset",
          search: (prev: Record<string, unknown>) => {
            const next = { ...prev }
            delete next.highlight
            delete next.newCount
            return next
          },
          replace: true,
        })
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [searchParam?.highlight, searchParam?.newCount, navigate])

  const { data: brandData = [] } = useQuery({
    queryKey: ["masters", "brands"],
    queryFn: () => assetService.masters("brands"),
  })

  const { data: categoryData = [] } = useQuery({
    queryKey: ["masters", "categories"],
    queryFn: () => assetService.masters("categories"),
  })

  const { data: locationData = [] } = useQuery({
    queryKey: ["masters", "locations"],
    queryFn: () => assetService.masters("locations"),
  })

  // Ambil Data Utama Aset menggunakan React Query
  const {
    data: assetData,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: [
      "assets",
      {
        pageSize,
        sort,
        debouncedQuery,
        condition,
        status,
        brandId,
        categoryId,
        locationId,
        purchaseDateFrom,
        purchaseDateTo,
        priceMin,
        priceMax,
        quickFilter,
        cursor,
        searchNewCount: searchParam?.newCount,
      },
    ],
    queryFn: async () => {
      const result = await assetService.list({
        pageSize,
        sort,
        search: debouncedQuery || undefined,
        condition: condition || undefined,
        status: status || undefined,
        brandId,
        categoryId,
        locationId,
        purchaseDateFrom: purchaseDateFrom || undefined,
        purchaseDateTo: purchaseDateTo || undefined,
        priceMin: priceMin ? Number(priceMin) : undefined,
        priceMax: priceMax ? Number(priceMax) : undefined,
        needsAttention: quickFilter === "needsAttention" || undefined,
        cursor: cursor || undefined,
      })
      return result
    },
  })

  const assets = useMemo(
    () => (assetData?.assets ? assetData.assets.map(toAsset) : []),
    [assetData]
  )
  const pagination = assetData?.pagination || emptyPagination
  const errorMessage = error
    ? "Daftar aset gagal dimuat. Periksa koneksi lalu coba lagi."
    : ""

  const isHighlighted = (code: string) => {
    return Boolean(code && highlightedCodes.includes(code.toLowerCase()))
  }

  const isNewItem = (index: number, code: string, totalVisible: number) => {
    if (code && highlightedCodes.includes(code.toLowerCase())) return true

    if (highlightedCount > 0) {
      const startIndex = Math.max(0, totalVisible - highlightedCount)
      return index >= startIndex
    }
    return false
  }

  const visibleAssets = useMemo(() => {
    const minimum = priceMin ? Number(priceMin) : undefined
    const maximum = priceMax ? Number(priceMax) : undefined

    return assets.filter((asset) => {
      const matchMin = minimum === undefined || asset.priceValue >= minimum
      const matchMax = maximum === undefined || asset.priceValue <= maximum
      if (!matchMin || !matchMax) return false

      if (quickFilter === "needsAttention") {
        return asset.attention || asset.condition !== "Bagus"
      }

      if (quickFilter === "withoutPrice") {
        return (
          !asset.priceValue ||
          asset.priceValue === 0 ||
          asset.price === undefined ||
          asset.price === "Belum diisi"
        )
      }

      if (quickFilter === "withoutPhoto") {
        return !asset.hasPhoto
      }

      if (quickFilter === "duplicateCondition") {
        return assets.some(
          (other) =>
            other.code !== asset.code &&
            other.condition === asset.condition &&
            other.name === asset.name
        )
      }

      return true
    })
  }, [assets, priceMax, priceMin, quickFilter])

  const pageSummary = useMemo(
    () => ({
      units: visibleAssets.reduce((sum, asset) => sum + asset.quantity, 0),
      value: visibleAssets.reduce(
        (sum, asset) => sum + asset.priceValue * asset.quantity,
        0
      ),
    }),
    [visibleAssets]
  )

  const selectedSummary = useMemo(() => {
    const selected = assets.filter((asset) => selectedCodes.has(asset.code))
    return {
      units: selected.reduce((sum, asset) => sum + asset.quantity, 0),
      value: selected.reduce(
        (sum, asset) => sum + asset.priceValue * asset.quantity,
        0
      ),
    }
  }, [assets, selectedCodes])

  const toggleSelection = (code: string) =>
    setSelectedCodes((current) => {
      const next = new Set(current)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })

  const allSelected =
    visibleAssets.length > 0 && selectedCodes.size === visibleAssets.length

  const selectAll = () =>
    setSelectedCodes(
      allSelected
        ? new Set()
        : new Set(visibleAssets.map((asset) => asset.code))
    )

  const buildExportParams = () => ({
    sort,
    search: debouncedQuery || undefined,
    condition: condition || undefined,
    status: status || undefined,
    brandId,
    categoryId,
    locationId,
    purchaseDateFrom: purchaseDateFrom || undefined,
    purchaseDateTo: purchaseDateTo || undefined,
    priceMin: priceMin ? Number(priceMin) : undefined,
    priceMax: priceMax ? Number(priceMax) : undefined,
    needsAttention: quickFilter === "needsAttention" || undefined,
    withoutPrice: quickFilter === "withoutPrice" || undefined,
    withoutPhoto: quickFilter === "withoutPhoto" || undefined,
    duplicateCondition: quickFilter === "duplicateCondition" || undefined,
  })

  const runExport = async (name: string, extra: { ids?: string[] } = {}) => {
    if (exporting) return
    setExporting(true)
    const toastId = toast.loading("Menyiapkan file Excel...")
    try {
      const response = await assetService.exportExcel({
        ...buildExportParams(),
        ...extra,
      })
      downloadBlob(
        response,
        `${name}-${new Date().toISOString().slice(0, 10)}.xlsx`
      )
      toast.success("Export berhasil.", { id: toastId })
    } catch {
      toast.error("Gagal mengekspor data.", { id: toastId })
    } finally {
      setExporting(false)
    }
  }

  const handleExportAll = () => runExport("daftar-aset")

  const handleExportSelected = () => {
    const ids = assets
      .filter((asset) => selectedCodes.has(asset.code))
      .map((asset) => asset.id)
      .filter(Boolean)

    if (ids.length === 0) {
      toast.error("Tidak ada aset terpilih.")
      return
    }
    runExport("aset-terpilih", { ids })
  }

  const bulkActions = [
    {
      label: "Ubah kondisi",
      action: () =>
        setNotice("Ubah kondisi siap diproses untuk aset terpilih."),
    },
    {
      label: "Mutasi",
      action: () => setNotice("Mutasi siap diproses untuk aset terpilih."),
    },
    {
      label: exporting ? "Mengekspor..." : "Export terpilih",
      action: handleExportSelected,
    },
  ]

  const handleBulkDelete = async () => {
    const idsToDelete = assets
      .filter((asset) => selectedCodes.has(asset.code))
      .map((asset) => asset.id)
      .filter(Boolean)

    if (idsToDelete.length === 0) {
      toast.error("Tidak ada aset valid yang bisa dihapus.")
      return
    }

    const reason = window.prompt(
      `${idsToDelete.length} aset akan dipindahkan ke Arsip. Masukkan alasan:`,
      "Dihapus massal dari daftar aset"
    )
    if (reason === null || reason.trim() === "") return

    try {
      await assetService.bulkDelete({
        asset_ids: idsToDelete,
        reason,
      })
      toast.success(`${idsToDelete.length} aset berhasil dipindahkan ke arsip.`)

      setSelectedCodes(new Set())
      queryClient.invalidateQueries({ queryKey: ["assets"] })
    } catch (error: unknown) {
      toast.error(
        `Gagal mengarsipkan aset: ${apiErrorMessage(error) || "Kesalahan server"}`
      )
    }
  }

  const resetPagination = () => {
    setCursor("")
    setCursorHistory([])
  }

  const resetFilters = () => {
    localStorage.removeItem(SAVED_VIEW_KEY)
    setHasSavedPreset(false)

    setQuery("")
    setDebouncedQuery("")
    setCondition("")
    setStatus("")
    setBrandId(undefined)
    setCategoryId(undefined)
    setLocationId(undefined)
    setPurchaseDateFrom("")
    setPurchaseDateTo("")
    setPriceMin("")
    setPriceMax("")
    setQuickFilter("")
    setSort("code:asc")
    setOpenFilter(null)
    resetPagination()

    navigate({ to: "/asset" })
  }

  const handleSaveView = () => {
    const currentView: SavedView = {
      query,
      condition,
      status,
      brandId,
      categoryId,
      locationId,
      purchaseDateFrom,
      purchaseDateTo,
      priceMin,
      priceMax,
      quickFilter,
      sort,
      pageSize,
    }

    localStorage.setItem(SAVED_VIEW_KEY, JSON.stringify(currentView))
    localStorage.setItem(PAGE_SIZE_KEY, String(pageSize))
    setHasSavedPreset(true)
    toast.success("Tampilan filter berhasil disimpan sebagai tampilan bawaan!")
  }

  const handleClearSavedView = () => {
    resetFilters()
    toast.info("Tampilan tersimpan berhasil dihapus.")
  }

  const openAssetDetail = (asset: Asset) => {
    if (!asset.id) {
      toast.error("ID Aset tidak valid atau tidak ditemukan.")
      return
    }

    navigate({
      to: "/asset/$id",
      params: { id: String(asset.id) },
    })
  }

  const hasActiveFilters = Boolean(
    query ||
    condition ||
    status ||
    brandId ||
    categoryId ||
    locationId ||
    purchaseDateFrom ||
    purchaseDateTo ||
    priceMin ||
    priceMax ||
    quickFilter
  )

  const goToNextPage = () => {
    if (!pagination.hasNextPage || !pagination.nextCursor) return
    setCursorHistory((history) => [...history, cursor])
    setCursor(pagination.nextCursor)
  }

  const goToPreviousPage = () => {
    const previousCursor = cursorHistory.at(-1)
    if (previousCursor === undefined) return
    setCursor(previousCursor)
    setCursorHistory((history) => history.slice(0, -1))
  }

  const tableIsActive =
    viewMode === "table" || (viewMode === "auto" && !isMobile)
  const cardIsActive = viewMode === "card" || (viewMode === "auto" && isMobile)

  return (
    <div className="min-h-svh min-w-0 bg-[#f7f8fa] text-[#1c1c1e]">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-2.5 border-b border-[#e0e2e8] bg-white py-0 pr-4 pl-16 sm:gap-3.5 sm:pr-6 sm:pl-16 lg:pl-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            navigate({
              to: "/asset",
              search: (prev: Record<string, unknown>) => ({
                ...prev,
                search: query.trim(),
              }),
            })
          }}
          className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#e0e2e8] bg-[#f7f8fa] px-3.25 sm:max-w-85"
        >
          <span className="text-[13px] text-[#a5a8b5]">&#8981;</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari kode, nama, merek, atau kategori"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            aria-label="Cari aset"
          />
          <span className="ml-auto hidden text-xs text-[#8e91a0] sm:block">
            {loading ? "Memuat..." : `${visibleAssets.length} hasil`}
          </span>
        </form>

        <div className="ml-auto flex items-center gap-2.5">
          {/* Avatar Profile dengan Dropdown Menu (Detail Profile & Logout) */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              aria-label="Menu profil"
              aria-expanded={isProfileOpen}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600 transition select-none hover:ring-2 hover:ring-rose-300 focus:outline-none"
            >
              {userInitials || "DZ"}
            </button>

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
      </header>

      <div className="flex flex-col gap-4 px-4 py-6 pb-7 sm:px-7">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3.5">
          <div className="flex flex-col gap-1.25">
            <h1 className="text-3xl leading-none font-semibold tracking-tight">
              Daftar Aset
            </h1>
            <span className="text-sm text-[#6b6f7e]">
              {visibleAssets.length} aset ditampilkan &middot;{" "}
              {pageSummary.units} unit &middot; nilai tercatat Rp{" "}
              {formatNumber.format(pageSummary.value)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:ml-auto sm:flex sm:flex-wrap sm:gap-2.25">
            <Pill className="h-10 px-4 text-sm">
              Kolom{" "}
              <span className="text-xs font-normal text-[#6b6f7e]">10/12</span>
            </Pill>
            <Pill
              className="h-10 px-4 text-sm"
              onClick={handleExportAll}
              disabled={exporting}
            >
              {exporting ? "Mengekspor..." : "Export Excel"}
            </Pill>
            <button
              type="button"
              onClick={() => navigate({ to: "/asset/new" })}
              className="col-span-2 flex h-10 cursor-pointer items-center justify-center rounded-full bg-[#1c1c1e] px-5 text-sm font-semibold text-white sm:col-auto"
            >
              + Tambah Aset
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Pill active={!hasActiveFilters} onClick={resetFilters}>
              Semua{" "}
              <span className="text-[10px] opacity-75">{assets.length}</span>
            </Pill>

            <ReferenceChip
              active={quickFilter === "needsAttention"}
              onClick={() => {
                setQuickFilter((current) =>
                  current === "needsAttention" ? "" : "needsAttention"
                )
                resetPagination()
              }}
            >
              Perlu tindakan
            </ReferenceChip>

            <ReferenceChip
              active={quickFilter === "withoutPrice"}
              onClick={() => {
                setQuickFilter((current) =>
                  current === "withoutPrice" ? "" : "withoutPrice"
                )
                resetPagination()
              }}
            >
              Tanpa harga
            </ReferenceChip>

            <ReferenceChip
              active={quickFilter === "withoutPhoto"}
              onClick={() => {
                setQuickFilter((current) =>
                  current === "withoutPhoto" ? "" : "withoutPhoto"
                )
                resetPagination()
              }}
            >
              Tanpa foto
            </ReferenceChip>

            <ReferenceChip
              active={quickFilter === "duplicateCondition"}
              onClick={() => {
                setQuickFilter((current) =>
                  current === "duplicateCondition" ? "" : "duplicateCondition"
                )
                resetPagination()
              }}
            >
              Kondisi duplikat
            </ReferenceChip>

            {hasActiveFilters && !hasSavedPreset && (
              <button
                type="button"
                onClick={handleSaveView}
                className="h-8.5 cursor-pointer rounded-full px-3 text-xs font-semibold text-[#4262ff] transition hover:bg-[#f0efff]"
              >
                + Simpan tampilan ini
              </button>
            )}

            {hasSavedPreset && (
              <div className="flex items-center gap-1.5 rounded-full bg-[#f0efff] px-3 py-1 text-xs font-semibold text-[#4262ff]">
                <span>✓ Tampilan tersimpan</span>
                <button
                  type="button"
                  onClick={handleClearSavedView}
                  title="Hapus tampilan tersimpan default"
                  className="ml-1 cursor-pointer text-[11px] text-[#6b6f7e] hover:text-[#600000]"
                >
                  &times;
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <FilterMenu
              id="brand"
              label="Merek"
              value={brandId}
              options={brandData}
              openFilter={openFilter}
              onOpenChange={setOpenFilter}
              onChange={(value) => {
                setBrandId(value)
                resetPagination()
              }}
            />
            <FilterMenu
              id="condition"
              label="Kondisi"
              value={condition}
              options={conditionOptions.map((name) => ({ id: name, name }))}
              openFilter={openFilter}
              onOpenChange={setOpenFilter}
              onChange={(value) => {
                setCondition((value as AssetCondition | undefined) ?? "")
                resetPagination()
              }}
            />
            <FilterMenu
              id="category"
              label="Kategori"
              value={categoryId}
              options={categoryData}
              openFilter={openFilter}
              onOpenChange={setOpenFilter}
              onChange={(value) => {
                setCategoryId(value)
                resetPagination()
              }}
            />
            <FilterMenu
              id="status"
              label="Status"
              value={status}
              options={statusOptions.map((name) => ({ id: name, name }))}
              openFilter={openFilter}
              onOpenChange={setOpenFilter}
              onChange={(value) => {
                setStatus(value ?? "")
                resetPagination()
              }}
            />
            <FilterMenu
              id="location"
              label="Lokasi"
              value={locationId}
              options={locationData}
              openFilter={openFilter}
              onOpenChange={setOpenFilter}
              onChange={(value) => {
                setLocationId(value)
                resetPagination()
              }}
            />
            <DateRangeFilter
              open={openFilter === "purchase-date"}
              value={purchaseDateFrom || purchaseDateTo}
              from={purchaseDateFrom}
              to={purchaseDateTo}
              onOpenChange={(open) =>
                setOpenFilter(open ? "purchase-date" : null)
              }
              onChange={(from, to) => {
                setPurchaseDateFrom(from)
                setPurchaseDateTo(to)
                resetPagination()
              }}
            />
            <PriceRangeFilter
              open={openFilter === "price"}
              value={priceMin || priceMax}
              min={priceMin}
              max={priceMax}
              onOpenChange={(open) => setOpenFilter(open ? "price" : null)}
              onChange={(min, max) => {
                setPriceMin(min)
                setPriceMax(max)
                resetPagination()
              }}
            />
            <button
              type="button"
              onClick={resetFilters}
              className="ml-1 h-8.5 cursor-pointer px-1 text-xs font-semibold text-[#4262ff] disabled:cursor-default disabled:text-[#a5a8b5]"
              disabled={!hasActiveFilters}
            >
              Reset Filter
            </button>
          </div>
        </section>

        {selectedCodes.size > 0 && (
          <section className="flex flex-col gap-2 rounded-2xl bg-[#1c1c1e] px-4 py-3 text-white sm:flex-row sm:items-center sm:gap-3 sm:rounded-full sm:py-2 sm:pr-2 sm:pl-4.5">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">
                {selectedCodes.size} aset terpilih
              </span>
              <span className="text-xs text-[#a5a8b5]">
                {selectedSummary.units} unit &middot; Rp{" "}
                {formatNumber.format(selectedSummary.value)}
              </span>
            </div>
            <div className="flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto sm:flex-nowrap">
              {bulkActions.map(({ label, action }) => (
                <button
                  type="button"
                  onClick={action}
                  key={label}
                  disabled={exporting}
                  className="flex h-8 flex-1 cursor-pointer items-center justify-center rounded-full bg-white px-3.5 text-xs font-semibold whitespace-nowrap text-[#1c1c1e] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={handleBulkDelete}
                className="flex h-8 flex-1 cursor-pointer items-center justify-center rounded-full border border-white/35 px-3.5 text-xs font-semibold whitespace-nowrap sm:flex-none"
              >
                Hapus
              </button>
            </div>
          </section>
        )}

        {notice && (
          <button
            type="button"
            onClick={() => setNotice("")}
            className="cursor-pointer rounded-lg bg-[#c3faf5] px-4 py-3 text-left text-sm text-[#187574]"
          >
            {notice} &times;
          </button>
        )}

        <div className="flex justify-start">
          <div className="inline-flex h-10 rounded-full border border-[#c7cad5] bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              aria-label="Tampilan tabel"
              title="Tampilan tabel"
              aria-pressed={tableIsActive}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition ${tableIsActive ? "bg-[#1c1c1e] text-white" : "text-[#6b6f7e]"}`}
            >
              <Table2 size={16} strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("card")}
              aria-label="Tampilan kartu"
              title="Tampilan kartu"
              aria-pressed={cardIsActive}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition ${cardIsActive ? "bg-[#1c1c1e] text-white" : "text-[#6b6f7e]"}`}
            >
              <LayoutGrid size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>

        {loading && (
          <div
            role="status"
            className="rounded-2xl border border-[#eef0f3] bg-white px-5 py-12 text-center text-sm text-[#6b6f7e]"
          >
            Memuat daftar aset dari server...
          </div>
        )}
        {!loading && errorMessage && (
          <div
            role="alert"
            className="flex flex-col items-center gap-3 rounded-2xl border border-[#ffc6c6] bg-white px-5 py-10 text-center"
          >
            <p className="text-sm text-[#600000]">{errorMessage}</p>
            <button
              type="button"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["assets"] })
              }
              className="h-9 cursor-pointer rounded-full bg-[#1c1c1e] px-4 text-xs font-semibold text-white"
            >
              Coba lagi
            </button>
          </div>
        )}
        {!loading && !errorMessage && visibleAssets.length === 0 && (
          <div className="rounded-2xl border border-[#eef0f3] bg-white px-5 py-12 text-center">
            <p className="text-sm font-semibold">Aset tidak ditemukan</p>
            <p className="mt-1 text-xs text-[#6b6f7e]">
              Ubah kata pencarian atau reset filter untuk melihat data lain.
            </p>
          </div>
        )}

        <section
          className={
            loading || errorMessage || visibleAssets.length === 0
              ? "hidden"
              : viewMode === "card"
                ? "block"
                : viewMode === "table"
                  ? "hidden"
                  : "block md:hidden"
          }
        >
          <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 xl:grid-cols-3">
            {visibleAssets.map((asset, index) => (
              <AssetCard
                key={asset.code}
                asset={asset}
                selected={selectedCodes.has(asset.code)}
                isHighlighted={isHighlighted(asset.code)}
                isNewImport={isNewItem(index, asset.code, visibleAssets.length)}
                onToggle={() => toggleSelection(asset.code)}
                onOpen={() => openAssetDetail(asset)}
              />
            ))}
          </div>
        </section>

        <section
          className={`${
            loading || errorMessage || visibleAssets.length === 0
              ? "hidden"
              : viewMode === "card"
                ? "hidden"
                : viewMode === "table"
                  ? "block"
                  : "hidden md:block"
          } overflow-hidden rounded-2xl border border-[#eef0f3] bg-white`}
        >
          <div className="overflow-x-auto">
            <div className="min-w-240">
              <div
                className={`grid h-10 ${tableColumns} items-center gap-2.25 border-b border-[#e0e2e8] bg-[#f7f8fa] px-4.5 text-[11px] font-semibold tracking-wide text-[#6b6f7e] uppercase`}
              >
                <CheckBox selected={allSelected} onClick={selectAll} />
                <span className="text-[#1c1c1e]">Kode &uarr;</span>
                <span>Nama barang</span>
                <span>Kategori</span>
                <span>Merek</span>
                <span className="text-right">Qty</span>
                <span>Sat.</span>
                <span>Kondisi</span>
                <span>Lokasi</span>
                <span className="text-right">Harga</span>
                <span />
              </div>
              {visibleAssets.map((asset, index) => (
                <AssetRow
                  key={asset.code}
                  asset={asset}
                  selected={selectedCodes.has(asset.code)}
                  isHighlighted={isHighlighted(asset.code)}
                  isNewImport={isNewItem(
                    index,
                    asset.code,
                    visibleAssets.length
                  )}
                  onToggle={() => toggleSelection(asset.code)}
                  onOpen={() => openAssetDetail(asset)}
                />
              ))}
            </div>
          </div>
          <footer className="flex items-center gap-3 border-t border-[#e0e2e8] bg-[#fafbfc] px-4.5 py-3">
            <span className="text-xs text-[#6b6f7e]">
              Menampilkan {visibleAssets.length} aset &middot; Halaman{" "}
              {cursorHistory.length + 1}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <PageSizeMenu
                pageSize={pageSize}
                onChange={handlePageSizeChange}
              />
              <Page
                bordered
                disabled={cursorHistory.length === 0}
                onClick={goToPreviousPage}
              >
                &lsaquo;
              </Page>
              <Page active>{cursorHistory.length + 1}</Page>
              <Page
                bordered
                disabled={!pagination.hasNextPage}
                onClick={goToNextPage}
              >
                &rsaquo;
              </Page>
            </div>
          </footer>
        </section>
      </div>
    </div>
  )
}

function PageSizeMenu({
  pageSize,
  onChange,
}: {
  pageSize: number
  onChange: (size: number) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-[#e0e2e8] bg-white px-3 text-xs font-semibold text-[#555a6a] hover:border-[#a5a8b5]"
      >
        <span>{pageSize} / halaman</span>
        <ChevronDown size={13} strokeWidth={2.5} />
      </button>

      {open && (
        <div className="absolute right-0 bottom-10 z-20 w-32 rounded-xl border border-[#e0e2e8] bg-white p-1.5 shadow-[0_10px_25px_rgba(32,35,45,0.12)]">
          {[10, 25, 100].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                onChange(size)
                setOpen(false)
              }}
              className={`flex w-full cursor-pointer rounded-lg px-3 py-1.5 text-left text-xs font-medium hover:bg-[#f5f6f8] ${
                pageSize === size
                  ? "bg-[#f0efff] text-[#4262ff]"
                  : "text-[#555a6a]"
              }`}
            >
              {size} / halaman
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Komponen Baris Tabel Desktop (logika warna sorotan pintar)
function AssetRow({
  asset,
  selected,
  isHighlighted = false,
  isNewImport = false,
  onToggle,
  onOpen,
}: {
  asset: Asset
  selected: boolean
  isHighlighted?: boolean
  isNewImport?: boolean
  onToggle: () => void
  onOpen: () => void
}) {
  // Cek apakah aset ini disorot karena "Perlu Tindakan"
  const isNeedsAttention =
    isHighlighted && (asset.attention || asset.condition !== "Bagus")

  const rowStyle = isNeedsAttention
    ? "border-l-4 border-l-rose-500 bg-rose-50/80 font-medium" // MERAH untuk Perlu Tindakan
    : isHighlighted || isNewImport
      ? "border-l-4 border-l-emerald-500 bg-emerald-50/80 font-medium" // HIJAU untuk Edit / Import
      : selected
        ? "bg-[#f5f3ff]"
        : "bg-white"

  return (
    <div
      className={`grid h-14 ${tableColumns} items-center gap-2.25 border-b border-[#eef0f3] px-4.5 transition-colors duration-1000 last:border-b-0 ${rowStyle}`}
    >
      <CheckBox selected={selected} onClick={onToggle} />
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 cursor-pointer items-center gap-1.5 text-left hover:underline"
      >
        <span className="truncate font-mono text-xs text-[#4262ff]">
          {asset.code}
        </span>
        {isNewImport && (
          <span className="shrink-0 animate-pulse rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-bold text-emerald-800">
            Baru
          </span>
        )}
        {!isNewImport &&
          isHighlighted &&
          (isNeedsAttention ? (
            <span className="shrink-0 rounded bg-rose-100 px-1 py-0.5 text-[9px] font-bold text-rose-800">
              Perlu Tindakan
            </span>
          ) : (
            <span className="shrink-0 rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-bold text-emerald-800">
              Diperbarui
            </span>
          ))}
      </button>
      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 cursor-pointer text-left hover:underline"
      >
        <span className="block truncate text-sm font-semibold">
          {asset.name}
        </span>
        <span className="block truncate text-xs text-[#8e91a0]">
          {asset.detail}
        </span>
      </button>
      <span className="min-w-0 truncate text-xs text-[#555a6a]">
        {asset.category}
      </span>
      <span
        className={`min-w-0 truncate text-xs ${asset.brand === "—" ? "text-[#a5a8b5]" : "text-[#555a6a]"}`}
      >
        {asset.brand}
      </span>
      <span className="text-right font-mono text-xs text-[#555a6a]">
        {asset.quantity}
      </span>
      <span className="text-xs text-[#555a6a]">{asset.unit}</span>
      <span>
        <span
          className={`rounded-full px-2.25 py-0.75 text-[11px] font-semibold ${conditionClass[asset.condition]}`}
        >
          {asset.condition}
        </span>
      </span>
      <span className="min-w-0 truncate text-xs text-[#555a6a]">
        {asset.location}
      </span>
      <span
        className={`text-right font-mono text-xs whitespace-nowrap ${asset.price ? "text-[#1c1c1e]" : "font-sans text-[#a5a8b5]"}`}
      >
        {asset.price ?? "Belum diisi"}
      </span>
      <ActionMenu asset={asset} />
    </div>
  )
}

function ActionMenu({ asset }: { asset: Asset }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const goToEdit = () => {
    setOpen(false)

    if (!asset.id) {
      toast.error("ID Aset tidak valid atau tidak ditemukan.")
      return
    }

    navigate({
      to: "/asset/$id/edit",
      params: { id: String(asset.id) },
    })
  }

  const goToDetail = () => {
    setOpen(false)

    if (!asset.id) {
      toast.error("ID Aset tidak valid atau tidak ditemukan.")
      return
    }

    navigate({
      to: "/asset/$id",
      params: { id: String(asset.id) },
    })
  }

  const handleSoftDelete = async () => {
    setOpen(false)

    const reason = window.prompt(
      `Masukkan alasan penghapusan aset "${asset.name}":`,
      "Dihapus dari daftar aset"
    )

    if (reason === null) return

    try {
      await assetService.delete(asset.id, reason)
      toast.success("Aset berhasil diarsipkan.")
      queryClient.invalidateQueries({ queryKey: ["assets"] })
    } catch (error: unknown) {
      console.error("Detail Error Delete:", error)
      toast.error(
        `Gagal mengarsipkan aset: ${apiErrorMessage(error) || "Kesalahan server"}`
      )
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Menu aksi"
        aria-expanded={open}
        className="grid size-7 cursor-pointer place-items-center rounded-full text-[#8e91a0] hover:bg-[#f0f1f3]"
      >
        <MoreVertical size={16} strokeWidth={2} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-8 right-0 z-30 min-w-40 overflow-hidden rounded-xl border border-[#e0e2e8] bg-white py-1 shadow-[0_10px_25px_rgba(32,35,45,0.12)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={goToDetail}
            className="flex w-full cursor-pointer items-center px-3.5 py-2 text-left text-xs font-medium text-[#555a6a] hover:bg-[#f5f6f8]"
          >
            Detail
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={goToEdit}
            className="flex w-full cursor-pointer items-center px-3.5 py-2 text-left text-xs font-medium text-[#555a6a] hover:bg-[#f5f6f8]"
          >
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleSoftDelete}
            className="flex w-full cursor-pointer items-center px-3.5 py-2 text-left text-xs font-medium text-[#a80000] hover:bg-[#fff2f2]"
          >
            Hapus (Arsipkan)
          </button>
        </div>
      )}
    </div>
  )
}

// Komponen Kartu
function AssetCard({
  asset,
  selected,
  isHighlighted = false,
  isNewImport = false,
  onToggle,
  onOpen,
}: {
  asset: Asset
  selected: boolean
  isHighlighted?: boolean
  isNewImport?: boolean
  onToggle: () => void
  onOpen: () => void
}) {
  const isNeedsAttention =
    isHighlighted && (asset.attention || asset.condition !== "Bagus")

  const cardStyle = isNeedsAttention
    ? "border-rose-300 bg-rose-50/80 ring-1 ring-rose-300"
    : isHighlighted || isNewImport
      ? "border-emerald-300 bg-emerald-50/80 ring-1 ring-emerald-300"
      : selected
        ? "border-[#d8d2ff] bg-[#f5f3ff]"
        : "border-[#eef0f3] bg-white"

  return (
    <article
      className={`rounded-2xl border p-4 transition-colors duration-1000 ${cardStyle}`}
    >
      <div className="flex items-start gap-3">
        <CheckBox selected={selected} onClick={onToggle} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={onOpen}
              className="flex min-w-0 cursor-pointer items-center gap-1.5 text-left hover:underline"
            >
              <span className="font-mono text-xs text-[#4262ff]">
                {asset.code}
              </span>
              {isNewImport && (
                <span className="animate-pulse rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                  Baru
                </span>
              )}
              {!isNewImport &&
                isHighlighted &&
                (isNeedsAttention ? (
                  <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-800">
                    Perlu Tindakan
                  </span>
                ) : (
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                    Diperbarui
                  </span>
                ))}
            </button>
            <span
              className={`ml-auto shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${conditionClass[asset.condition]}`}
            >
              {asset.condition}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpen}
            className="mt-2 block max-w-full cursor-pointer truncate text-left text-sm font-semibold hover:underline"
          >
            {asset.name}
          </button>
          <p className="mt-0.5 text-xs text-[#8e91a0]">{asset.detail}</p>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[#e0e2e8] pt-3 text-xs text-[#6b6f7e]">
            <span>
              <b className="block text-[#1c1c1e]">Kategori</b>
              {asset.category}
            </span>
            <span>
              <b className="block text-[#1c1c1e]">Lokasi</b>
              {asset.location}
            </span>
            <span>
              <b className="block text-[#1c1c1e]">Jumlah</b>
              {asset.quantity} {asset.unit}
            </span>
            <span>
              <b className="block text-[#1c1c1e]">Harga</b>
              {asset.price ?? "Belum diisi"}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

function CheckBox({
  selected = false,
  onClick,
}: {
  selected?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`grid size-4 cursor-pointer place-items-center rounded border text-[10px] ${selected ? "border-[#4262ff] bg-[#4262ff] text-white" : "border-[#c7cad5] bg-white"}`}
    >
      {selected && "✓"}
    </button>
  )
}

function Pill({
  children,
  active = false,
  disabled = false,
  className = "",
  onClick,
}: {
  children: ReactNode
  active?: boolean
  disabled?: boolean
  className?: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex h-8.5 cursor-pointer items-center gap-1.5 rounded-full border px-3.75 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${active ? "border-[#1c1c1e] bg-[#1c1c1e] text-white" : "border-[#e0e2e8] bg-white text-[#555a6a]"} ${className}`}
    >
      {children}
    </button>
  )
}

function ReferenceChip({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-8.5 cursor-pointer items-center rounded-full border px-3.75 text-xs font-semibold transition ${active ? "border-[#1c1c1e] bg-[#1c1c1e] text-white" : "border-[#e0e2e8] bg-white text-[#555a6a] hover:border-[#a5a8b5]"}`}
    >
      {children}
    </button>
  )
}

type FilterOption<T extends string | number> = {
  id: T
  name: string
}

function FilterMenu<T extends string | number>({
  id,
  label,
  value,
  options,
  openFilter,
  onOpenChange,
  onChange,
}: {
  id: string
  label: string
  value: T | undefined
  options: FilterOption<T>[]
  openFilter: string | null
  onOpenChange: (filter: string | null) => void
  onChange: (value: T | undefined) => void
}) {
  const selected = options.find((option) => option.id === value)
  const isActive = selected !== undefined
  const isOpen = openFilter === id

  return (
    <div className="relative">
      <div
        className={`flex h-8.5 items-center rounded-full border text-xs font-semibold transition ${isActive ? "border-[#1c1c1e] bg-[#1c1c1e] text-white" : "border-[#e0e2e8] bg-white text-[#555a6a]"}`}
      >
        <button
          type="button"
          onClick={() => onOpenChange(isOpen ? null : id)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className="flex h-full cursor-pointer items-center gap-1.5 px-3.25"
        >
          <span>{isActive ? `${label}: ${selected.name}` : label}</span>
          {!isActive && (
            <ChevronDown size={13} strokeWidth={2.5} aria-hidden="true" />
          )}
        </button>
        {isActive && (
          <button
            type="button"
            onClick={() => {
              onChange(undefined)
              onOpenChange(null)
            }}
            aria-label={`Hapus filter ${label}`}
            className="mr-1 grid size-6 cursor-pointer place-items-center rounded-full hover:bg-white/15"
          >
            <X size={13} strokeWidth={2.5} aria-hidden="true" />
          </button>
        )}
      </div>
      {isOpen && (
        <div
          role="listbox"
          aria-label={`Filter ${label}`}
          className="absolute top-10 left-0 z-20 max-h-60 min-w-44 overflow-y-auto rounded-xl border border-[#e0e2e8] bg-white p-1.5 shadow-[0_10px_25px_rgba(32,35,45,0.12)]"
        >
          <button
            type="button"
            role="option"
            aria-selected={!isActive}
            onClick={() => {
              onChange(undefined)
              onOpenChange(null)
            }}
            className="flex w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs font-medium text-[#555a6a] hover:bg-[#f5f6f8]"
          >
            Semua
          </button>
          {options.map((option) => (
            <button
              type="button"
              role="option"
              aria-selected={option.id === value}
              key={option.id}
              onClick={() => {
                onChange(option.id)
                onOpenChange(null)
              }}
              className={`flex w-full cursor-pointer rounded-lg px-3 py-2 text-left text-xs font-medium hover:bg-[#f5f6f8] ${option.id === value ? "bg-[#f0efff] text-[#4262ff]" : "text-[#555a6a]"}`}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DateRangeFilter({
  open,
  value,
  from,
  to,
  onOpenChange,
  onChange,
}: {
  open: boolean
  value: string
  from: string
  to: string
  onOpenChange: (open: boolean) => void
  onChange: (from: string, to: string) => void
}) {
  const label =
    from && to ? `${from} – ${to}` : from || to || "Tanggal perolehan"

  return (
    <div className={open ? "relative w-full sm:w-auto" : "relative"}>
      <div
        className={`flex h-8.5 items-center rounded-full border text-xs font-semibold transition ${value ? "border-[#1c1c1e] bg-[#1c1c1e] text-white" : "border-[#e0e2e8] bg-white text-[#555a6a]"}`}
      >
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          aria-expanded={open}
          className="flex h-full cursor-pointer items-center gap-1.5 px-3.25"
        >
          <span>{label}</span>
          {!value && <ChevronDown size={13} strokeWidth={2.5} />}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("", "")
              onOpenChange(false)
            }}
            aria-label="Hapus filter tanggal perolehan"
            className="mr-1 grid size-6 cursor-pointer place-items-center rounded-full hover:bg-white/15"
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        )}
      </div>
      {open && (
        <div className="mt-2 grid w-full gap-3 rounded-xl border border-[#e0e2e8] bg-white p-3 shadow-[0_10px_25px_rgba(32,35,45,0.12)] sm:absolute sm:top-10 sm:left-0 sm:z-20 sm:mt-0 sm:w-64">
          <label className="grid gap-1 text-[11px] font-semibold text-[#6b6f7e]">
            Dari tanggal
            <input
              type="date"
              value={from}
              onChange={(event) => onChange(event.target.value, to)}
              className="h-8 rounded-lg border border-[#e0e2e8] px-2 text-xs font-medium text-[#1c1c1e] outline-none focus:border-[#4262ff]"
            />
          </label>
          <label className="grid gap-1 text-[11px] font-semibold text-[#6b6f7e]">
            Sampai tanggal
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => onChange(from, event.target.value)}
              className="h-8 rounded-lg border border-[#e0e2e8] px-2 text-xs font-medium text-[#1c1c1e] outline-none focus:border-[#4262ff]"
            />
          </label>
        </div>
      )}
    </div>
  )
}

function PriceRangeFilter({
  open,
  value,
  min,
  max,
  onOpenChange,
  onChange,
}: {
  open: boolean
  value: string
  min: string
  max: string
  onOpenChange: (open: boolean) => void
  onChange: (min: string, max: string) => void
}) {
  const label = value
    ? `${rupiahInput(min || "0")} – ${max ? rupiahInput(max) : "∞"}`
    : "Rentang harga"

  return (
    <div className={open ? "relative w-full sm:w-auto" : "relative"}>
      <div
        className={`flex h-8.5 items-center rounded-full border text-xs font-semibold transition ${value ? "border-[#1c1c1e] bg-[#1c1c1e] text-white" : "border-[#e0e2e8] bg-white text-[#555a6a]"}`}
      >
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          aria-expanded={open}
          className="flex h-full cursor-pointer items-center gap-1.5 px-3.25"
        >
          <span>{label}</span>
          {!value && <ChevronDown size={13} strokeWidth={2.5} />}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("", "")
              onOpenChange(false)
            }}
            aria-label="Hapus filter rentang harga"
            className="mr-1 grid size-6 cursor-pointer place-items-center rounded-full hover:bg-white/15"
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        )}
      </div>
      {open && (
        <div className="mt-2 grid w-full gap-3 rounded-xl border border-[#e0e2e8] bg-white p-3 shadow-[0_10px_25px_rgba(32,35,45,0.12)] sm:absolute sm:top-10 sm:right-0 sm:z-20 sm:mt-0 sm:w-60">
          <label className="grid gap-1 text-[11px] font-semibold text-[#6b6f7e]">
            Harga minimum
            <input
              type="text"
              inputMode="numeric"
              value={rupiahInput(min)}
              onChange={(event) =>
                onChange(numericInput(event.target.value), max)
              }
              placeholder="Rp. 20.000.000"
              className="h-8 rounded-lg border border-[#e0e2e8] px-2 text-xs font-medium text-[#1c1c1e] outline-none focus:border-[#4262ff]"
            />
          </label>
          <label className="grid gap-1 text-[11px] font-semibold text-[#6b6f7e]">
            Harga maksimum
            <input
              type="text"
              inputMode="numeric"
              value={rupiahInput(max)}
              onChange={(event) =>
                onChange(min, numericInput(event.target.value))
              }
              placeholder="Tanpa batas"
              className="h-8 rounded-lg border border-[#e0e2e8] px-2 text-xs font-medium text-[#1c1c1e] outline-none focus:border-[#4262ff]"
            />
          </label>
        </div>
      )}
    </div>
  )
}

function Page({
  children,
  active = false,
  bordered = false,
  disabled = false,
  onClick,
}: {
  children: ReactNode
  active?: boolean
  bordered?: boolean
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`grid size-8 cursor-pointer place-items-center rounded-full text-xs disabled:cursor-not-allowed disabled:opacity-35 ${active ? "bg-[#1c1c1e] font-semibold text-white" : bordered ? "border border-[#e0e2e8] bg-white text-[#1c1c1e]" : "text-[#555a6a]"}`}
    >
      {children}
    </button>
  )
}
