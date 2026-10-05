export interface MainAssetStat {
  totalValue: number
  filledCount: number
  totalCount: number
}

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

// Interface Backend Go
export interface BackendSummary {
  total_asset_types: number
  total_quantity: number
  total_asset_value: number
  total_damaged: number
  filled_price_count?: number
}

export interface BackendAlertAsset {
  id: string
  asset_code: string
  name: string
  condition: string
  status: string
}

interface DashboardStatsProps {
  summary?: BackendSummary
  alertAssets?: BackendAlertAsset[]
  mainStat?: MainAssetStat
  miniStats?: MiniStatItem[]
  alertData?: ActionRequiredAlert
  lastUpdated?: string
  sourceInfo?: string
  onCompletePricesClick?: () => void
  onActionClick?: (itemCode: string) => void
}

export function DashboardStats({
  summary,
  alertAssets = [],
  mainStat,
  miniStats,
  alertData,
  lastUpdated,
  sourceInfo = "sumber migrasi Excel GA",
  onCompletePricesClick,
  onActionClick,
}: DashboardStatsProps) {
  // Hitung data dinamis murni dari API
  const totalCount = summary?.total_asset_types ?? mainStat?.totalCount ?? 0
  const filledCount = summary?.filled_price_count ?? mainStat?.filledCount ?? 0
  const totalValue = summary?.total_asset_value ?? mainStat?.totalValue ?? 0

  // Sisa aset yang belum diisi harganya
  const remainingCount = Math.max(0, totalCount - filledCount)

  // Hitung persentase untuk Progress Bar
  const progressPercentage =
    totalCount > 0 ? (filledCount / totalCount) * 100 : 0

  // Tanggal otomatis realtime jika prop lastUpdated tidak dikirim
  const formattedLastUpdated =
    lastUpdated ||
    new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long", // Dibereskan: 'long' dengan l kecil (bukan 'Long')
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date())

  const displayMiniStats: MiniStatItem[] = miniStats || [
    {
      label: "Jenis aset",
      value: summary?.total_asset_types ?? 0,
      subtext: "Kategori terdaftar",
    },
    {
      label: "Total unit",
      value: summary?.total_quantity ?? 0,
      subtext: "Unit terdata",
    },
    {
      label: "Aset Rusak",
      value: summary?.total_damaged ?? 0,
      subtext: "Kondisi rusak/diperbaiki",
    },
  ]

  const displayAlert: ActionRequiredAlert = alertData || {
    formCode: "FR-006",
    description:
      alertAssets.length > 0
        ? `Terdapat ${alertAssets.length} aset dengan status kondisi rusak atau dalam perbaikan.`
        : "Semua aset tercatat dalam kondisi baik.",
    items: alertAssets.map((a) => ({
      code: a.asset_code || a.id.substring(0, 8),
      name: a.name || "Aset Tanpa Nama",
      qty: a.condition,
    })),
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    })
      .format(val)
      .replace("IDR", "Rp")
  }

  return (
    <div className="flex flex-col space-y-2">
      {/* 1. Teks Metadata Atas */}
      <p className="text-[11px] text-neutral-400">
        Data per {formattedLastUpdated} &bull; {sourceInfo}
      </p>

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        {/* Kartu Total Nilai Aset (Kuning) */}
        <div className="flex flex-col justify-between space-y-6 rounded-3xl bg-[#FFD02C] p-6 shadow-sm lg:col-span-2">
          <div>
            <p className="text-[11px] font-bold tracking-wider text-neutral-800 uppercase">
              TOTAL NILAI ASET TERCATAT
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
              {formatRupiah(totalValue)}
            </h2>

            {/* Custom Progress Bar */}
            <div className="my-4 h-2 w-full overflow-hidden rounded-full bg-neutral-900/15">
              <div
                className="h-full rounded-full bg-neutral-900 transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <p className="text-xs leading-relaxed text-neutral-800">
              Baru{" "}
              <strong className="font-bold">
                {filledCount} dari {totalCount} aset
              </strong>{" "}
              punya harga perolehan.
              {remainingCount > 0
                ? ` Angka ini akan berubah saat ${remainingCount} aset sisanya dilengkapi.`
                : " Seluruh harga perolehan aset telah lengkap."}
            </p>
          </div>

          {remainingCount > 0 && (
            <button
              onClick={onCompletePricesClick}
              className="w-fit cursor-pointer rounded-full bg-neutral-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-neutral-800"
            >
              Lengkapi {remainingCount} harga →
            </button>
          )}
        </div>

        {/* Mini Stats & Alert Box */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="grid shrink-0 grid-cols-3 gap-3">
            {displayMiniStats.map((stat, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-sm"
              >
                <p className="text-[10px] font-medium text-neutral-400">
                  {stat.label}
                </p>
                <p className="mt-1 text-xl font-bold text-neutral-900">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[9px] text-neutral-400">
                  {stat.subtext}
                </p>
              </div>
            ))}
          </div>

          {/* Box Perlu Tindakan */}
          <div className="flex max-h-52.5 flex-col justify-between space-y-2 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="shrink-0 rounded-md bg-rose-900 px-2 py-0.5 text-[10px] font-bold text-white">
                  Perlu tindakan
                </span>
                <span className="truncate text-[11px] font-medium text-rose-800">
                  {displayAlert.items.length} aset &bull;{" "}
                  {displayAlert.formCode}
                </span>
              </div>

              <p className="mt-1.5 text-xs font-semibold text-rose-900">
                {displayAlert.description}
              </p>
            </div>

            {/* List Aset */}
            {displayAlert.items.length > 0 && (
              <div className="max-h-27.5 space-y-1.5 overflow-y-auto pr-1">
                {displayAlert.items.map((item) => (
                  <div
                    key={item.code}
                    className="flex items-center justify-between rounded-xl border border-rose-100/50 bg-white/70 p-2 text-[11px]"
                  >
                    <span
                      className="max-w-42.5 truncate font-mono text-neutral-700"
                      title={`${item.code} ${item.name}`}
                    >
                      {item.code}{" "}
                      <span className="font-sans text-neutral-500">
                        ({item.qty})
                      </span>
                    </span>
                    <button
                      onClick={() => onActionClick?.(item.code)}
                      className="ml-2 shrink-0 cursor-pointer text-[10px] font-semibold text-rose-600 hover:underline"
                    >
                      Pecah record →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
