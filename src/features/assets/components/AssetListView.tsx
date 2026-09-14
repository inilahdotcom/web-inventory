import { useEffect, useMemo, useState, type ReactNode } from "react"
import { ChevronDown, LayoutGrid, Table2, X } from "lucide-react"
import { assetService } from "@/services/assetServices"
import type {
  AssetCondition,
  AssetListItem,
  AssetMasterItem,
  AssetPagination,
} from "@/types/asset"

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
}

type QuickFilter =
  | ""
  | "needsAttention"
  | "withoutPrice"
  | "withoutPhoto"
  | "duplicateCondition"

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

const formatNumber = new Intl.NumberFormat("id-ID")
const rupiahInput = (value: string) =>
  value ? formatNumber.format(Number(value)) : ""
const numericInput = (value: string) => value.replace(/\D/g, "")
const conditionOptions: AssetCondition[] = [
  "Bagus",
  "Rusak Ringan",
  "Rusak Berat",
  "Hilang",
]
const statusOptions = ["Digunakan", "Tersedia", "Diperbaiki", "Dihapuskan"]

function toAsset(item: AssetListItem): Asset {
  const attributes = item.attributes
  const priceValue = attributes.acquisitionPrice ?? 0

  return {
    id: item.id,
    slug: attributes.slug,
    code: attributes.code,
    name: attributes.name,
    detail: attributes.holder || attributes.status,
    category: attributes.category || "—",
    brand: attributes.brand || "—",
    quantity: attributes.quantity,
    unit: attributes.unit,
    condition: attributes.condition,
    status: attributes.status,
    location: attributes.location || "—",
    price:
      attributes.acquisitionPrice !== null
        ? formatNumber.format(attributes.acquisitionPrice)
        : undefined,
    priceValue,
    attention: attributes.condition !== "Bagus",
  }
}

const tableColumns =
  "grid-cols-[30px_130px_minmax(200px,1fr)_116px_80px_38px_44px_100px_96px_104px_32px]"

