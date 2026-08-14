
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
    <div className="w-full space-y-6 max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8 text-[#1C1C1E]">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Cari kode, nama barang, merek, keterangan..."
            className="w-full rounded-2xl border border-neutral-200 bg-white py-2.5 pl-4 pr-10 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-xs font-medium border border-neutral-200 rounded-xl bg-white hover:bg-neutral-50 shadow-sm transition">
            Export
          </button>

          <button className="px-4 py-2 text-xs font-medium border border-neutral-200 rounded-xl bg-white hover:bg-neutral-50 shadow-sm transition">
            Import Excel
          </button>
          <button className="px-4 py-2 text-xs font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 shadow-sm transition">
            + Tambah Aset
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Selamat pagi, Rizky</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Data per 5 Agustus 2026, 09.14 • sumber migrasi Excel GA
        </p>
      </div>

      <DashboardStats />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <CategoryBarChart data={categoryData} />
        <ConditionDonutChart data={conditionData} />
        <BrandProgressBar 
          data={brandData} 
          note="41 aset belum punya merek — rekap klaim garansi masih belum lengkap." 
        />
      </div>

      <RecentActivityTable />

    </div>
  )
}