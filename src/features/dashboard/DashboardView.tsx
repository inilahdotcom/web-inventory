import { DashboardStats } from './components/DashboardStats'
import { RecentActivityTable } from './components/RecentActivityTable'
import { CategoryBarChart } from './components/charts/CategoryBarChart'
import { ConditionDonutChart } from './components/charts/ConditionDonutChart'
import { BrandProgressBar } from './components/charts/BrandProgressBar'

const categoryData = [
  { name: 'Komputer & Laptop', total: 38 },
  { name: 'Perangkat Jaringan', total: 24 },
  { name: 'Broadcast & Audio', total: 18 },
  { name: 'Kamera & Lighting', total: 13 },
  { name: 'Elektronik Kantor', total: 9 },
  { name: 'Furniture', total: 7 },
  { name: 'Handphone', total: 4 },
  { name: 'Server', total: 2 },
]

const conditionData = [
  { name: 'Bagus', value: 84, color: '#14B8A6' },
  { name: 'Rusak Ringan', value: 7, color: '#FBBF24' },
  { name: 'Rusak Berat', value: 3, color: '#F87171' },
  { name: 'Hilang', value: 1, color: '#9CA3AF' },
]

const brandData = [
  { brand: 'LENOVO', count: 14, pct: 100 },
  { brand: 'APPLE', count: 9, pct: 65 },
  { brand: 'NETGEAR', count: 7, pct: 50 },
  { brand: 'MSI', count: 6, pct: 42 },
  { brand: 'ASUS', count: 5, pct: 35 },
  { brand: 'EPSON', count: 4, pct: 28 },
  { brand: 'SAMSUNG', count: 3, pct: 21 },
]

export function DashboardView() {
  return (
    <div className="w-full text-[#1C1C1E]">
      <header className="sticky top-0 z-10 w-full border-b border-neutral-200 bg-white px-3 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4">

          <div className="flex flex-1 items-center max-w-md pl-14 lg:pl-0">
            <div className="relative w-full">
              <svg
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Cari kode, nama barang, merek, keterangan..."
                className="w-full rounded-2xl border border-neutral-200 bg-white py-2 pl-9 pr-3 text-xs shadow-2xs focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            <button className="hidden rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-900 shadow-2xs transition hover:bg-neutral-50 sm:inline-flex cursor-pointer">
              Export
            </button>

            <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-xs font-medium text-neutral-600 shadow-2xs transition hover:bg-neutral-50 cursor-pointer">
              ?
            </button>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600 select-none">
              RS
            </div>
          </div>

        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-12 pt-6 sm:px-6 lg:px-8">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Selamat pagi, Rizky
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              Data per 5 Agustus 2026, 09.14 • sumber migrasi Excel GA
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button className="rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-900 shadow-2xs transition hover:bg-neutral-50 cursor-pointer">
              Import Excel
            </button>

            <button className="rounded-2xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-neutral-800 cursor-pointer">
              + Tambah Aset
            </button>
          </div>
        </div>

        <DashboardStats />

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
          <CategoryBarChart data={categoryData} />
          <ConditionDonutChart data={conditionData} />
          <BrandProgressBar
            data={brandData}
            note="41 aset belum punya merek — rekap klaim garansi masih belum lengkap."
          />
        </div>

        <RecentActivityTable />

      </main>
    </div>
  )
}