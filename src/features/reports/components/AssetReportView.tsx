import { useState, type ReactNode } from "react"

type ReportTab = "Rekap per kategori" | "Aset rusak" | "Per lokasi & pemegang" | "Mutasi aset"

type CategoryRow = {
  name: string
  types: string
  units: string
  value: string
  completeness: string
  tone: "good" | "warning" | "danger"
}

const tabs: ReportTab[] = ["Rekap per kategori", "Aset rusak", "Per lokasi & pemegang", "Mutasi aset"]

const rows: CategoryRow[] = [
  { name: "Komputer & Laptop", types: "38", units: "61", value: "742.310.000", completeness: "71%", tone: "good" },
  { name: "Perangkat Jaringan", types: "24", units: "39", value: "311.940.000", completeness: "42%", tone: "warning" },
  { name: "Peralatan Broadcast & Audio", types: "18", units: "27", value: "218.500.000", completeness: "33%", tone: "warning" },
  { name: "Peralatan Kamera & Lighting", types: "13", units: "21", value: "102.720.000", completeness: "15%", tone: "danger" },
  { name: "Elektronik Kantor", types: "9", units: "34", value: "37.400.000", completeness: "22%", tone: "danger" },
  { name: "Furniture & Peralatan Umum", types: "7", units: "31", value: "9.000.000", completeness: "14%", tone: "danger" },
]

