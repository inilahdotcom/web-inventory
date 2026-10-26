import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ShieldAlert, RefreshCw } from "lucide-react"
import { usePermission } from "@/hooks/usePermission"
import { auditLogService } from "@/services/auditLogServices"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export interface AuditLogItem {
  id: string | number
  type:
    | "UPDATE"
    | "DELETE"
    | "CREATE"
    | "IMPORT"
    | "IMPORT_UPDATE"
    | "RESTORE"
    | "MOVE"
    | "SPLIT"
    | string
  user: {
    name: string
    role: string
    ip: string
  }
  timestamp: string
  target: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  description?: string
}

interface AuditLogViewProps {
  onExport?: () => void
}

export function AuditLogView({ onExport }: AuditLogViewProps) {
  // Panggil permission hook untuk membatasi akses halaman Audit Log (Khusus Admin)
  const { canViewAuditLog } = usePermission()

  // State Filter Interaktif
  const [selectedEntity, setSelectedEntity] = useState<string>("")
  const [selectedAction, setSelectedAction] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [isExporting, setIsExporting] = useState<boolean>(false)

  // Fetching Data dari Backend Go memakai TanStack Query
  const {
    data: logs = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "audit-logs",
      selectedEntity,
      selectedAction,
      startDate,
      endDate,
    ],
    queryFn: () =>
      auditLogService.getLogs({
        entity: selectedEntity || undefined,
        action: selectedAction || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        pageSize: 50,
      }),
    enabled: canViewAuditLog, // Mencegah request dikirim jika pengguna bukan Admin
  })

  // 1. HANDLER REFRESH DENGAN FEEDBACK ANIMATED
  const handleRefresh = async () => {
    await refetch()
  }

  // 2. HANDLER EXPORT AUDIT LOG MEMANGGIL BACKEND (.XLSX)
  const handleExportExcel = async () => {
    if (onExport) {
      onExport()
      return
    }

    if (isExporting) return
    setIsExporting(true)
    const toastId = toast.loading("Menyiapkan file Excel audit log...")

    try {
      await auditLogService.exportLog({
        entity: selectedEntity || undefined,
        action: selectedAction || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      toast.success("Audit log berhasil diekspor (.xlsx)", { id: toastId })
    } catch (err) {
      console.error("Gagal mengunduh audit log:", err)
      toast.error("Gagal mengekspor data dari server.", { id: toastId })
    } finally {
      setIsExporting(false)
    }
  }

  // Style badge variant
  const getBadgeVariant = (type: string) => {
    switch (type.toUpperCase()) {
      case "UPDATE":
      case "IMPORT_UPDATE":
        return "rusak-ringan" as const
      case "DELETE":
      case "PERMANENT_DELETE":
        return "destructive" as const
      case "CREATE":
        return "bagus" as const
      case "IMPORT":
      case "RESTORE":
      case "MOVE":
      case "SPLIT":
        return "secondary" as const
      default:
        return "outline" as const
    }
  }

  // Tampilan jika pengguna BUKAN Admin (Staff GA / Viewer)
  if (!canViewAuditLog) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 text-neutral-900">
        <Card className="flex max-w-md flex-col items-center border-neutral-200/80 bg-white p-8 text-center shadow-xs">
          <div className="grid size-12 place-items-center rounded-full bg-rose-100 text-rose-600">
            <ShieldAlert size={24} />
          </div>
          <h1 className="mt-4 text-lg font-semibold text-neutral-900">
            Akses Terbatas
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            Halaman Audit Log hanya dapat diakses oleh Admin sistem. Anda tidak
            memiliki izin yang cukup untuk melihat catatan aktivitas ini.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-neutral-50/50 text-neutral-900">
      {/* STICKY HEADER FILTER */}
      <div className="sticky top-0 z-10 mb-6 flex w-full flex-col justify-between gap-4 border-b border-neutral-200/80 bg-white/90 px-4 py-3 shadow-2xs backdrop-blur-md sm:px-6 lg:px-8 xl:flex-row xl:items-center">
        <div className="no-scrollbar w-full overflow-x-auto pb-1 pl-14 lg:pl-0 xl:pb-0">
          <div className="flex min-w-max items-center gap-2 text-xs">
            {/* Filter Entitas */}
            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 font-medium shadow-2xs">
              <span className="text-neutral-500">Entitas:</span>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="cursor-pointer bg-transparent font-semibold text-neutral-900 outline-none"
              >
                <option value="">Semua entitas</option>
                <option value="assets">assets</option>
                <option value="categories">categories</option>
                <option value="brands">brands</option>
                <option value="locations">locations</option>
              </select>
            </div>

            {/* Filter Aksi */}
            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 font-medium shadow-2xs">
              <span className="text-neutral-500">Aksi:</span>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="cursor-pointer bg-transparent font-semibold text-neutral-900 outline-none"
              >
                <option value="">Semua</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="RESTORE">RESTORE</option>
                <option value="IMPORT_CREATE">IMPORT_CREATE</option>
                <option value="IMPORT_UPDATE">IMPORT_UPDATE</option>
                <option value="move">MOVE</option>
                <option value="SPLIT">SPLIT</option>
                <option value="CREATE_SPLIT">CREATE_SPLIT</option>
              </select>
            </div>

            {/* Filter Tanggal */}
            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 font-medium shadow-2xs">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent font-semibold text-neutral-900 outline-none"
              />
              <span className="text-neutral-400">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent font-semibold text-neutral-900 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex w-fit shrink-0 items-center gap-2 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-2 text-xs font-medium text-[#78350F] shadow-2xs">
          Hanya baca — log tidak dapat diubah atau dihapus
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pt-2 pb-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Audit log
            </h1>
            <p className="mt-0.5 text-xs text-neutral-500">
              {logs.length} catatan ditampilkan dari database
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Tombol Refresh */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isFetching}
              onClick={handleRefresh}
              className="gap-1.5 border-neutral-200 bg-white font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <RefreshCw
                size={14}
                className={isFetching ? "animate-spin" : ""}
              />
              <span>{isFetching ? "Memuat..." : "Refresh"}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isExporting}
              onClick={handleExportExcel}
              className="gap-1.5 border-neutral-200 bg-white font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
            >
              <span>{isExporting ? "Mengekspor..." : "Export Excel"}</span>
            </Button>
          </div>
        </div>

        {/* State Handler */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card
                key={i}
                className="flex flex-col justify-between gap-4 border-neutral-200/80 bg-white p-5 md:flex-row"
              >
                <div className="w-full shrink-0 space-y-2 md:w-56">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40 rounded-md" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertDescription>
              Gagal mengambil audit log. Pastikan server backend berjalan.
            </AlertDescription>
          </Alert>
        ) : logs.length === 0 ? (
          <Card className="border-neutral-200/80 bg-white p-12 text-center text-xs text-neutral-500">
            Belum ada rekam jejak aktivitas pada filter ini.
          </Card>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              const targetParts = log.target
                ? log.target.split("·")
                : ["assets", ""]
              const entityName = targetParts[0]?.trim() || "assets"
              const targetCode = targetParts[1]?.trim() || ""

              return (
                <Card
                  key={log.id}
                  className="flex flex-col justify-between gap-4 border-neutral-200/80 bg-white p-5 shadow-2xs md:flex-row"
                >
                  {/* KOLOM KIRI: User Info, Action Badge & Timestamp */}
                  <div className="w-full shrink-0 space-y-1.5 md:w-56">
                    <Badge variant={getBadgeVariant(log.type)}>
                      {log.type.replace("_", " ")}
                    </Badge>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">
                        {log.user.name}
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        {log.user.role} · {log.user.ip}
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-neutral-400">
                        {log.timestamp}
                      </p>
                    </div>
                  </div>

                  {/* KOLOM KANAN: Target & Diff / Description */}
                  <div className="flex-1 space-y-3">
                    {/* Target Label */}
                    <div className="flex justify-start font-mono text-xs font-semibold text-neutral-900 md:justify-start">
                      <span className="font-normal text-neutral-500">
                        {entityName} ·{" "}
                      </span>
                      <span className="ml-1 text-blue-600">{targetCode}</span>
                    </div>

                    {/* Body Content: JSON Diff vs Text Description */}
                    {log.oldValues || log.newValues ? (
                      <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                        {/* OLD VALUES BOX */}
                        <div className="space-y-1 rounded-xl border border-neutral-200 bg-neutral-50 p-3 font-mono text-[11px]">
                          <div className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                            OLD_VALUES
                          </div>
                          <pre className="leading-relaxed whitespace-pre-wrap text-rose-600">
                            {log.oldValues
                              ? JSON.stringify(log.oldValues, null, 2)
                              : "(Kosong)"}
                          </pre>
                        </div>

                        {/* NEW VALUES BOX */}
                        <div className="space-y-1 rounded-xl border border-neutral-200 bg-neutral-50 p-3 font-mono text-[11px]">
                          <div className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                            NEW_VALUES
                          </div>
                          <pre className="leading-relaxed whitespace-pre-wrap text-emerald-600">
                            {log.newValues
                              ? JSON.stringify(log.newValues, null, 2)
                              : "(Kosong)"}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-3 text-xs leading-relaxed text-neutral-700">
                        {log.description}
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