export function AssetListView() {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [condition, setCondition] = useState<AssetCondition | "">("")
  const [status, setStatus] = useState("")
  const [brandId, setBrandId] = useState<number>()
  const [categoryId, setCategoryId] = useState<number>()
  const [locationId, setLocationId] = useState<number>()
  const [purchaseDateFrom, setPurchaseDateFrom] = useState("")
  const [purchaseDateTo, setPurchaseDateTo] = useState("")
  const [priceMin, setPriceMin] = useState("")
  const [priceMax, setPriceMax] = useState("")
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("")
  const [brands, setBrands] = useState<AssetMasterItem[]>([])
  const [categories, setCategories] = useState<AssetMasterItem[]>([])
  const [locations, setLocations] = useState<AssetMasterItem[]>([])
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [sort, setSort] = useState<
    "code:asc" | "code:desc" | "name:asc" | "name:desc"
  >("code:asc")
  const [assets, setAssets] = useState<Asset[]>([])
  const [pagination, setPagination] = useState<AssetPagination>(emptyPagination)
  const [cursor, setCursor] = useState("")
  const [cursorHistory, setCursorHistory] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [reloadKey, setReloadKey] = useState(0)
  const [viewMode, setViewMode] = useState<"auto" | "table" | "card">("auto")
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 767px)").matches
  )
  const [selectedCodes, setSelectedCodes] = useState(() => new Set<string>())
  const [notice, setNotice] = useState("")

  const visibleAssets = useMemo(() => {
    const minimum = priceMin ? Number(priceMin) : undefined
    const maximum = priceMax ? Number(priceMax) : undefined

    return assets.filter(
      (asset) =>
        (minimum === undefined || asset.priceValue >= minimum) &&
        (maximum === undefined || asset.priceValue <= maximum)
    )
  }, [assets, priceMax, priceMin])

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

  const resetPagination = () => {
    setCursor("")
    setCursorHistory([])
  }

  const resetFilters = () => {
    setQuery("")
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

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)")
    const syncViewport = () => setIsMobile(mediaQuery.matches)
    mediaQuery.addEventListener("change", syncViewport)
    return () => mediaQuery.removeEventListener("change", syncViewport)
  }, [])

  useEffect(() => {
    let isCurrent = true

    void Promise.all([
      assetService.masters("brands"),
      assetService.masters("categories"),
      assetService.masters("locations"),
    ])
      .then(([brandData, categoryData, locationData]) => {
        if (!isCurrent) return
        setBrands(brandData)
        setCategories(categoryData)
        setLocations(locationData)
      })
      .catch(() => {
        // Filter data utama tetap dapat digunakan bila master data gagal dimuat.
      })

    return () => {
      isCurrent = false
    }
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
      setCursor("")
      setCursorHistory([])
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    const controller = new AbortController()

    const loadAssets = async () => {
      setLoading(true)
      setErrorMessage("")

      try {
        const result = await assetService.list(
          {
            pageSize: 25,
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
            cursor: cursor || undefined,
          },
          controller.signal
        )
        setAssets(result.assets.map(toAsset))
        setPagination(result.pagination)
        setSelectedCodes(new Set())
      } catch {
        if (!controller.signal.aborted) {
          setAssets([])
          setPagination(emptyPagination)
          setErrorMessage(
            "Daftar aset gagal dimuat. Periksa koneksi backend lalu coba lagi."
          )
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void loadAssets()
    return () => controller.abort()
  }, [
    brandId,
    categoryId,
    condition,
    cursor,
    debouncedQuery,
    locationId,
    priceMax,
    priceMin,
    purchaseDateFrom,
    purchaseDateTo,
    quickFilter,
    reloadKey,
    sort,
    status,
  ])

  return (
    <div className="min-h-svh min-w-0 bg-[#f7f8fa] text-[#1c1c1e]">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-2.5 border-b border-[#e0e2e8] bg-white py-0 pr-4 pl-16 sm:gap-3.5 sm:pr-6 sm:pl-16 lg:pl-6">
        <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#e0e2e8] bg-[#f7f8fa] px-3.25 sm:max-w-85">
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
        </label>
        <div className="ml-auto flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full border border-[#e0e2e8] text-[13px] text-[#555a6a]">
            ?
          </span>
          <span className="grid size-9 place-items-center rounded-full bg-[#ffc6c6] text-xs font-semibold text-[#600000]">
            RS
          </span>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-4 py-6 pb-7 sm:px-7">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3.5">
          <div className="flex flex-col gap-1.25">
            <h1 className="text-3xl leading-none font-semibold tracking-tight">
              Daftar Aset
            </h1>
            <span className="text-sm text-[#6b6f7e]">
              {assets.length} aset di halaman ini &middot; {pageSummary.units}{" "}
              unit &middot; nilai tercatat Rp{" "}
              {formatNumber.format(pageSummary.value)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:ml-auto sm:flex sm:flex-wrap sm:gap-2.25">
            <Pill className="h-10 px-4 text-sm">
              Kolom{" "}
              <span className="text-xs font-normal text-[#6b6f7e]">10/12</span>
            </Pill>
            <Pill className="h-10 px-4 text-sm">Export Excel</Pill>
            <button
              type="button"
              onClick={() => setNotice("Form tambah aset belum tersedia.")}
              className="col-span-2 flex h-10 items-center justify-center rounded-full bg-[#1c1c1e] px-5 text-sm font-semibold text-white sm:col-auto"
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
            <button
              type="button"
              onClick={() => setNotice("Simpan tampilan akan tersedia segera.")}
              className="h-8.5 rounded-full px-3 text-xs font-semibold text-[#8e91a0] transition hover:text-[#555a6a]"
            >
              + Simpan tampilan ini
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <FilterMenu
              id="brand"
              label="Merek"
              value={brandId}
              options={brands}
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
              options={categories}
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
              options={locations}
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
              className="ml-1 h-8.5 px-1 text-xs font-semibold text-[#4262ff] disabled:cursor-default disabled:text-[#a5a8b5]"
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
              {["Ubah kondisi", "Mutasi", "Export terpilih"].map((label) => (
                <button
                  onClick={() =>
                    setNotice(`${label} siap diproses untuk aset terpilih.`)
                  }
                  key={label}
                  className="flex h-8 flex-1 items-center justify-center rounded-full bg-white px-3.5 text-xs font-semibold whitespace-nowrap text-[#1c1c1e] sm:flex-none"
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => setSelectedCodes(new Set())}
                className="flex h-8 flex-1 items-center justify-center rounded-full border border-white/35 px-3.5 text-xs font-semibold whitespace-nowrap sm:flex-none"
              >
                Hapus
              </button>
            </div>
          </section>
        )}
        {notice && (
          <button
            onClick={() => setNotice("")}
            className="rounded-lg bg-[#c3faf5] px-4 py-3 text-left text-sm text-[#187574]"
          >
            {notice} &times;
          </button>
        )}

        <div className="flex justify-start">
          <div className="inline-flex h-10 rounded-full border border-[#c7cad5] bg-white p-1">
            <button
              onClick={() => setViewMode("table")}
              aria-label="Tampilan tabel"
              title="Tampilan tabel"
              aria-pressed={tableIsActive}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition ${tableIsActive ? "bg-[#1c1c1e] text-white" : "text-[#6b6f7e]"}`}
            >
              <Table2 size={16} strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              aria-label="Tampilan kartu"
              title="Tampilan kartu"
              aria-pressed={cardIsActive}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition ${cardIsActive ? "bg-[#1c1c1e] text-white" : "text-[#6b6f7e]"}`}
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
              onClick={() => setReloadKey((value) => value + 1)}
              className="h-9 rounded-full bg-[#1c1c1e] px-4 text-xs font-semibold text-white"
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
            {visibleAssets.map((asset) => (
              <AssetCard
                key={asset.code}
                asset={asset}
                selected={selectedCodes.has(asset.code)}
                onToggle={() => toggleSelection(asset.code)}
              />
            ))}
          </div>
        </section>

        {!loading &&
          !errorMessage &&
          visibleAssets.length > 0 &&
          viewMode === "table" && (
            <section className="overflow-hidden rounded-2xl border border-[#eef0f3] bg-white md:hidden">
              <div className="grid h-10 grid-cols-[minmax(0,1fr)_88px_72px] items-center gap-2 border-b border-[#e0e2e8] bg-[#f7f8fa] px-3 text-[10px] font-semibold tracking-wide text-[#6b6f7e] uppercase">
                <span className="pl-6">Nama barang</span>
                <span>Kondisi</span>
                <span className="text-right">Harga</span>
              </div>
              {visibleAssets.map((asset) => (
                <MobileAssetRow
                  key={asset.code}
                  asset={asset}
                  selected={selectedCodes.has(asset.code)}
                  onToggle={() => toggleSelection(asset.code)}
                />
              ))}
            </section>
          )}

        <section
          className={`${
            loading || errorMessage || visibleAssets.length === 0
              ? "hidden"
              : viewMode === "card"
                ? "hidden"
                : "hidden md:block"
          } overflow-x-auto rounded-2xl border border-[#eef0f3] bg-white`}
        >
          <div className="min-w-250">
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
            {visibleAssets.map((asset) => (
              <AssetRow
                key={asset.code}
                asset={asset}
                selected={selectedCodes.has(asset.code)}
                onToggle={() => toggleSelection(asset.code)}
              />
            ))}
          </div>
          <footer className="flex items-center gap-3 border-t border-[#e0e2e8] bg-[#fafbfc] px-4.5 py-3">
            <span className="text-xs text-[#6b6f7e]">
              Menampilkan {visibleAssets.length} aset &middot; Halaman{" "}
              {cursorHistory.length + 1}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Pill className="h-8 px-3.25">
                {pagination.pageSize} / halaman
              </Pill>
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

function AssetRow({
  asset,
  selected,
  onToggle,
}: {
  asset: Asset
  selected: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={`grid h-14 ${tableColumns} items-center gap-2.25 border-b border-[#eef0f3] px-4.5 last:border-b-0 ${selected ? "bg-[#f5f3ff]" : "bg-white"}`}
    >
      <CheckBox selected={selected} onClick={onToggle} />
      <span className="font-mono text-xs text-[#4262ff]">{asset.code}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">
          {asset.name}
        </span>
        <span
          className={`block truncate text-xs ${asset.attention ? "text-[#600000]" : "text-[#8e91a0]"}`}
        >
          {asset.detail}
        </span>
      </span>
      <span className="text-xs text-[#555a6a]">{asset.category}</span>
      <span
        className={`text-xs ${asset.brand === "—" ? "text-[#a5a8b5]" : "text-[#555a6a]"}`}
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
      <span className="text-xs text-[#555a6a]">{asset.location}</span>
      <span
        className={`text-right font-mono text-xs ${asset.price ? "text-[#1c1c1e]" : "font-sans text-[#a5a8b5]"}`}
      >
        {asset.price ?? "Belum diisi"}
      </span>
      <span className="text-center text-sm text-[#8e91a0]">&#8943;</span>
    </div>
  )
}

function MobileAssetRow({
  asset,
  selected,
  onToggle,
}: {
  asset: Asset
  selected: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={`grid min-h-17 grid-cols-[minmax(0,1fr)_88px_72px] items-center gap-2 border-b border-[#eef0f3] px-3 py-2 last:border-b-0 ${selected ? "bg-[#f5f3ff]" : "bg-white"}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <CheckBox selected={selected} onClick={onToggle} />
        <span className="min-w-0">
          <span className="block truncate text-xs font-semibold">
            {asset.name}
          </span>
          <span className="block truncate font-mono text-[10px] text-[#4262ff]">
            {asset.code}
          </span>
        </span>
      </div>
      <span className="min-w-0">
        <span
          className={`inline-block max-w-full truncate rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${conditionClass[asset.condition]}`}
        >
          {asset.condition}
        </span>
        <span className="mt-1 block truncate text-[11px] text-[#6b6f7e]">
          {asset.location}
        </span>
      </span>
      <span
        className={`truncate text-right font-mono text-[11px] ${asset.price ? "text-[#1c1c1e]" : "font-sans text-[#a5a8b5]"}`}
      >
        {asset.price ?? "Belum diisi"}
      </span>
    </div>
  )
}

function AssetCard({
  asset,
  selected,
  onToggle,
}: {
  asset: Asset
  selected: boolean
  onToggle: () => void
}) {
  return (
    <article
      className={`rounded-2xl border p-4 ${selected ? "border-[#d8d2ff] bg-[#f5f3ff]" : "border-[#eef0f3] bg-white"}`}
    >
      <div className="flex items-start gap-3">
        <CheckBox selected={selected} onClick={onToggle} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <span className="font-mono text-xs text-[#4262ff]">
              {asset.code}
            </span>
            <span
              className={`ml-auto shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${conditionClass[asset.condition]}`}
            >
              {asset.condition}
            </span>
          </div>
          <h2 className="mt-2 truncate text-sm font-semibold">{asset.name}</h2>
          <p
            className={`mt-0.5 text-xs ${asset.attention ? "text-[#600000]" : "text-[#8e91a0]"}`}
          >
            {asset.detail}
          </p>
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
              {asset.price ? `Rp ${asset.price}` : "Belum diisi"}
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
      onClick={onClick}
      className={`grid size-4 place-items-center rounded border text-[10px] ${selected ? "border-[#4262ff] bg-[#4262ff] text-white" : "border-[#c7cad5] bg-white"}`}
    >
      {selected && "✓"}
    </button>
  )
}

function Pill({
  children,
  active = false,
  className = "",
  onClick,
}: {
  children: ReactNode
  active?: boolean
  className?: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-8.5 items-center gap-1.5 rounded-full border px-3.75 text-xs font-semibold ${active ? "border-[#1c1c1e] bg-[#1c1c1e] text-white" : "border-[#e0e2e8] bg-white text-[#555a6a]"} ${className}`}
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
      className={`flex h-8.5 items-center rounded-full border px-3.75 text-xs font-semibold transition ${active ? "border-[#1c1c1e] bg-[#1c1c1e] text-white" : "border-[#e0e2e8] bg-white text-[#555a6a] hover:border-[#a5a8b5]"}`}
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
          className="flex h-full items-center gap-1.5 px-3.25"
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
            className="mr-1 grid size-6 place-items-center rounded-full hover:bg-white/15"
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
            className="flex w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-[#555a6a] hover:bg-[#f5f6f8]"
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
              className={`flex w-full rounded-lg px-3 py-2 text-left text-xs font-medium hover:bg-[#f5f6f8] ${option.id === value ? "bg-[#f0efff] text-[#4262ff]" : "text-[#555a6a]"}`}
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
    <div className="relative">
      <div
        className={`flex h-8.5 items-center rounded-full border text-xs font-semibold transition ${value ? "border-[#1c1c1e] bg-[#1c1c1e] text-white" : "border-[#e0e2e8] bg-white text-[#555a6a]"}`}
      >
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          aria-expanded={open}
          className="flex h-full items-center gap-1.5 px-3.25"
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
            className="mr-1 grid size-6 place-items-center rounded-full hover:bg-white/15"
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute top-10 left-0 z-20 grid w-64 gap-3 rounded-xl border border-[#e0e2e8] bg-white p-3 shadow-[0_10px_25px_rgba(32,35,45,0.12)]">
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
    ? `Rp ${rupiahInput(min || "0")} – ${max ? rupiahInput(max) : "∞"}`
    : "Rentang harga"

  return (
    <div className="relative">
      <div
        className={`flex h-8.5 items-center rounded-full border text-xs font-semibold transition ${value ? "border-[#1c1c1e] bg-[#1c1c1e] text-white" : "border-[#e0e2e8] bg-white text-[#555a6a]"}`}
      >
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          aria-expanded={open}
          className="flex h-full items-center gap-1.5 px-3.25"
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
            className="mr-1 grid size-6 place-items-center rounded-full hover:bg-white/15"
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute top-10 right-0 z-20 grid w-60 gap-3 rounded-xl border border-[#e0e2e8] bg-white p-3 shadow-[0_10px_25px_rgba(32,35,45,0.12)]">
          <label className="grid gap-1 text-[11px] font-semibold text-[#6b6f7e]">
            Harga minimum
            <input
              type="text"
              inputMode="numeric"
              value={rupiahInput(min)}
              onChange={(event) =>
                onChange(numericInput(event.target.value), max)
              }
              placeholder="Contoh: 20.000.000"
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
      className={`grid size-8 place-items-center rounded-full text-xs disabled:cursor-not-allowed disabled:opacity-35 ${active ? "bg-[#1c1c1e] font-semibold text-white" : bordered ? "border border-[#e0e2e8] bg-white text-[#1c1c1e]" : "text-[#555a6a]"}`}
    >
      {children}
    </button>
  )
}
