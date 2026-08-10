import type { ReactNode } from "react"

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
  return (
    <div className="min-h-svh min-w-[1208px] bg-[#f7f8fa] text-[#1c1c1e]">
      <header className="flex h-16 items-center gap-[14px] border-b border-[#e0e2e8] bg-white px-6">
        <div className="flex h-10 w-[340px] items-center gap-[9px] rounded-lg border border-[#e0e2e8] bg-[#f7f8fa] px-[13px]">
          <span className="text-[13px] text-[#a5a8b5]">&#8981;</span>
          <span className="text-[13px]">lenovo</span>
          <span className="ml-auto text-[11px] text-[#8e91a0]">
            14 hasil &middot; 0,4 s
          </span>
        </div>
        <div className="ml-auto flex items-center gap-[10px]">
          <span className="grid size-9 place-items-center rounded-full border border-[#e0e2e8] text-[13px] text-[#555a6a]">
            ?
          </span>
          <span className="grid size-9 place-items-center rounded-full bg-[#ffc6c6] text-[11px] font-semibold text-[#600000]">
            RS
          </span>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-7 py-6 pb-7">
        <section className="flex items-end gap-[14px]">
          <div className="flex flex-col gap-[5px]">
            <h1 className="text-[28px] leading-none font-semibold tracking-[-0.6px]">
              Daftar Aset
            </h1>
            <span className="text-[13px] text-[#6b6f7e]">
              95 aset &middot; 213 unit &middot; nilai tercatat Rp 1.421.870.000
            </span>
          </div>
          <div className="ml-auto flex gap-[9px]">
            <Pill className="h-10 px-4 text-[13.5px]">
              Kolom{" "}
              <span className="text-[11px] font-normal text-[#6b6f7e]">
                10/12
              </span>
            </Pill>
            <Pill className="h-10 px-4 text-[13.5px]">Export Excel</Pill>
            <button
              type="button"
              className="flex h-10 items-center rounded-full bg-[#1c1c1e] px-[19px] text-[13.5px] font-semibold text-white"
            >
              + Tambah Aset
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-[7px]">
            <Pill active>
              Semua <span className="opacity-55">95</span>
            </Pill>
            <Pill>
              Perlu tindakan <span className="text-[#600000]">11</span>
            </Pill>
            <Pill>
              Tanpa harga <span className="text-[#746019]">62</span>
            </Pill>
            <Pill>
              Tanpa foto <span className="text-[#746019]">95</span>
            </Pill>
            <Pill>
              Kandidat duplikat <span className="text-[#600000]">11</span>
            </Pill>
            <span className="mx-1 h-[22px] w-px bg-[#e0e2e8]" />
            <span className="flex h-[34px] items-center rounded-full border border-dashed border-[#c7cad5] bg-white px-[13px] text-[12.5px] font-semibold text-[#6b6f7e]">
              + Simpan tampilan ini
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-[7px]">
            <ActiveFilter>Merek: LENOVO</ActiveFilter>
            <ActiveFilter>Kondisi: Bagus, Rusak Berat</ActiveFilter>
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
            <span className="ml-1 text-[12.5px] font-semibold text-[#4262ff]">
              Reset filter
            </span>
          </div>
        </section>

        <section className="flex items-center gap-3 rounded-full bg-[#1c1c1e] py-2 pr-2 pl-[18px] text-white">
          <span className="text-[13px] font-semibold">3 aset terpilih</span>
          <span className="text-[12px] text-[#a5a8b5]">
            6 unit &middot; Rp 41.469.000
          </span>
          <div className="ml-auto flex gap-[7px]">
            {["Ubah kondisi", "Mutasi", "Export terpilih"].map((label) => (
              <span
                key={label}
                className="flex h-8 items-center rounded-full bg-white px-[14px] text-[12.5px] font-semibold text-[#1c1c1e]"
              >
                {label}
              </span>
            ))}
            <span className="flex h-8 items-center rounded-full border border-white/35 px-[14px] text-[12.5px] font-semibold">
              Hapus
            </span>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#eef0f3] bg-white">
          <div className="min-w-[1000px]">
            <div
              className={`grid h-10 ${tableColumns} items-center gap-[9px] border-b border-[#e0e2e8] bg-[#f7f8fa] px-[18px] text-[10.5px] font-semibold tracking-[0.4px] text-[#6b6f7e] uppercase`}
            >
              <CheckBox />
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
            {assets.map((asset) => (
              <AssetRow key={asset.code} asset={asset} />
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

function AssetRow({ asset }: { asset: Asset }) {
  return (
    <div
      className={`grid h-14 ${tableColumns} items-center gap-[9px] border-b border-[#eef0f3] px-[18px] last:border-b-0 ${asset.selected ? "bg-[#f5f3ff]" : "bg-white"}`}
    >
      <CheckBox selected={asset.selected} />
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

function CheckBox({ selected = false }: { selected?: boolean }) {
  return (
    <span
      className={`grid size-4 place-items-center rounded-[4px] border text-[10px] ${selected ? "border-[#4262ff] bg-[#4262ff] text-white" : "border-[#c7cad5] bg-white"}`}
    >
      {selected && "✓"}
    </span>
  )
}

function Pill({
  children,
  active = false,
  className = "",
}: {
  children: ReactNode
  active?: boolean
  className?: string
}) {
  return (
    <span
      className={`flex h-[34px] items-center gap-[6px] rounded-full border px-[15px] text-[12.5px] font-semibold ${active ? "border-[#1c1c1e] bg-[#1c1c1e] text-white" : "border-[#e0e2e8] bg-white text-[#555a6a]"} ${className}`}
    >
      {children}
    </span>
  )
}

function ActiveFilter({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-[34px] items-center gap-2 rounded-full bg-[#1c1c1e] px-[13px] text-[12.5px] font-semibold text-white">
      {children}
      <span className="opacity-60">&times;</span>
    </span>
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