export function AssetReportView() {
  const [activeTab, setActiveTab] = useState<ReportTab>(tabs[0])
  const [period, setPeriod] = useState("Semua")
  const [location, setLocation] = useState("Semua")
  const [notice, setNotice] = useState("")

  const title = activeTab === "Rekap per kategori" ? "Rekap aset per kategori" : activeTab

  return (
    <div className="min-h-svh bg-[#f7f8fa] text-[#1c1c1e]">
      <header className="sticky top-0 z-10 flex min-h-16 items-center gap-3 overflow-x-auto border-b border-[#e0e2e8] bg-white py-3 pr-4 pl-16 lg:px-6">
        <div className="flex min-w-max gap-2">
          {tabs.map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`h-8 rounded-full px-3.5 text-xs font-semibold transition ${activeTab === tab ? "bg-[#1c1c1e] text-white" : "border border-[#e0e2e8] bg-white text-[#555a6a]"}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="ml-auto flex min-w-max gap-2">
          <ActionButton onClick={() => setNotice("Export Excel disiapkan (simulasi).")}>Export Excel</ActionButton>
          <ActionButton dark onClick={() => setNotice("Export PDF disiapkan (simulasi).")}>Export PDF</ActionButton>
        </div>
      </header>

      <main className="flex flex-col gap-4.5 px-4 py-6 sm:px-7">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-[#6b6f7e]">Periode: seluruh data · dihitung ulang &lt; 10 detik (G-04)</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:ml-auto">
            <FilterSelect value={period} onChange={setPeriod} label="Periode" options={["Semua", "Agustus 2026", "Juli 2026"]} />
            <FilterSelect value={location} onChange={setLocation} label="Lokasi" options={["Semua", "Redaksi L3", "Studio L2", "Server L2"]} />
          </div>
        </section>

        {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}

        <section className="grid items-start gap-4.5 xl:grid-cols-[minmax(0,1fr)_21.25rem]">
          <CategoryTable rows={rows} />
          <aside className="flex flex-col gap-4.5">
            <PdfPreview />
            <CompletenessNote />
          </aside>
        </section>
      </main>
    </div>
  )
}

function CategoryTable({ rows }: { rows: CategoryRow[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#eef0f3] bg-white">
      <div className="hidden min-w-[45rem] grid-cols-[1fr_5.625rem_6.875rem_9.375rem_8.125rem] gap-3.5 border-b border-[#e0e2e8] bg-[#f7f8fa] px-5 py-3 text-[10.5px] font-semibold tracking-wide text-[#6b6f7e] uppercase md:grid">
        <span>Kategori</span><span className="text-right">Jenis</span><span className="text-right">Unit</span><span className="text-right">Total nilai</span><span className="text-right">Kelengkapan</span>
      </div>
      <div className="hidden md:block">{rows.map((row) => <CategoryRow key={row.name} row={row} />)}<TotalRow /></div>
      <div className="space-y-3 p-3 md:hidden">{rows.map((row) => <CategoryCard key={row.name} row={row} />)}<TotalCard /></div>
    </section>
  )
}

function CategoryRow({ row }: { row: CategoryRow }) {
  return <div className="grid min-w-[45rem] grid-cols-[1fr_5.625rem_6.875rem_9.375rem_8.125rem] items-center gap-3.5 border-b border-[#eef0f3] px-5 py-4"><span className="text-sm font-semibold">{row.name}</span><Mono>{row.types}</Mono><Mono>{row.units}</Mono><Mono>{row.value}</Mono><span className="text-right"><Completion tone={row.tone}>{row.completeness}</Completion></span></div>
}

function TotalRow() {
  return <div className="grid min-w-[45rem] grid-cols-[1fr_5.625rem_6.875rem_9.375rem_8.125rem] items-center gap-3.5 bg-[#1c1c1e] px-5 py-4 text-white"><span className="text-sm font-semibold">Total</span><Mono>95</Mono><Mono>213</Mono><Mono yellow>1.421.870.000</Mono><span className="text-right"><span className="rounded-full bg-[#ffd02f] px-2.5 py-1 text-xs font-semibold text-[#1c1c1e]">35%</span></span></div>
}

function CategoryCard({ row }: { row: CategoryRow }) {
  return <article className="rounded-xl border border-[#eef0f3] p-4"><div className="flex items-start justify-between gap-3"><h2 className="text-sm font-semibold">{row.name}</h2><Completion tone={row.tone}>{row.completeness}</Completion></div><div className="mt-4 grid grid-cols-3 gap-3 text-xs text-[#6b6f7e]"><Metric label="Jenis" value={row.types} /><Metric label="Unit" value={row.units} /><Metric label="Total nilai" value={row.value} /></div></article>
}

function TotalCard() { return <article className="rounded-xl bg-[#1c1c1e] p-4 text-white"><div className="flex justify-between"><span className="font-semibold">Total</span><span className="rounded-full bg-[#ffd02f] px-2.5 py-1 text-xs font-semibold text-[#1c1c1e]">35%</span></div><div className="mt-3 grid grid-cols-3 gap-3 text-xs"><Metric label="Jenis" value="95" dark /><Metric label="Unit" value="213" dark /><Metric label="Total nilai" value="1.421.870.000" yellow /></div></article> }

function Metric({ label, value, dark, yellow }: { label: string; value: string; dark?: boolean; yellow?: boolean }) { return <span><span className={`block text-xs ${dark ? "text-[#a5a8b5]" : "text-[#8e91a0]"}`}>{label}</span><span className={`mt-1 block font-mono text-xs ${yellow ? "text-[#ffd02f]" : ""}`}>{value}</span></span> }
function Mono({ children, yellow }: { children: ReactNode; yellow?: boolean }) { return <span className={`text-right font-mono text-sm ${yellow ? "text-[#ffd02f]" : ""}`}>{children}</span> }
function Completion({ tone, children }: { tone: CategoryRow["tone"]; children: ReactNode }) { const toneClass = { good: "bg-[#c3faf5] text-[#187574]", warning: "bg-[#fff8e0] text-[#746019]", danger: "bg-[#ffc6c6] text-[#600000]" }[tone]; return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${toneClass}`}>{children}</span> }

function PdfPreview() { return <section className="flex flex-col gap-3 rounded-2xl border border-[#eef0f3] bg-white p-5"><h2 className="text-base font-semibold">Pratinjau PDF</h2><div className="flex flex-col gap-3 rounded-lg border border-[#e0e2e8] bg-[#fafbfc] p-3.5"><div className="flex items-center gap-2.5 border-b border-[#e0e2e8] pb-2.5"><span className="grid size-6 place-items-center rounded-md bg-[#ffd02f] text-[10px] font-bold">GA</span><span><span className="block text-[10px] font-semibold">PT. INDONESIA NEWS CENTER</span><span className="block text-[9px] text-[#6b6f7e]">Laporan Rekap Aset — General Affairs</span></span></div><div className="space-y-1"><Line /><Line width="w-[92%]" /><Line width="w-[96%]" /><Line width="w-[88%]" /><Line width="w-[94%]" /></div><div className="grid grid-cols-2 gap-3.5 pt-2"><Signature label="Dibuat oleh" value="Staff GA" /><Signature label="Disetujui" value="Kepala GA" /></div></div><p className="text-xs leading-relaxed text-[#8e91a0]">Kop perusahaan dan kolom tanda tangan disertakan sesuai FR-I07.</p></section> }
function Line({ width = "w-full" }: { width?: string }) { return <span className={`block h-1.5 rounded-sm bg-[#eef0f3] ${width}`} /> }
function Signature({ label, value }: { label: string; value: string }) { return <span><span className="block text-[9px] text-[#8e91a0]">{label}</span><span className="mt-2 block h-5 border-b border-[#c7cad5]" /><span className="mt-1 block text-[9px] text-[#6b6f7e]">{value}</span></span> }
function CompletenessNote() { return <section className="flex flex-col gap-2 rounded-2xl bg-[#ffc6c6] p-5"><h2 className="text-base font-semibold text-[#600000]">Catatan kelengkapan data</h2><p className="text-xs leading-relaxed text-[#600000]">Total nilai hanya menghitung 33 aset yang punya harga. Setiap laporan nilai aset menyertakan persentase kelengkapan agar angka tidak dibaca sebagai nilai penuh inventaris.</p></section> }
function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label className="flex h-9 items-center rounded-full border border-[#c7cad5] bg-white px-3.5 text-xs font-semibold"><span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="bg-transparent outline-none"><option value="Semua">{label}: Semua</option>{options.slice(1).map((option) => <option key={option}>{label}: {option}</option>)}</select></label> }
function ActionButton({ children, onClick, dark = false }: { children: ReactNode; onClick: () => void; dark?: boolean }) { return <button type="button" onClick={onClick} className={`flex h-9 items-center rounded-full px-3.5 text-sm font-semibold ${dark ? "bg-[#1c1c1e] text-white" : "border border-[#c7cad5] bg-white"}`}>{children}</button> }
function Notice({ children, onClose }: { children: ReactNode; onClose: () => void }) { return <button type="button" onClick={onClose} className="w-fit rounded-lg bg-[#c3faf5] px-4 py-3 text-left text-sm text-[#187574]">{children} ×</button> }
