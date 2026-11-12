import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { FileText, CameraOff, UserX, ClipboardCheck } from "lucide-react"

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

// Interface Backend Go yang sudah diperbarui dengan data kelengkapan (Task B2)
export interface BackendSummary {
  total_asset_types: number
  total_quantity: number
  total_asset_value: number
  total_damaged: number
  filled_price_count?: number
  missing_price_count?: number
  missing_photo_count?: number
  missing_holder_count?: number
  needs_inspection_count?: number
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
  const navigate = useNavigate()

  // Hitung data dinamis dari API
  const totalCount = summary?.total_asset_types ?? mainStat?.totalCount ?? 0
  const filledCount = summary?.filled_price_count ?? mainStat?.filledCount ?? 0
  const totalValue = summary?.total_asset_value ?? mainStat?.totalValue ?? 0

  const remainingCount = Math.max(0, totalCount - filledCount)
  const progressPercentage =
    totalCount > 0 ? (filledCount / totalCount) * 100 : 0

  const formattedLastUpdated =
    lastUpdated ||
    new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date())

  // Data Metrik Kualitas / Kelengkapan (Task B2)
  const missingPrice = summary?.missing_price_count ?? remainingCount
  const missingPhoto = summary?.missing_photo_count ?? 0
  const missingHolder = summary?.missing_holder_count ?? 0
  const needsInspection = summary?.needs_inspection_count ?? 0

  const completenessCards = [
    {
      title: "Tanpa Harga",
      count: missingPrice,
      label: "aset belum ada harga",
      icon: FileText,
      filter: "withoutPrice",
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      title: "Tanpa Foto",
      count: missingPhoto,
      label: "aset belum ada foto",
      icon: CameraOff,
      filter: "withoutPhoto",
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      title: "Tanpa Pemegang",
      count: missingHolder,
      label: "aset belum ada PJR",
      icon: UserX,
      filter: "withoutHolder",
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      title: "Perlu Inspection",
      count: needsInspection,
      label: "aset perlu dicek",
      icon: ClipboardCheck,
      filter: "needsAttention",
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
  ]

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

  const handleCompletenessCardClick = (filterType: string) => {
    navigate({
      to: "/asset",
      search: { filter: filterType },
    })
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* 1. Teks Metadata Atas */}
      <p className="text-[11px] text-muted-foreground">
        Data per {formattedLastUpdated} &bull; {sourceInfo}
      </p>

      {/* 2. Grid Utama Dashboard */}
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
            <Button
              variant="primary"
              size="sm"
              onClick={onCompletePricesClick}
              className="w-fit rounded-full"
            >
              Lengkapi {remainingCount} harga →
            </Button>
          )}
        </div>

        {/* Mini Stats & Alert Box */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="grid shrink-0 grid-cols-3 gap-3">
            {displayMiniStats.map((stat, idx) => (
              <Card key={idx} className="p-3.5">
                <p className="text-[10px] font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 text-xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[9px] text-muted-foreground">
                  {stat.subtext}
                </p>
              </Card>
            ))}
          </div>

          {/* Box Perlu Tindakan */}
          <Card className="flex max-h-52.5 flex-col justify-between space-y-2 border-rose-200 bg-rose-50/70 p-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="bg-rose-900 text-white">
                  Perlu tindakan
                </Badge>
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
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => onActionClick?.(item.code)}
                      className="ml-2 h-auto p-0 text-[10px] font-semibold text-rose-600 hover:underline"
                    >
                      Pecah record →
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* 3. Task B2: Kartu Kualitas & Kelengkapan Data */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
          Kualitas & Kelengkapan Data Inventaris
        </h3>
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          {completenessCards.map((card) => {
            const Icon = card.icon
            return (
              <Card
                key={card.filter}
                onClick={() => handleCompletenessCardClick(card.filter)}
                className={`group flex cursor-pointer flex-col justify-between border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${card.color}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{card.title}</span>
                  <Icon className="size-4 opacity-70 transition-transform group-hover:scale-110" />
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-extrabold tracking-tight">
                    {card.count}
                  </p>
                  <p className="mt-0.5 text-[11px] opacity-80">
                    {card.label} →
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
