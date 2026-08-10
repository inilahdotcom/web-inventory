import { useEffect, useMemo, useState, type ReactNode } from "react"
import { LayoutGrid, Table2 } from "lucide-react"

type Asset = {
  code: string
  name: string
  detail: string
  category: string
  brand: string
  quantity: string
  unit: string
  condition: "Bagus" | "Rusak Ringan" | "Rusak Berat"
  location: string
  price?: string
  selected?: boolean
  attention?: boolean
}

const assets: Asset[] = [
  {
    code: "021/INC-GA/1/26",
    name: 'Macbook Pro M1 13"',
    detail: "Aditya Pratama",
    category: "Komputer & Laptop",
    brand: "APPLE",
    quantity: "1",
    unit: "Unit",
    condition: "Bagus",
    location: "Redaksi L3",
    price: "19.519.000",
    selected: true,
  },
  {
    code: "022/INC-GA/1/26",
    name: "MSI GF65 Thin 10UE",
    detail: "Sinta Wulandari",
    category: "Komputer & Laptop",
    brand: "MSI",
    quantity: "2",
    unit: "Unit",
    condition: "Bagus",
    location: "Redaksi L3",
    price: "10.050.000",
    selected: true,
  },
  {
    code: "029/INC-GA/1/26",
    name: "Lenovo ThinkPad E14",
    detail: "Budi Hartono",
    category: "Komputer & Laptop",
    brand: "LENOVO",
    quantity: "3",
    unit: "Unit",
    condition: "Bagus",
    location: "Redaksi L3",
    price: "11.900.000",
    selected: true,
  },
  {
    code: "041/INC-GA/1/26",
    name: 'Macbook Pro M1 13"',
    detail: "Mirip 021 — cek duplikat",
    category: "Komputer & Laptop",
    brand: "APPLE",
    quantity: "1",
    unit: "Unit",
    condition: "Bagus",
    location: "Redaksi L3",
    price: "19.519.000",
    attention: true,
  },
  {
    code: "053/INC-GA/1/26",
    name: "CPU Redaksi Lantai 3",
    detail: "Keterangan: 1 Unit Rusak",
    category: "Perangkat IT & Server",
    brand: "—",
    quantity: "4",
    unit: "Unit",
    condition: "Rusak Berat",
    location: "Redaksi L3",
    attention: true,
  },
  {
    code: "064/INC-GA/1/26",
    name: "Switch 24 Port GS324",
    detail: "Ruang Server",
    category: "Perangkat Jaringan",
    brand: "NETGEAR",
    quantity: "3",
    unit: "Unit",
    condition: "Bagus",
    location: "Server L2",
    price: "7.850.000",
  },
  {
    code: "071/INC-GA/1/26",
    name: "Mixer Audio 12 Channel",
    detail: "Studio Siaran",
    category: "Broadcast & Audio",
    brand: "SONY",
    quantity: "1",
    unit: "Set",
    condition: "Rusak Ringan",
    location: "Studio L2",
  },
  {
    code: "083/INC-GA/1/26",
    name: "AC Split 1 PK",
    detail: "Ruang Rapat L1",
    category: "Elektronik Kantor",
    brand: "SHARP",
    quantity: "6",
    unit: "Unit",
    condition: "Bagus",
    location: "Rapat L1",
    price: "4.375.000",
  },
  {
    code: "091/INC-GA/1/26",
    name: "Kursi Kerja Staff",
    detail: "Gudang GA",
    category: "Furniture & Umum",
    brand: "—",
    quantity: "24",
    unit: "Pcs",
    condition: "Bagus",
    location: "Gudang GA",
  },
]

const conditionClass = {
  Bagus: "bg-[#c3faf5] text-[#187574]",
  "Rusak Ringan": "bg-[#fff8e0] text-[#746019]",
  "Rusak Berat": "bg-[#ffc6c6] text-[#600000]",
}

const tableColumns =
  "grid-cols-[30px_130px_minmax(200px,1fr)_116px_80px_38px_44px_100px_96px_104px_32px]"

