import { useMemo, useState, type ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { reportService } from "@/services/reportService"
import {
  createExportTable,
  exportExcel,
  exportPdf,
  type ExportTable,
} from "../report-export"
import type {
  CategoryReportRow,
  ReportFilters,
  ReportTab,
} from "@/types/report"

const tabs: ReportTab[] = [
  "Rekap per kategori",
  "Aset rusak",
  "Per lokasi & pemegang",
  "Mutasi aset",
]
const number = (value: number) => new Intl.NumberFormat("id-ID").format(value)

type PeriodOption = {
  value: string
  label: string
  dateFrom?: string
  dateTo?: string
}

const allPeriod: PeriodOption = { value: "all", label: "Semua" }
const monthLabel = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

function createPeriodOptions(dates: string[]): PeriodOption[] {
  const months = new Set(
    dates.flatMap((date) => {
      const match = /^(\d{4})-(\d{2})/.exec(date)
      return match ? [`${match[1]}-${match[2]}`] : []
    })
  )

  return [
    allPeriod,
    ...Array.from(months)
      .sort((left, right) => right.localeCompare(left))
      .map((value) => {
        const [year, month] = value.split("-").map(Number)
        const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
        return {
          value,
          label: monthLabel.format(new Date(Date.UTC(year, month - 1, 1))),
          dateFrom: `${value}-01`,
          dateTo: `${value}-${String(lastDay).padStart(2, "0")}`,
        }
      }),
  ]
}

function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404)
      return "Endpoint laporan belum tersedia di BE yang sedang berjalan."
    const data = error.response?.data as
      { message?: string; error?: string } | undefined
    return data?.message || data?.error || "Gagal memuat laporan dari server."
  }
  return error instanceof Error
    ? error.message
    : "Gagal memuat laporan dari server."
}

