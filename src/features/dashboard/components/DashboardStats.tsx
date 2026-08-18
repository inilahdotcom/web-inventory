
export interface MainAssetStat {
  totalValue: number
  filledCount: number
  totalCount: number
}

// Interface Mini Stats
export interface MiniStatItem {
  label: string
  value: number | string
  subtext: string
}

export interface ActionRequiredItem {
  code: string
  name: string
  qty: string
}

export interface ActionRequiredAlert {
  formCode: string
  description: string
  items: ActionRequiredItem[]
}

const DEFAULT_MAIN_STAT: MainAssetStat = {
  totalValue: 1421870000,
  filledCount: 33,
  totalCount: 95,
}

const DEFAULT_MINI_STATS: MiniStatItem[] = [
  { label: 'Jenis aset', value: 84, subtext: '11 kandidat duplikat' },
  { label: 'Total unit', value: 213, subtext: 'Unit • Pos • Set' },
  { label: 'Tanpa foto', value: 95, subtext: 'Kolom FOTO kosong' },
]

const DEFAULT_ALERT: ActionRequiredAlert = {
  formCode: 'FR-006',
  description: 'Keterangan mencatat "1 Unit Rusak", tetapi kondisi masih tercatat Bagus.',
  items: [
    { code: '853/INC-GA/1/26', name: 'CPU Redaksi Lantai 3', qty: '4 Unit' },
    { code: '854/INC-GA/1/26', name: 'Monitor Redaksi', qty: '8 Unit' },
  ],
}

interface DashboardStatsProps {
  mainStat?: MainAssetStat
  miniStats?: MiniStatItem[]
  alertData?: ActionRequiredAlert
  onCompletePricesClick?: () => void
  onActionClick?: (itemCode: string) => void
}

export function DashboardStats({
  mainStat = DEFAULT_MAIN_STAT,
  miniStats = DEFAULT_MINI_STATS,
  alertData = DEFAULT_ALERT,
  onCompletePricesClick,
  onActionClick,
}: DashboardStatsProps) {
  const remainingCount = mainStat.totalCount - mainStat.filledCount

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      <div className="lg:col-span-2 rounded-3xl bg-[#FFD02C] p-6 shadow-sm flex flex-col justify-between space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-800">
            TOTAL NILAI ASET TERCATAT
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mt-2">
            {formatRupiah(mainStat.totalValue)}
          </h2>
          <hr className="border-neutral-900/10 my-4" />
          <p className="text-xs text-neutral-800 leading-relaxed">
            Baru <strong className="font-bold">{mainStat.filledCount} dari {mainStat.totalCount} aset</strong> punya harga perolehan. Angka ini akan berubah saat {remainingCount} aset sisanya dilengkapi.
          </p>
        </div>
        <button
          onClick={onCompletePricesClick}
          className="w-fit px-4 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition cursor-pointer"
        >
          Lengkapi {remainingCount} harga →
        </button>
      </div>
      <div className="space-y-4 flex flex-col justify-between">
        <div className="grid grid-cols-3 gap-3">
          {miniStats.map((stat, idx) => (
            <div key={idx} className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-sm">
              <p className="text-[10px] text-neutral-400 font-medium">{stat.label}</p>
              <p className="text-xl font-bold text-neutral-900 mt-1">{stat.value}</p>
              <p className="text-[9px] text-neutral-400 mt-0.5">{stat.subtext}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-900 text-white rounded-md">
              Perlu tindakan
            </span>
            <span className="text-[11px] text-rose-800 font-medium">
              {alertData.items.length} aset • {alertData.formCode}
            </span>
          </div>

          <p className="text-xs font-semibold text-rose-900">
            {alertData.description}
          </p>

          <div className="space-y-1.5 pt-1">
            {alertData.items.map((item) => (
              <div key={item.code} className="flex justify-between items-center text-[11px] bg-white/60 p-2 rounded-xl">
                <span className="font-mono text-neutral-700">
                  {item.code} <span className="font-sans text-neutral-500">{item.name} - {item.qty}</span>
                </span>
                <button
                  onClick={() => onActionClick?.(item.code)}
                  className="text-rose-600 font-semibold hover:underline cursor-pointer"
                >
                  Pecah record →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}