export function AssetListView() {
  const [query, setQuery] = useState("lenovo")
  const [hasSearched, setHasSearched] = useState(false)
  const [filter, setFilter] = useState("Semua")
  const [viewMode, setViewMode] = useState<"auto" | "table" | "card">("auto")
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 767px)").matches
  )
  const [selectedCodes, setSelectedCodes] = useState(
    () =>
      new Set(
        assets.filter((asset) => asset.selected).map((asset) => asset.code)
      )
  )
  const [notice, setNotice] = useState("")
  const visibleAssets = useMemo(() => {
    const normalized = query.toLowerCase()
    return assets.filter((asset) => {
      const matchesSearch =
        !hasSearched ||
        !normalized ||
        `${asset.code} ${asset.name} ${asset.brand} ${asset.category}`
          .toLowerCase()
          .includes(normalized)
      const matchesFilter =
        filter === "Semua" ||
        (filter === "Perlu tindakan" && asset.attention) ||
        (filter === "Tanpa harga" && !asset.price) ||
        (filter === "Kandidat duplikat" && asset.detail.includes("Mirip")) ||
        filter === "Tanpa foto"
      return matchesSearch && matchesFilter
    })
  }, [filter, hasSearched, query])
  const toggleSelection = (code: string) =>
    setSelectedCodes((current) => {
      const next = new Set(current)
      next.has(code) ? next.delete(code) : next.add(code)
      return next
    })
  const selectAll = () =>
    setSelectedCodes(new Set(visibleAssets.map((asset) => asset.code)))
  const tableIsActive =
    viewMode === "table" || (viewMode === "auto" && !isMobile)
  const cardIsActive = viewMode === "card" || (viewMode === "auto" && isMobile)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)")
    const syncViewport = () => setIsMobile(mediaQuery.matches)
    mediaQuery.addEventListener("change", syncViewport)
    return () => mediaQuery.removeEventListener("change", syncViewport)
  }, [])

  return (
    <div className="min-h-svh min-w-0 bg-[#f7f8fa] text-[#1c1c1e]">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-[10px] border-b border-[#e0e2e8] bg-white py-0 pr-4 pl-16 sm:gap-[14px] sm:pr-6 sm:pl-16 lg:pl-6">
        <label className="flex h-10 min-w-0 flex-1 items-center gap-[9px] rounded-lg border border-[#e0e2e8] bg-[#f7f8fa] px-[13px] sm:max-w-[340px]">
          <span className="text-[13px] text-[#a5a8b5]">&#8981;</span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setHasSearched(true)
            }}
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
            aria-label="Cari aset"
          />
          <span className="ml-auto hidden text-[11px] text-[#8e91a0] sm:block">
            {visibleAssets.length} hasil &middot; 0,4 s
          </span>
        </label>
        <div className="ml-auto flex items-center gap-[10px]">
          <span className="grid size-9 place-items-center rounded-full border border-[#e0e2e8] text-[13px] text-[#555a6a]">
            ?
          </span>
          <span className="grid size-9 place-items-center rounded-full bg-[#ffc6c6] text-[11px] font-semibold text-[#600000]">
            RS
          </span>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-4 py-6 pb-7 sm:px-7">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-[14px]">
          <div className="flex flex-col gap-[5px]">
            <h1 className="text-[28px] leading-none font-semibold tracking-[-0.6px]">
              Daftar Aset
            </h1>
            <span className="text-[13px] text-[#6b6f7e]">
              95 aset &middot; 213 unit &middot; nilai tercatat Rp 1.421.870.000
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:ml-auto sm:flex sm:flex-wrap sm:gap-[9px]">
            <Pill className="h-10 px-4 text-[13.5px]">
              Kolom{" "}
              <span className="text-[11px] font-normal text-[#6b6f7e]">
                10/12
              </span>
            </Pill>
            <Pill className="h-10 px-4 text-[13.5px]">Export Excel</Pill>
            <button
              type="button"
              onClick={() => setNotice("Form tambah aset belum tersedia.")}
              className="col-span-2 flex h-10 items-center justify-center rounded-full bg-[#1c1c1e] px-[19px] text-[13.5px] font-semibold text-white sm:col-auto"
            >
              + Tambah Aset
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-[7px]">
            <Pill
              active={filter === "Semua"}
              onClick={() => setFilter("Semua")}
            >
              Semua <span className="opacity-55">95</span>
            </Pill>
            <Pill
              active={filter === "Perlu tindakan"}
              onClick={() => setFilter("Perlu tindakan")}
            >
              Perlu tindakan <span className="text-[#600000]">11</span>
            </Pill>
            <Pill
              active={filter === "Tanpa harga"}
              onClick={() => setFilter("Tanpa harga")}
            >
              Tanpa harga <span className="text-[#746019]">62</span>
            </Pill>
            <Pill
              active={filter === "Tanpa foto"}
              onClick={() => setFilter("Tanpa foto")}
            >
              Tanpa foto <span className="text-[#746019]">95</span>
            </Pill>
            <Pill
              active={filter === "Kandidat duplikat"}
              onClick={() => setFilter("Kandidat duplikat")}
            >
              Kandidat duplikat <span className="text-[#600000]">11</span>
            </Pill>
            <span className="mx-1 h-[22px] w-px bg-[#e0e2e8]" />
            <span className="flex h-[34px] items-center rounded-full border border-dashed border-[#c7cad5] bg-white px-[13px] text-[12.5px] font-semibold text-[#6b6f7e]">
              + Simpan tampilan ini
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-[7px]">
            <ActiveFilter
              onClick={() => {
                setQuery("")
                setHasSearched(true)
              }}
            >
              Merek: LENOVO
            </ActiveFilter>
            <ActiveFilter onClick={() => setFilter("Semua")}>
              Kondisi: Bagus, Rusak Berat
            </ActiveFilter>
            {[
              "Kategori",
              "Status",
              "Lokasi",
              "Tanggal perolehan",
              "Rentang harga",
            ].map((label) => (
              <Pill key={label}>
                {label} <span className="text-[#8e91a0]">&#9662;</span>
              </Pill>
            ))}
            <button
              onClick={() => {
                setFilter("Semua")
                setQuery("")
                setHasSearched(true)
              }}
              className="ml-1 text-[12.5px] font-semibold text-[#4262ff]"
            >
              Reset filter
            </button>
          </div>
        </section>

        {selectedCodes.size > 0 && (
          <section className="flex flex-col gap-2 rounded-2xl bg-[#1c1c1e] px-4 py-3 text-white sm:flex-row sm:items-center sm:gap-3 sm:rounded-full sm:py-2 sm:pr-2 sm:pl-[18px]">
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-semibold">
                {selectedCodes.size} aset terpilih
              </span>
              <span className="text-[12px] text-[#a5a8b5]">
                6 unit &middot; Rp 41.469.000
              </span>
            </div>
            <div className="flex w-full flex-wrap gap-[7px] sm:ml-auto sm:w-auto sm:flex-nowrap">
              {["Ubah kondisi", "Mutasi", "Export terpilih"].map((label) => (
                <button
                  onClick={() =>
                    setNotice(`${label} siap diproses untuk aset terpilih.`)
                  }
                  key={label}
                  className="flex h-8 flex-1 items-center justify-center rounded-full bg-white px-[14px] text-[12.5px] font-semibold whitespace-nowrap text-[#1c1c1e] sm:flex-none"
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => setSelectedCodes(new Set())}
                className="flex h-8 flex-1 items-center justify-center rounded-full border border-white/35 px-[14px] text-[12.5px] font-semibold whitespace-nowrap sm:flex-none"
              >
                Hapus
              </button>
            </div>
          </section>
        )}
        {notice && (
          <button
            onClick={() => setNotice("")}
            className="rounded-lg bg-[#c3faf5] px-4 py-3 text-left text-[13px] text-[#187574]"
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

        <section
          className={
            viewMode === "card"
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

        {viewMode === "table" && (
          <section className="overflow-hidden rounded-2xl border border-[#eef0f3] bg-white md:hidden">
            <div className="grid h-10 grid-cols-[minmax(0,1fr)_88px_72px] items-center gap-2 border-b border-[#e0e2e8] bg-[#f7f8fa] px-3 text-[10px] font-semibold tracking-[0.35px] text-[#6b6f7e] uppercase">
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
            viewMode === "card" ? "hidden" : "hidden md:block"
          } overflow-x-auto rounded-2xl border border-[#eef0f3] bg-white`}
        >
          <div className="min-w-[1000px]">
            <div
              className={`grid h-10 ${tableColumns} items-center gap-[9px] border-b border-[#e0e2e8] bg-[#f7f8fa] px-[18px] text-[10.5px] font-semibold tracking-[0.4px] text-[#6b6f7e] uppercase`}
            >
              <CheckBox
                selected={
                  selectedCodes.size === visibleAssets.length &&
                  visibleAssets.length > 0
                }
                onClick={selectAll}
              />
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
          <footer className="flex items-center gap-3 border-t border-[#e0e2e8] bg-[#fafbfc] px-[18px] py-[13px]">
            <span className="text-[12.5px] text-[#6b6f7e]">
              Menampilkan 1&ndash;25 dari 95 aset
            </span>
            <div className="ml-auto flex items-center gap-[7px]">
              <Pill className="h-8 px-[13px]">
                25 / halaman <span className="text-[#8e91a0]">&#9662;</span>
              </Pill>
              <Page bordered>&lsaquo;</Page>
              <Page active>1</Page>
              <Page>2</Page>
              <Page>3</Page>
              <Page>4</Page>
              <Page bordered>&rsaquo;</Page>
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
      className={`grid h-14 ${tableColumns} items-center gap-[9px] border-b border-[#eef0f3] px-[18px] last:border-b-0 ${selected ? "bg-[#f5f3ff]" : "bg-white"}`}
    >
      <CheckBox selected={selected} onClick={onToggle} />
      <span className="font-mono text-[12.5px] text-[#4262ff]">
        {asset.code}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13.5px] font-semibold">
          {asset.name}
        </span>
        <span
          className={`block truncate text-[11.5px] ${asset.attention ? "text-[#600000]" : "text-[#8e91a0]"}`}
        >
          {asset.detail}
        </span>
      </span>
      <span className="text-[12.5px] text-[#555a6a]">{asset.category}</span>
      <span
        className={`text-[12.5px] ${asset.brand === "—" ? "text-[#a5a8b5]" : "text-[#555a6a]"}`}
      >
        {asset.brand}
      </span>
      <span className="text-right font-mono text-[12.5px] text-[#555a6a]">
        {asset.quantity}
      </span>
      <span className="text-[12.5px] text-[#555a6a]">{asset.unit}</span>
      <span>
        <span
          className={`rounded-full px-[9px] py-[3px] text-[11px] font-semibold ${conditionClass[asset.condition]}`}
        >
          {asset.condition}
        </span>
      </span>
      <span className="text-[12.5px] text-[#555a6a]">{asset.location}</span>
      <span
        className={`text-right font-mono text-[12.5px] ${asset.price ? "text-[#1c1c1e]" : "font-sans text-[#a5a8b5]"}`}
      >
        {asset.price ?? "Belum diisi"}
      </span>
      <span className="text-center text-[15px] text-[#8e91a0]">&#8943;</span>
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
      className={`grid min-h-[67px] grid-cols-[minmax(0,1fr)_88px_72px] items-center gap-2 border-b border-[#eef0f3] px-3 py-2 last:border-b-0 ${selected ? "bg-[#f5f3ff]" : "bg-white"}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <CheckBox selected={selected} onClick={onToggle} />
        <span className="min-w-0">
          <span className="block truncate text-[12.5px] font-semibold">
            {asset.name}
          </span>
          <span className="block truncate font-mono text-[10.5px] text-[#4262ff]">
            {asset.code}
          </span>
        </span>
      </div>
      <span className="min-w-0">
        <span
          className={`inline-block max-w-full truncate rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold ${conditionClass[asset.condition]}`}
        >
          {asset.condition}
        </span>
        <span className="mt-1 block truncate text-[10.5px] text-[#6b6f7e]">
          {asset.location}
        </span>
      </span>
      <span
        className={`truncate text-right font-mono text-[10.5px] ${asset.price ? "text-[#1c1c1e]" : "font-sans text-[#a5a8b5]"}`}
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
            <span className="font-mono text-[11px] text-[#4262ff]">
              {asset.code}
            </span>
            <span
              className={`ml-auto shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${conditionClass[asset.condition]}`}
            >
              {asset.condition}
            </span>
          </div>
          <h2 className="mt-2 truncate text-[15px] font-semibold">
            {asset.name}
          </h2>
          <p
            className={`mt-0.5 text-[11.5px] ${asset.attention ? "text-[#600000]" : "text-[#8e91a0]"}`}
          >
            {asset.detail}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[#e0e2e8] pt-3 text-[11px] text-[#6b6f7e]">
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
      className={`grid size-4 place-items-center rounded-[4px] border text-[10px] ${selected ? "border-[#4262ff] bg-[#4262ff] text-white" : "border-[#c7cad5] bg-white"}`}
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
      className={`flex h-[34px] items-center gap-[6px] rounded-full border px-[15px] text-[12.5px] font-semibold ${active ? "border-[#1c1c1e] bg-[#1c1c1e] text-white" : "border-[#e0e2e8] bg-white text-[#555a6a]"} ${className}`}
    >
      {children}
    </button>
  )
}

function ActiveFilter({
  children,
  onClick,
}: {
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-[34px] items-center gap-2 rounded-full bg-[#1c1c1e] px-[13px] text-[12.5px] font-semibold text-white"
    >
      {children}
      <span className="opacity-60">&times;</span>
    </button>
  )
}

function Page({
  children,
  active = false,
  bordered = false,
}: {
  children: ReactNode
  active?: boolean
  bordered?: boolean
}) {
  return (
    <span
      className={`grid size-8 place-items-center rounded-full text-[12.5px] ${active ? "bg-[#1c1c1e] font-semibold text-white" : bordered ? "border border-[#e0e2e8] bg-white text-[#1c1c1e]" : "text-[#555a6a]"}`}
    >
      {children}
    </span>
  )
}