export function AssetReportView() {
  const [activeTab, setActiveTab] = useState<ReportTab>(tabs[0])
  const [period, setPeriod] = useState(allPeriod.value)
  const [location, setLocation] = useState("Semua")
  const [notice, setNotice] = useState("")
  const [exporting, setExporting] = useState(false)
  const locationsQuery = useQuery({
    queryKey: ["report-locations"],
    queryFn: reportService.locations,
  })
  const periodsQuery = useQuery({
    queryKey: ["report-periods", activeTab],
    queryFn: ({ signal }) => reportService.periodDates(activeTab, signal),
  })
  const periods = useMemo(
    () => createPeriodOptions(periodsQuery.data ?? []),
    [periodsQuery.data]
  )
  const selectedPeriod =
    periods.find((item) => item.value === period) ?? allPeriod

  const locations = locationsQuery.data ?? []
  const locationId = locations.find((item) => item.name === location)?.id
  const filters: ReportFilters = {
    dateFrom: selectedPeriod.dateFrom,
    dateTo: selectedPeriod.dateTo,
    locationId,
  }
  const reportQuery = useQuery({
    queryKey: [
      "report",
      activeTab,
      filters.dateFrom,
      filters.dateTo,
      locationId,
    ],
    queryFn: ({ signal }) => reportService.get(activeTab, filters, signal),
  })
  const data = reportQuery.data ?? []
  const table = createExportTable(activeTab, data)

  const handleExport = async (format: "excel" | "pdf") => {
    if (exporting || !reportQuery.isSuccess) return
    setExporting(true)
    setNotice("")
    try {
      if (format === "excel")
        await exportExcel(table, activeTab, selectedPeriod.label, location)
      else await exportPdf(table, activeTab, selectedPeriod.label, location)
    } catch (error) {
      setNotice(errorMessage(error))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-svh bg-[#f7f8fa] text-[#1c1c1e]">
      <header className="sticky top-0 z-10 flex min-h-16 items-center gap-3 overflow-x-auto border-b border-[#e0e2e8] bg-white py-3 pr-4 pl-16 lg:px-6">
        <div className="flex min-w-max gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                if (tab !== activeTab) setPeriod(allPeriod.value)
                setActiveTab(tab)
              }}
              className={`h-8 rounded-full px-3.5 text-xs font-semibold transition ${activeTab === tab ? "bg-[#1c1c1e] text-white" : "border border-[#e0e2e8] bg-white text-[#555a6a]"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="ml-auto flex min-w-max gap-2">
          <ActionButton
            disabled={exporting || !reportQuery.isSuccess}
            onClick={() => void handleExport("excel")}
          >
            Export Excel
          </ActionButton>
          <ActionButton
            dark
            disabled={exporting || !reportQuery.isSuccess}
            onClick={() => void handleExport("pdf")}
          >
            Export PDF
          </ActionButton>
        </div>
      </header>

      <main className="flex flex-col gap-4.5 px-4 py-6 sm:px-7">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {table.title}
            </h1>
            <p className="mt-1 text-sm text-[#6b6f7e]">
              Periode: {period === allPeriod.value ? "seluruh data" : selectedPeriod.label} ·
              dihitung ulang &lt; 10 detik (G-04)
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:ml-auto">
            <FilterSelect
              value={selectedPeriod.value}
              onChange={setPeriod}
              label="Periode"
              options={periods}
            />
            <FilterSelect
              value={location}
              onChange={setLocation}
              label="Lokasi"
              options={[
                { value: "Semua", label: "Semua" },
                ...locations.map((item) => ({
                  value: item.name,
                  label: item.name,
                })),
              ]}
            />
          </div>
        </section>
        {(notice || reportQuery.isError || locationsQuery.isError || periodsQuery.isError) && (
          <Notice onClose={() => setNotice("")}>
            {notice ||
              (reportQuery.isError
                ? errorMessage(reportQuery.error)
                : locationsQuery.isError
                  ? "Pilihan lokasi gagal dimuat dari server."
                  : "Pilihan periode gagal dimuat dari server.")}
          </Notice>
        )}
        <section className="grid items-start gap-4.5 xl:grid-cols-[minmax(0,1fr)_21.25rem]">
          {reportQuery.isLoading ? (
            <ReportState>Memuat laporan...</ReportState>
          ) : reportQuery.isError ? (
            <ReportState>Laporan tidak dapat ditampilkan.</ReportState>
          ) : activeTab === "Rekap per kategori" ? (
            <CategoryTable rows={data as CategoryReportRow[]} />
          ) : (
            <DataTable table={table} />
          )}
          <aside className="flex flex-col gap-4.5">
            <PdfPreview />
            <CompletenessNote table={table} />
          </aside>
        </section>
      </main>
    </div>
  )
}

type Totals = { types: number; units: number; value: number; priced: number }
function CategoryTable({ rows }: { rows: CategoryReportRow[] }) {
  const totals = rows.reduce(
    (current, row) => ({
      types: current.types + row.assetTypes,
      units: current.units + row.units,
      value: current.value + row.totalValue,
      priced: current.priced + row.pricedAssetTypes,
    }),
    { types: 0, units: 0, value: 0, priced: 0 }
  )
  const completeness = totals.types
    ? Math.round((totals.priced * 100) / totals.types)
    : 0
  return (
    <section className="overflow-hidden rounded-2xl border border-[#eef0f3] bg-white">
      <div className="hidden min-w-180 grid-cols-[1fr_5.625rem_6.875rem_9.375rem_8.125rem] gap-3.5 border-b border-[#e0e2e8] bg-[#f7f8fa] px-5 py-3 text-[10.5px] font-semibold tracking-wide text-[#6b6f7e] uppercase md:grid">
        <span>Kategori</span>
        <span className="text-right">Jenis</span>
        <span className="text-right">Unit</span>
        <span className="text-right">Total nilai</span>
        <span className="text-right">Kelengkapan</span>
      </div>
      <div className="hidden md:block">
        {rows.map((row) => (
          <CategoryRow key={row.id ?? row.name} row={row} />
        ))}
        {rows.length === 0 && <EmptyRows />}
        <TotalRow totals={totals} completeness={completeness} />
      </div>
      <div className="space-y-3 p-3 md:hidden">
        {rows.map((row) => (
          <CategoryCard key={row.id ?? row.name} row={row} />
        ))}
        {rows.length === 0 && <EmptyRows />}
        <TotalCard totals={totals} completeness={completeness} />
      </div>
    </section>
  )
}
function CategoryRow({ row }: { row: CategoryReportRow }) {
  return (
    <div className="grid min-w-180 grid-cols-[1fr_5.625rem_6.875rem_9.375rem_8.125rem] items-center gap-3.5 border-b border-[#eef0f3] px-5 py-4">
      <span className="text-sm font-semibold">{row.name}</span>
      <Mono>{number(row.assetTypes)}</Mono>
      <Mono>{number(row.units)}</Mono>
      <Mono>{number(row.totalValue)}</Mono>
      <span className="text-right">
        <Completion value={row.priceCompletenessPercent} />
      </span>
    </div>
  )
}
function TotalRow({
  totals,
  completeness,
}: {
  totals: Totals
  completeness: number
}) {
  return (
    <div className="grid min-w-180 grid-cols-[1fr_5.625rem_6.875rem_9.375rem_8.125rem] items-center gap-3.5 bg-[#1c1c1e] px-5 py-4 text-white">
      <span className="text-sm font-semibold">Total</span>
      <Mono>{number(totals.types)}</Mono>
      <Mono>{number(totals.units)}</Mono>
      <Mono yellow>{number(totals.value)}</Mono>
      <span className="text-right">
        <span className="rounded-full bg-[#ffd02f] px-2.5 py-1 text-xs font-semibold text-[#1c1c1e]">
          {completeness}%
        </span>
      </span>
    </div>
  )
}
function CategoryCard({ row }: { row: CategoryReportRow }) {
  return (
    <article className="rounded-xl border border-[#eef0f3] p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold">{row.name}</h2>
        <Completion value={row.priceCompletenessPercent} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-[#6b6f7e]">
        <Metric label="Jenis" value={number(row.assetTypes)} />
        <Metric label="Unit" value={number(row.units)} />
        <Metric label="Total nilai" value={number(row.totalValue)} />
      </div>
    </article>
  )
}
function TotalCard({
  totals,
  completeness,
}: {
  totals: Totals
  completeness: number
}) {
  return (
    <article className="rounded-xl bg-[#1c1c1e] p-4 text-white">
      <div className="flex justify-between">
        <span className="font-semibold">Total</span>
        <span className="rounded-full bg-[#ffd02f] px-2.5 py-1 text-xs font-semibold text-[#1c1c1e]">
          {completeness}%
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
        <Metric label="Jenis" value={number(totals.types)} dark />
        <Metric label="Unit" value={number(totals.units)} dark />
        <Metric label="Total nilai" value={number(totals.value)} yellow />
      </div>
    </article>
  )
}
function DataTable({ table }: { table: ExportTable }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#eef0f3] bg-white">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-180 text-left">
          <thead className="border-b border-[#e0e2e8] bg-[#f7f8fa] text-[10.5px] font-semibold tracking-wide text-[#6b6f7e] uppercase">
            <tr>
              {table.columns.map((column) => (
                <th key={column} className="px-5 py-3 whitespace-nowrap">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, index) => (
              <tr key={index} className="border-b border-[#eef0f3]">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`px-5 py-4 text-sm ${typeof cell === "number" ? "text-right font-mono" : cellIndex === 0 ? "font-semibold" : "text-[#6b6f7e]"}`}
                  >
                    {typeof cell === "number" ? number(cell) : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 p-3 md:hidden">
        {table.rows.map((row, index) => (
          <article
            key={index}
            className="rounded-xl border border-[#eef0f3] p-4"
          >
            <h2 className="text-sm font-semibold">{String(row[0])}</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {row.slice(1).map((cell, cellIndex) => (
                <Metric
                  key={table.columns[cellIndex + 1]}
                  label={table.columns[cellIndex + 1]}
                  value={typeof cell === "number" ? number(cell) : cell}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
      {table.rows.length === 0 && <EmptyRows />}
    </section>
  )
}
function ReportState({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#eef0f3] bg-white p-6 text-sm text-[#6b6f7e]">
      {children}
    </section>
  )
}
function EmptyRows() {
  return (
    <div className="px-5 py-8 text-center text-sm text-[#8e91a0]">
      Tidak ada data untuk filter ini.
    </div>
  )
}
function Metric({
  label,
  value,
  dark,
  yellow,
}: {
  label: string
  value: string
  dark?: boolean
  yellow?: boolean
}) {
  return (
    <span>
      <span
        className={`block text-xs ${dark ? "text-[#a5a8b5]" : "text-[#8e91a0]"}`}
      >
        {label}
      </span>
      <span
        className={`mt-1 block font-mono text-xs ${yellow ? "text-[#ffd02f]" : ""}`}
      >
        {value}
      </span>
    </span>
  )
}
function Mono({ children, yellow }: { children: ReactNode; yellow?: boolean }) {
  return (
    <span
      className={`text-right font-mono text-sm ${yellow ? "text-[#ffd02f]" : ""}`}
    >
      {children}
    </span>
  )
}
function Completion({ value }: { value: number }) {
  const tone =
    value >= 70
      ? "bg-[#c3faf5] text-[#187574]"
      : value >= 30
        ? "bg-[#fff8e0] text-[#746019]"
        : "bg-[#ffc6c6] text-[#600000]"
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {number(value)}%
    </span>
  )
}

function PdfPreview() {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-[#eef0f3] bg-white p-5">
      <h2 className="text-base font-semibold">Pratinjau PDF</h2>
      <div className="flex flex-col gap-3 rounded-lg border border-[#e0e2e8] bg-[#fafbfc] p-3.5">
        <div className="flex items-center gap-2.5 border-b border-[#e0e2e8] pb-2.5">
          <span className="grid size-6 place-items-center rounded-md bg-[#ffd02f] text-[10px] font-bold">
            GA
          </span>
          <span>
            <span className="block text-[10px] font-semibold">
              PT. INDONESIA NEWS CENTER
            </span>
            <span className="block text-[9px] text-[#6b6f7e]">
              Laporan Rekap Aset — General Affairs
            </span>
          </span>
        </div>
        <div className="space-y-1">
          <Line />
          <Line width="w-[92%]" />
          <Line width="w-[96%]" />
          <Line width="w-[88%]" />
          <Line width="w-[94%]" />
        </div>
        <div className="grid grid-cols-2 gap-3.5 pt-2">
          <Signature label="Dibuat oleh" value="Staff GA" />
          <Signature label="Disetujui" value="Kepala GA" />
        </div>
      </div>
      <p className="text-xs leading-relaxed text-[#8e91a0]">
        Kop perusahaan dan kolom tanda tangan disertakan sesuai FR-I07.
      </p>
    </section>
  )
}
function Line({ width = "w-full" }: { width?: string }) {
  return <span className={`block h-1.5 rounded-sm bg-[#eef0f3] ${width}`} />
}
function Signature({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span className="block text-[9px] text-[#8e91a0]">{label}</span>
      <span className="mt-2 block h-5 border-b border-[#c7cad5]" />
      <span className="mt-1 block text-[9px] text-[#6b6f7e]">{value}</span>
    </span>
  )
}
function CompletenessNote({ table }: { table: ExportTable }) {
  return (
    <section className="flex flex-col gap-2 rounded-2xl bg-[#ffc6c6] p-5">
      <h2 className="text-base font-semibold text-[#600000]">
        Catatan kelengkapan data
      </h2>
      <p className="text-xs leading-relaxed text-[#600000]">
        {table.assetCount === undefined
          ? "Laporan mutasi tidak memuat nilai aset. Data disajikan sesuai periode dan lokasi yang dipilih."
          : `Total nilai hanya menghitung ${number(table.pricedCount ?? 0)} aset yang punya harga. Setiap laporan nilai aset menyertakan persentase kelengkapan agar angka tidak dibaca sebagai nilai penuh inventaris.`}
      </p>
    </section>
  )
}
function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex h-9 items-center gap-1 rounded-full border border-[#c7cad5] bg-white px-3.5 text-xs font-semibold"
      >
        {label}: {options.find((option) => option.value === value)?.label ?? value}
        <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="absolute top-10 right-0 z-20 min-w-full overflow-hidden rounded-xl border border-[#e0e2e8] bg-white p-1 shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={`block w-full rounded-lg px-3 py-2 text-left text-xs ${option.value === value ? "bg-[#1c1c1e] text-white" : "hover:bg-[#f7f8fa]"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
function ActionButton({
  children,
  onClick,
  dark = false,
  disabled = false,
}: {
  children: ReactNode
  onClick: () => void
  dark?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 items-center rounded-full px-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${dark ? "bg-[#1c1c1e] text-white" : "border border-[#c7cad5] bg-white"}`}
    >
      {children}
    </button>
  )
}
function Notice({
  children,
  onClose,
}: {
  children: ReactNode
  onClose: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="w-fit rounded-lg bg-[#ffc6c6] px-4 py-3 text-left text-sm text-[#600000]"
    >
      {children} ×
    </button>
  )
}
